#!/usr/bin/env python3
"""Evaluación ONLINE: compara "etiquetas" contra "híbrido" con lo que los usuarios hicieron de verdad.

El mazo de Descubrir mezcla los dos algoritmos turnándose (interleaving) y recomendacion_log anota
cuál propuso cada proyecto. Como CADA usuario ve y evalúa ambos, la comparación se hace dentro de
cada usuario, lo que da más poder estadístico con pocos usuarios.

Reacción del usuario ante un proyecto mostrado = su PRIMERA decisión después de verlo:
positiva: like, guardado (favorito) o postulación      negativa: dislike o descarte
Tasa de aceptación = positivas / (positivas + negativas). Lo que el usuario ignoró no cuenta como
rechazo (no sabemos si lo vio), por eso se reporta aparte la "tasa de decisión".

Solo se usan usuarios que aceptaron participar en la investigación.

Uso:
    python evaluar.py
    python evaluar.py --csv salida/log_anonimo.csv
"""
import argparse
import csv
import hashlib
import math
import os

from config import NEGATIVAS, POSITIVAS
from db import conectar


def wilson(exitos, n, z=1.96):
    if n == 0:
        return (float("nan"), float("nan"))
    p = exitos / n
    den = 1 + z * z / n
    centro = (p + z * z / (2 * n)) / den
    margen = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return (centro - margen, centro + margen)


def cargar(cur, incluir_sin_consentimiento):
    filtro = "" if incluir_sin_consentimiento else "AND u.consentimiento_investigacion"
    cur.execute(
        f"""SELECT r.usuario_id, r.proyecto_id, r.algoritmo, r.posicion, r.puntaje, r.servido_en
            FROM recomendacion_log r JOIN usuarios u ON u.id = r.usuario_id
            WHERE true {filtro}"""
    )
    servidas = cur.fetchall()
    cur.execute(
        f"""SELECT e.usuario_id, e.proyecto_id, e.tipo, e.creado_en
            FROM interaccion_proyecto_log e JOIN usuarios u ON u.id = e.usuario_id
            WHERE true {filtro} ORDER BY e.creado_en"""
    )
    eventos = {}
    for uid, pid, tipo, cuando in cur.fetchall():
        eventos.setdefault((uid, pid), []).append((cuando, tipo))
    return servidas, eventos


def reaccion(servido_en, eventos):
    """(decision: 1/0/None, comento: bool) usando los eventos posteriores a que se mostró."""
    decision, comento = None, False
    for cuando, tipo in eventos:
        if cuando < servido_en:
            continue
        if decision is None and tipo in POSITIVAS:
            decision = 1
        elif decision is None and tipo in NEGATIVAS:
            decision = 0
        if tipo == "comentario":
            comento = True
    return decision, comento


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--csv", metavar="ARCHIVO", help="exporta el detalle con usuarios anonimizados")
    ap.add_argument("--incluir-sin-consentimiento", action="store_true",
                    help="NO recomendado: incluye usuarios que no aceptaron la investigación")
    args = ap.parse_args()

    with conectar() as conn, conn.cursor() as cur:
        servidas, eventos = cargar(cur, args.incluir_sin_consentimiento)

    filas = []
    for uid, pid, algo, pos, pun, servido_en in servidas:
        dec, com = reaccion(servido_en, eventos.get((uid, pid), []))
        filas.append((uid, pid, algo, pos, pun, dec, com))

    usuarios = {f[0] for f in filas}
    print(f"{len(filas)} proyectos mostrados a {len(usuarios)} usuarios (con consentimiento de investigación).")
    if not filas:
        print("Todavía no hay datos. Revisa estado_datos.py.")
        return

    por_algo, por_usuario = {}, {}
    for uid, _p, algo, pos, _pun, dec, com in filas:
        a = por_algo.setdefault(algo, {"servidas": 0, "decididas": 0, "aceptadas": 0, "comentadas": 0, "pos_aceptadas": []})
        a["servidas"] += 1
        a["comentadas"] += com
        if dec is not None:
            a["decididas"] += 1
            a["aceptadas"] += dec
            if dec:
                a["pos_aceptadas"].append(pos)
            u = por_usuario.setdefault(uid, {}).setdefault(algo, [0, 0])
            u[0] += dec
            u[1] += 1

    print(f"\n{'algoritmo':<11}{'mostradas':>10}{'decididas':>10}{'tasa decisión':>15}{'aceptadas':>10}{'aceptación':>12}   IC 95% (Wilson)   {'comentadas':>10}")
    for algo in sorted(por_algo):
        a = por_algo[algo]
        n, ok = a["decididas"], a["aceptadas"]
        lo, hi = wilson(ok, n)
        acept = f"{ok / n:>11.1%}" if n else f"{'—':>11}"
        print(f"{algo:<11}{a['servidas']:>10}{n:>10}{n / a['servidas']:>15.1%}{ok:>10}{acept}    [{lo:.1%}, {hi:.1%}]    {a['comentadas']:>10}")

    # comparación pareada: solo usuarios que decidieron sobre proyectos de ambos algoritmos
    difs = []
    for algos in por_usuario.values():
        if "etiquetas" in algos and "hibrido" in algos:
            (oe, ne), (oh, nh) = algos["etiquetas"], algos["hibrido"]
            difs.append(oh / nh - oe / ne)
    print(f"\nUsuarios que decidieron sobre ambos algoritmos: {len(difs)}")
    if difs:
        print(f"Diferencia media de aceptación (híbrido - etiquetas): {sum(difs) / len(difs):+.1%}")
    if len(difs) >= 6 and any(d != 0 for d in difs):
        from scipy.stats import wilcoxon

        p = wilcoxon(difs).pvalue
        print(f"Prueba de Wilcoxon pareada: p = {p:.3f}  ({'significativa' if p < 0.05 else 'no significativa'} al 5%)")
    else:
        print("(muy pocos usuarios pareados para una prueba estadística; sigue recolectando datos)")

    print("\nCÓMO LEERLO:")
    print("  - Es una comparación DENTRO de cada usuario (mismo gusto, mismo día): por eso sirve con pocos usuarios.")
    print("  - Si en un mazo ambos rankings coinciden, el proyecto se asigna a uno de los dos al azar: no sesga.")
    print("  - Mientras no exista un modelo de clusters entrenado, 'híbrido' usa solo etiquetas + comportamiento.")

    if args.csv:
        sal = os.environ.get("SALT_ANONIMIZACION", "cambia-esta-sal")
        os.makedirs(os.path.dirname(args.csv) or ".", exist_ok=True)
        with open(args.csv, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["usuario_anonimo", "algoritmo", "posicion", "puntaje", "decision", "comento"])
            for uid, _p, algo, pos, pun, dec, com in filas:
                h = hashlib.sha256((sal + uid).encode()).hexdigest()[:12]
                w.writerow([h, algo, pos, round(pun, 4), "" if dec is None else dec, int(com)])
        print(f"\nCSV anonimizado guardado en {args.csv}")


if __name__ == "__main__":
    main()