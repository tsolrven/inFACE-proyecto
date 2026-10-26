import math
from dataclasses import dataclass, field

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from config import combinar_parametros


@dataclass
class Datos:
    etiquetas: list  # [(id, nombre)]
    usuarios: dict  # uid -> set(etiqueta_id) declaradas
    consentimiento: dict  # uid -> bool (investigación)
    proyectos: dict  # pid -> list(etiqueta_id)
    creador: dict  # pid -> uid
    estado: dict  # pid -> 'abierto'|...
    senales: list = field(default_factory=list)  # [(uid, pid, tipo)]


def senales_por_usuario(senales, excluir_pares=()):
    """uid -> pid -> set(tipos). `excluir_pares`: {(uid, pid)} cuyas señales se ignoran."""
    excluir = set(excluir_pares)
    salida = {}
    for uid, pid, tipo in senales:
        if (uid, pid) in excluir:
            continue
        salida.setdefault(uid, {}).setdefault(pid, set()).add(tipo)
    return salida


def puntaje_senales(tipos, pesos_senales):
    return sum(pesos_senales.get(t, 0.0) for t in tipos)

def _sigmoide01(x, escala):
    return (math.tanh(x / escala) + 1.0) / 2.0


def componente_declarado(etiquetas_proyecto, mis_etiquetas):
    if not etiquetas_proyecto:
        return 0.0
    return sum(1 for e in etiquetas_proyecto if e in mis_etiquetas) / len(etiquetas_proyecto)


def afinidad_por_etiqueta(historial):
    """historial: [(etiquetas, puntaje)] -> dict etiqueta -> suma de puntajes."""
    afinidad = {}
    for etiquetas, puntaje in historial:
        for e in etiquetas:
            afinidad[e] = afinidad.get(e, 0.0) + puntaje
    return afinidad


def componente_inferido(etiquetas_proyecto, afinidad, escala):
    if not afinidad or not etiquetas_proyecto:
        return None
    suma = sum(afinidad.get(e, 0.0) for e in etiquetas_proyecto)
    return _sigmoide01(suma / len(etiquetas_proyecto), escala)


def componente_cluster(cluster_usuario, cluster_proyecto):
    if cluster_usuario is None or cluster_proyecto is None:
        return None
    return 1.0 if cluster_usuario == cluster_proyecto else 0.0


def componente_pares(neto, hay_pares, escala):
    if not hay_pares:
        return None
    return _sigmoide01(neto or 0.0, escala)


def combinar(componentes, pesos):
    suma = total = 0.0
    for nombre, valor in componentes.items():
        if valor is None:
            continue
        suma += pesos[nombre] * valor
        total += pesos[nombre]
    return suma / total if total > 0 else 0.0

def puntuar_candidatos(candidatos, mis_etiquetas, historial, cluster_usuario,
                    cluster_de_proyecto, neto_pares, hay_pares, parametros=None,
                    componentes=("declarado", "inferido", "cluster", "pares")):
    """candidatos: {pid: [etiquetas]} -> {pid: (puntaje, componentes)}.
    `componentes` permite desactivar partes (ablación) para la evaluación offline."""
    p = combinar_parametros(parametros)
    afinidad = afinidad_por_etiqueta(historial)
    salida = {}
    for pid, etqs in candidatos.items():
        comp = {
            "declarado": componente_declarado(etqs, mis_etiquetas),
            "inferido": componente_inferido(etqs, afinidad, p["escala_inferido"]),
            "cluster": componente_cluster(cluster_usuario, cluster_de_proyecto.get(pid)),
            "pares": componente_pares(neto_pares.get(pid), hay_pares, p["escala_pares"]),
        }
        comp = {k: (v if k in componentes else None) for k, v in comp.items()}
        salida[pid] = (combinar(comp, p["pesos_puntaje"]), comp)
    return salida

def historial_de_usuario(uid, por_usuario, proyectos, pesos_senales):
    """[(etiquetas del proyecto, puntaje de sus señales)] para los proyectos con los que interactuó."""
    salida = []
    for pid, tipos in por_usuario.get(uid, {}).items():
        etqs = proyectos.get(pid)
        puntaje = puntaje_senales(tipos, pesos_senales)
        if etqs and puntaje != 0:
            salida.append((etqs, puntaje))
    return salida


def vector_usuario(declaradas, afinidad, col, lam, escala):
    """Etiquetas declaradas (0/1) + lam * tanh(afinidad/escala): el comportamiento afina el perfil."""
    v = np.zeros(len(col))
    for e in declaradas:
        if e in col:
            v[col[e]] = 1.0
    if lam:
        for e, a in afinidad.items():
            if e in col:
                v[col[e]] += lam * math.tanh(a / escala)
    return v

