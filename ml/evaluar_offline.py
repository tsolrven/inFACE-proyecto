#!/usr/bin/env python3
"""Evaluación OFFLINE del recomendador con validación cruzada sobre las interacciones reales.

Idea: se esconde una interacción positiva (like, guardado o postulación) de un usuario y se mira
en qué posición habría quedado ese proyecto entre todos los que el usuario aún no había visto,
según cada algoritmo. Para que no haya "trampa", en cada pliegue se REENTRENAN los clusters sin
las interacciones escondidas.

Algoritmos comparados (de menos a más información):
aleatorio               : línea base (expectativa matemática, sin sorteo)
popularidad             : lo más valorado por todos los demás usuarios (no personalizado)
etiquetas               : el algoritmo original (etiquetas declaradas)
etiquetas+comportamiento: lo anterior + lo que revela lo que el usuario ha hecho
hibrido                 : lo anterior + cluster + lo que hacen los demás de su cluster

Métricas (más alto = mejor): HitRate@k, MRR y NDCG@10. Los empates se tratan por esperanza
matemática (si 5 proyectos empatan, el escondido queda en promedio en medio de ellos).

Uso:
    python evaluar_offline.py                      # 5 pliegues
    python evaluar_offline.py --pliegues 10 --csv salida/offline.csv
"""
import argparse
import csv
import hashlib
import math
import os
import random
import sys

import numpy as np

from config import combinar_parametros
from datos import cargar_datos
from db import conectar
from modelo import (contexto_pares, entrenar, historial_de_usuario, neto_por_cluster,
                    puntaje_senales, puntuar_candidatos, senales_por_usuario)

ALGORITMOS = ["aleatorio", "popularidad", "etiquetas", "etiquetas+comportamiento", "hibrido"]
COMPONENTES = {
    "etiquetas": ("declarado",),
    "etiquetas+comportamiento": ("declarado", "inferido"),
    "hibrido": ("declarado", "inferido", "cluster", "pares"),
}
KS = (1, 3, 5, 10)
EPS = 1e-12


def estadisticas_de_rango(score_p, scores):
    """Métricas esperadas del proyecto escondido, tratando los empates por esperanza."""
    mejores = int(np.sum(scores > score_p + EPS))
    empates = int(np.sum(np.abs(scores - score_p) <= EPS))  # incluye al propio proyecto
    rangos = range(mejores + 1, mejores + empates + 1)
    out = {f"hit@{k}": max(0.0, min(1.0, (k - mejores) / empates)) for k in KS}
    out["mrr"] = float(np.mean([1.0 / r for r in rangos]))
    out["ndcg@10"] = float(np.mean([1.0 / math.log2(r + 1) if r <= 10 else 0.0 for r in rangos]))
    out["rango_esperado"] = float(np.mean(list(rangos)))
    return out


def pares_positivos(datos, pesos):
    por_usuario = senales_por_usuario(datos.senales)
    pares = []
    for uid, d in por_usuario.items():
        for pid, tipos in d.items():
            if puntaje_senales(tipos, pesos) > 0 and datos.proyectos.get(pid):
                pares.append((uid, pid))
    return sorted(pares)


def evaluar_pliegue(datos, escondidos, parametros, k, semilla):
    p = combinar_parametros(parametros)
    pesos = p["pesos_senales"]
    esc = set(escondidos)
    entrenamiento = [s for s in datos.senales if (s[0], s[1]) not in esc]
    modelo = entrenar(datos, entrenamiento, p, k=k, semilla=semilla)
    por_usuario = senales_por_usuario(entrenamiento)
    total_cluster = neto_por_cluster(modelo, por_usuario, pesos)
    tamanos = {}
    for c in modelo.cluster_u.values():
        tamanos[c] = tamanos.get(c, 0) + 1
    # popularidad global (todos los usuarios) por proyecto
    global_neto = {}
    for uid, d in por_usuario.items():
        for pid, tipos in d.items():
            global_neto[pid] = global_neto.get(pid, 0.0) + puntaje_senales(tipos, pesos)

    filas = []
    for uid, pid in escondidos:
        vistos = set(por_usuario.get(uid, {}))
        candidatos = {q: etqs for q, etqs in datos.proyectos.items()
                    if etqs and datos.creador.get(q) != uid and q not in vistos}
        if pid not in candidatos or len(candidatos) < 2:
            continue
        ids = list(candidatos)
        hist = historial_de_usuario(uid, por_usuario, datos.proyectos, pesos)
        cu, neto_pares, hay_pares = contexto_pares(uid, modelo, total_cluster, por_usuario, pesos, tamanos)
        propio = {q: puntaje_senales(t, pesos) for q, t in por_usuario.get(uid, {}).items()}

        scores = {"aleatorio": np.zeros(len(ids)),
                "popularidad": np.array([global_neto.get(q, 0.0) - propio.get(q, 0.0) for q in ids])}
        for nombre, comps in COMPONENTES.items():
            r = puntuar_candidatos(candidatos, datos.usuarios.get(uid, set()), hist, cu,
                                modelo.cluster_p, neto_pares, hay_pares, p, comps)
            scores[nombre] = np.array([r[q][0] for q in ids])
        i = ids.index(pid)
        for alg in ALGORITMOS:
            fila = {"usuario": uid, "proyecto": pid, "algoritmo": alg,
                    "historial": len(hist), "candidatos": len(ids)}
            fila.update(estadisticas_de_rango(scores[alg][i], scores[alg]))
            filas.append(fila)
    return filas, modelo.k


def ic_bootstrap(valores, n=2000, semilla=0):
    rng = np.random.default_rng(semilla)
    v = np.asarray(valores)
    medias = [rng.choice(v, size=len(v), replace=True).mean() for _ in range(n)]
    return float(np.percentile(medias, 2.5)), float(np.percentile(medias, 97.5))


