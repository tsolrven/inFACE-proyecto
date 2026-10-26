#!/usr/bin/env python3
"""Entrena los clusters (K-Means) de usuarios y proyectos y los guarda en Postgres.

Cada proyecto es un vector binario de etiquetas. Cada usuario es un vector sobre las MISMAS
etiquetas: las que declaró (0/1) más un ajuste que sale de su comportamiento (votos,
guardados, descartes, comentarios, postulaciones). Se ajusta UN solo K-Means con todos juntos,
así un usuario y un proyecto del mismo cluster tienen perfiles parecidos.

Uso:
    python entrenar_clusters.py                    # elige k con el coeficiente de silueta (2..8)
    python entrenar_clusters.py --k 4              # fuerza k
    python entrenar_clusters.py --sin-comportamiento   # solo etiquetas declaradas (para comparar)
    python entrenar_clusters.py --figuras salida   # además guarda gráficos para la tesis
    python entrenar_clusters.py --dry-run          # muestra el resultado sin escribir en la BD
"""
import argparse
import csv
import json
import os
import sys
import uuid
from datetime import datetime, timezone

import numpy as np
from psycopg.types.json import Jsonb

from datos import cargar_datos
from db import conectar
from modelo import entrenar


def describir(modelo, datos, top=5):
    nombre = [e[1] for e in modelo.etiquetas]
    n_u = len(modelo.ids_u)
    labels = modelo.km.labels_
    print("\n== Clusters ==")
    for c in range(modelo.k):
        pesos = modelo.km.cluster_centers_[c]
        orden = np.argsort(-pesos)[:top]
        tipicas = ", ".join(f"{nombre[i]} ({pesos[i]:.2f})" for i in orden if pesos[i] > 0.05)
        print(
            f"  Cluster {c}: {int((labels[:n_u] == c).sum())} usuarios, "
            f"{int((labels[n_u:] == c).sum())} proyectos\n      etiquetas típicas: {tipicas}"
        )


def guardar_figuras(carpeta, modelo):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from sklearn.decomposition import PCA

    os.makedirs(carpeta, exist_ok=True)
    ks = [t[0] for t in modelo.tabla]
    sils = [t[1] for t in modelo.tabla]
    plt.figure(figsize=(5, 3.2))
    plt.plot(ks, sils, marker="o")
    plt.xlabel("k (número de clusters)")
    plt.ylabel("Coeficiente de silueta")
    plt.title("Elección de k")
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(carpeta, "silueta_vs_k.png"), dpi=200)
    plt.close()

    # PCA solo para dibujar en 2D; el clustering se hizo en el espacio original
    Z = PCA(n_components=2, random_state=0).fit_transform(modelo.X)
    n_u = len(modelo.ids_u)
    plt.figure(figsize=(5.5, 4.2))
    for marcador, sl, nombre in (("o", slice(0, n_u), "usuarios"), ("^", slice(n_u, None), "proyectos")):
        plt.scatter(Z[sl, 0], Z[sl, 1], c=modelo.km.labels_[sl], cmap="tab10", marker=marcador,
                    vmin=0, vmax=9, edgecolors="k", linewidths=0.4, alpha=0.8, label=nombre)
    plt.legend()
    plt.title(f"Clusters (k={modelo.k}) proyectados con PCA")
    plt.tight_layout()
    plt.savefig(os.path.join(carpeta, "clusters_pca.png"), dpi=200)
    plt.close()
    with open(os.path.join(carpeta, "silueta_vs_k.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["k", "silueta"])
        w.writerows(modelo.tabla)
    print(f"\nFiguras guardadas en {carpeta}/")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--k", type=int, help="fuerza este k en vez de elegirlo por silueta")
    ap.add_argument("--k-min", type=int, default=2)
    ap.add_argument("--k-max", type=int, default=8)
    ap.add_argument("--semilla", type=int, default=42)
    ap.add_argument("--sin-comportamiento", action="store_true",
                    help="el perfil del usuario usa solo las etiquetas que declaró")
    ap.add_argument("--figuras", metavar="CARPETA")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with conectar() as conn, conn.cursor() as cur:
        datos = cargar_datos(cur)
        print(
            f"Datos: {len(datos.usuarios)} usuarios activos, {len(datos.proyectos)} proyectos, "
            f"{len(datos.etiquetas)} etiquetas, {len(datos.senales)} señales de interacción"
        )
        try:
            modelo = entrenar(datos, datos.senales, k=args.k, k_min=args.k_min, k_max=args.k_max,
                            semilla=args.semilla, usar_senales=not args.sin_comportamiento)
        except ValueError as e:
            print(f"No se entrenó nada: {e}")
            sys.exit(2)

        print(f"\nPerfiles usados: {len(modelo.ids_u)} usuarios + {len(modelo.ids_p)} proyectos")
        print("\nSilueta por k:")
        for kk, s in modelo.tabla:
            print(f"  k={kk}: {s:.3f}{'  <- elegido' if kk == modelo.k else ''}")
        describir(modelo, datos)
        if args.figuras:
            guardar_figuras(args.figuras, modelo)

        if args.dry_run:
            print("\n--dry-run: no se escribió nada en la base de datos.")
            return

        silueta = dict(modelo.tabla)[modelo.k]
        modelo_id = str(uuid.uuid4())
        # Prisma guarda las fechas en UTC sin zona horaria: se escribe igual
        ahora = datetime.now(timezone.utc).replace(tzinfo=None)
        version = f"{ahora.strftime('%Y%m%dT%H%M%SZ')}-k{modelo.k}"
        n_u = len(modelo.ids_u)
        parametros = dict(modelo.parametros)
        parametros.update({
            "usar_comportamiento": not args.sin_comportamiento,
            "semilla": args.semilla,
            "n_senales": len(datos.senales),
            "tamanos_cluster": {str(c): int(sum(1 for v in modelo.cluster_u.values() if v == c)) for c in range(modelo.k)},
        })

        cur.execute(
            """INSERT INTO modelos_cluster
            (id, version, k, silueta, n_usuarios, n_proyectos, etiquetas, centroides, parametros, activo, entrenado_en)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,false,%s)""",
            (modelo_id, version, modelo.k, None if np.isnan(silueta) else float(silueta), n_u,
            len(modelo.ids_p), Jsonb([e[0] for e in modelo.etiquetas]),
            Jsonb(modelo.km.cluster_centers_.round(4).tolist()), Jsonb(parametros), ahora),
        )
        cur.executemany(
            "INSERT INTO cluster_usuario (modelo_id, usuario_id, cluster, distancia) VALUES (%s,%s,%s,%s)",
            [(modelo_id, uid, modelo.cluster_u[uid], float(modelo.dist[i])) for i, uid in enumerate(modelo.ids_u)],
        )
        cur.executemany(
            "INSERT INTO cluster_proyecto (modelo_id, proyecto_id, cluster, distancia) VALUES (%s,%s,%s,%s)",
            [(modelo_id, pid, modelo.cluster_p[pid], float(modelo.dist[n_u + i])) for i, pid in enumerate(modelo.ids_p)],
        )
        # solo el modelo recién creado queda activo (los anteriores se conservan como historial)
        cur.execute("UPDATE modelos_cluster SET activo = (id = %s)", (modelo_id,))
        conn.commit()
        print(f"\nModelo {version} guardado y activado (k={modelo.k}).")


if __name__ == "__main__":
    main()