@dataclass
class Modelo:
    k: int
    km: object
    ids_u: list
    ids_p: list
    X: np.ndarray
    etiquetas: list
    tabla: list  # [(k, silueta)]
    cluster_u: dict
    cluster_p: dict
    dist: np.ndarray
    parametros: dict


def construir_matriz(datos, por_usuario, parametros, usar_senales=True):
    p = combinar_parametros(parametros)
    col = {e[0]: i for i, e in enumerate(datos.etiquetas)}
    lam = p["lambda_perfil"] if usar_senales else 0.0
    ids_u, filas_u = [], []
    for uid in sorted(datos.usuarios):
        declaradas = datos.usuarios[uid]
        hist = historial_de_usuario(uid, por_usuario, datos.proyectos, p["pesos_senales"])
        if not declaradas and not hist:
            continue  # sin etiquetas ni comportamiento: no hay nada que agrupar
        aff = afinidad_por_etiqueta(hist)
        ids_u.append(uid)
        filas_u.append(vector_usuario(declaradas, aff, col, lam, p["escala_inferido"]))
    ids_p = [pid for pid in sorted(datos.proyectos) if datos.proyectos[pid]]
    filas_p = []
    for pid in ids_p:
        v = np.zeros(len(col))
        for e in datos.proyectos[pid]:
            if e in col:
                v[col[e]] = 1.0
        filas_p.append(v)
    X = np.vstack(filas_u + filas_p) if (filas_u or filas_p) else np.zeros((0, len(col)))
    return ids_u, ids_p, X


def elegir_k(X, k_min, k_max, k_forzado, semilla):
    distintos = len(np.unique(X, axis=0))
    tope = min(k_max, distintos, len(X) - 1)
    rango = [k_forzado] if k_forzado else range(k_min, tope + 1)
    tabla, modelos = [], {}
    for k in rango:
        if k > distintos:
            raise ValueError(f"k={k} es mayor que la cantidad de perfiles distintos ({distintos}).")
        km = KMeans(n_clusters=k, n_init=10, random_state=semilla).fit(X)
        modelos[k] = km
        sil = silhouette_score(X, km.labels_) if len(set(km.labels_)) > 1 else float("nan")
        tabla.append((k, float(sil)))
    if not tabla:
        raise ValueError("No hay perfiles suficientes para probar al menos 2 clusters.")
    mejor = max(tabla, key=lambda t: -1 if math.isnan(t[1]) else t[1])[0]
    return mejor, modelos[mejor], tabla


def entrenar(datos, senales, parametros=None, k=None, k_min=2, k_max=8, semilla=42,
            usar_senales=True, excluir_pares=()):
    p = combinar_parametros(parametros)
    por_usuario = senales_por_usuario(senales, excluir_pares)
    ids_u, ids_p, X = construir_matriz(datos, por_usuario, p, usar_senales)
    if len(X) < 4:
        raise ValueError("Hay muy pocos perfiles para agrupar (mínimo 4).")
    k, km, tabla = elegir_k(X, k_min, k_max, k, semilla)
    dist = km.transform(X)[np.arange(len(X)), km.labels_]
    n_u = len(ids_u)
    return Modelo(
        k=k, km=km, ids_u=ids_u, ids_p=ids_p, X=X, etiquetas=datos.etiquetas, tabla=tabla,
        cluster_u={u: int(km.labels_[i]) for i, u in enumerate(ids_u)},
        cluster_p={pid: int(km.labels_[n_u + i]) for i, pid in enumerate(ids_p)},
        dist=dist, parametros=p,
    )

def neto_por_cluster(modelo, por_usuario, pesos_senales):
    """cluster -> pid -> suma de puntajes de las señales de todos los usuarios del cluster."""
    total = {}
    for uid, c in modelo.cluster_u.items():
        for pid, tipos in por_usuario.get(uid, {}).items():
            d = total.setdefault(c, {})
            d[pid] = d.get(pid, 0.0) + puntaje_senales(tipos, pesos_senales)
    return total


def contexto_pares(uid, modelo, total_cluster, por_usuario, pesos_senales, tamanos):
    """Neto de los DEMÁS usuarios de mi cluster por proyecto (resta mi propia contribución)."""
    c = modelo.cluster_u.get(uid)
    if c is None:
        return None, {}, False
    neto = dict(total_cluster.get(c, {}))
    for pid, tipos in por_usuario.get(uid, {}).items():
        if pid in neto:
            neto[pid] -= puntaje_senales(tipos, pesos_senales)
    return c, neto, tamanos.get(c, 0) > 1