def resumir(filas, titulo):
    print(f"\n== {titulo} ==")
    cab = ["algoritmo", "n"] + [f"hit@{k}" for k in KS] + ["mrr", "ndcg@10"]
    print("  " + "  ".join(f"{c:>24}" if i == 0 else f"{c:>8}" for i, c in enumerate(cab)))
    res = {}
    for alg in ALGORITMOS:
        f = [x for x in filas if x["algoritmo"] == alg]
        if not f:
            continue
        medias = {m: np.mean([x[m] for x in f]) for m in cab[2:]}
        res[alg] = (f, medias)
        print("  " + f"{alg:>24}" + "  " + f"{len(f):>8}" + "  " + "  ".join(f"{medias[m]:8.3f}" for m in cab[2:]))
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pliegues", type=int, default=5)
    ap.add_argument("--k", type=int, help="fuerza k de los clusters en cada pliegue")
    ap.add_argument("--semilla", type=int, default=42)
    ap.add_argument("--min-historial", type=int, default=3,
                    help="para el segundo resumen: usuarios con al menos este historial")
    ap.add_argument("--pesos", metavar="a=0.3,b=...",
                    help="prueba otros pesos del puntaje híbrido, p. ej. declarado=0.3,inferido=0.4,cluster=0.1,pares=0.2")
    ap.add_argument("--csv", metavar="RUTA")
    args = ap.parse_args()

    with conectar() as conn, conn.cursor() as cur:
        datos = cargar_datos(cur)
    p = combinar_parametros()
    if args.pesos:
        p["pesos_puntaje"].update({k: float(v) for k, v in (x.split("=") for x in args.pesos.split(","))})
        print(f"Pesos del puntaje: {p['pesos_puntaje']}\n(Ojo: afinar pesos con los mismos datos con que luego evalúas infla el resultado; usa usuarios distintos.)")
    pares = pares_positivos(datos, p["pesos_senales"])
    print(f"{len(datos.usuarios)} usuarios, {len(datos.proyectos)} proyectos, "
        f"{len(datos.senales)} señales, {len(pares)} interacciones positivas evaluables")
    if len(pares) < 10:
        print("Hay muy pocas interacciones positivas (menos de 10) para evaluar. Junta más datos "
            "(mira estado_datos.py) y vuelve a correrlo.")
        sys.exit(2)

    rnd = random.Random(args.semilla)
    rnd.shuffle(pares)
    n_pl = max(2, min(args.pliegues, len(pares) // 2))
    todas, ks = [], []
    for i in range(n_pl):
        escondidos = pares[i::n_pl]
        filas, k = evaluar_pliegue(datos, escondidos, p, args.k, args.semilla)
        todas.extend(filas)
        ks.append(k)
        print(f"  pliegue {i + 1}/{n_pl}: {len(escondidos)} escondidos, k={k}")

    res = resumir(todas, f"Todos los casos ({len(todas) // len(ALGORITMOS)})")
    con_hist = [x for x in todas if x["historial"] >= args.min_historial]
    if con_hist:
        resumir(con_hist, f"Solo usuarios con historial >= {args.min_historial} ({len(con_hist) // len(ALGORITMOS)})")

    # comparaciones del algoritmo completo contra el original (mismos casos => prueba pareada)
    if "hibrido" in res and "etiquetas" in res:
        from scipy.stats import wilcoxon

        h = {(x["usuario"], x["proyecto"]): x["mrr"] for x in res["hibrido"][0]}
        e = {(x["usuario"], x["proyecto"]): x["mrr"] for x in res["etiquetas"][0]}
        claves = sorted(set(h) & set(e))
        d = np.array([h[c] - e[c] for c in claves])
        lo, hi = ic_bootstrap(d)
        print(f"\nhibrido - etiquetas (MRR, {len(d)} casos): diferencia media {d.mean():+.4f}, "
            f"IC95% bootstrap [{lo:+.4f}, {hi:+.4f}]")
        if np.count_nonzero(d) >= 10:
            print(f"  Wilcoxon pareado: p = {wilcoxon(d).pvalue:.4f}")
        else:
            print("  (muy pocas diferencias distintas de cero para una prueba de Wilcoxon)")

    print("\nCÓMO LEERLO (limitaciones que debes declarar en la tesis):")
    print("  - Las interacciones solo existen sobre proyectos que el sistema mostró; si el mazo ya estaba")
    print("    sesgado por un algoritmo, esa preferencia queda 'incrustada' en los datos (sesgo de exposición).")
    print("  - Con pocos usuarios los intervalos son anchos: una diferencia sin significancia no es 'cero'.")
    print("  - Offline mide acierto sobre el pasado; la evaluación online (evaluar.py) mide el uso real.")

    if args.csv:
        os.makedirs(os.path.dirname(args.csv) or ".", exist_ok=True)
        salt = os.environ.get("SALT_ANONIMIZACION", "cambia-esta-sal")
        anon = lambda s: hashlib.sha256((salt + s).encode()).hexdigest()[:12]  # noqa: E731
        with open(args.csv, "w", newline="") as f:
            w = csv.writer(f)
            cols = ["usuario", "proyecto", "algoritmo", "historial", "candidatos"] + [f"hit@{k}" for k in KS] + ["mrr", "ndcg@10", "rango_esperado"]
            w.writerow(cols)
            for x in todas:
                w.writerow([anon(x["usuario"]), anon(x["proyecto"])] + [x[c] for c in cols[2:]])
        print(f"\nDetalle (usuarios anonimizados) en {args.csv}")


if __name__ == "__main__":
    main()