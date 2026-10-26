#!/usr/bin/env python3
"""Informe del estado de la recolección de datos: ¿ya hay suficiente para entrenar y evaluar?

Úsalo todos los días mientras los usuarios de prueba usan la app.

Uso:
    python estado_datos.py
    python estado_datos.py --min-usuarios 30 --min-decisiones 15
"""
import argparse
from datetime import datetime, timezone

from config import NEGATIVAS, POSITIVAS
from db import conectar


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--min-usuarios", type=int, default=30, help="usuarios con consentimiento y etiquetas")
    ap.add_argument("--min-decisiones", type=int, default=15, help="decisiones (like/guardar/descartar/postular) por usuario, en promedio")
    ap.add_argument("--min-positivas", type=int, default=100, help="interacciones positivas totales para la evaluación offline")
    ap.add_argument("--min-proyectos", type=int, default=25, help="proyectos abiertos (para que el mazo no se agote)")
    args = ap.parse_args()

    with conectar() as conn, conn.cursor() as cur:
        def q(sql, *a):
            cur.execute(sql, a)
            return cur.fetchall()

        usuarios = q("SELECT count(*) FILTER (WHERE esta_activo), count(*) FILTER (WHERE esta_activo AND consentimiento_investigacion), count(*) FILTER (WHERE esta_activo AND terminos_version IS NOT NULL) FROM usuarios")[0]
        con_etq = q("SELECT count(DISTINCT ue.usuario_id) FROM usuario_etiquetas ue JOIN usuarios u ON u.id = ue.usuario_id WHERE u.esta_activo AND u.consentimiento_investigacion")[0][0]
        proyectos = q("SELECT count(*), count(*) FILTER (WHERE estado_proyecto = 'abierto') FROM proyectos")[0]
        eventos = dict(q("SELECT tipo, count(*) FROM interaccion_proyecto_log GROUP BY tipo"))
        por_usuario = q("""SELECT e.usuario_id, count(*)
                        FROM interaccion_proyecto_log e JOIN usuarios u ON u.id = e.usuario_id
                        WHERE u.consentimiento_investigacion AND e.tipo = ANY(%s)
                        GROUP BY e.usuario_id""", list(POSITIVAS) + list(NEGATIVAS))
        servidas = dict(q("SELECT algoritmo, count(*) FROM recomendacion_log GROUP BY algoritmo"))
        modelo = q("SELECT version, k, silueta, n_usuarios, n_proyectos, entrenado_en FROM modelos_cluster WHERE activo ORDER BY entrenado_en DESC LIMIT 1")
        ult7 = q("SELECT date_trunc('day', creado_en)::date, count(*) FROM interaccion_proyecto_log WHERE creado_en > now() - interval '7 days' GROUP BY 1 ORDER BY 1")

    print("=== USUARIOS ===")
    print(f"  activos: {usuarios[0]}   aceptaron los términos: {usuarios[2]}   aceptaron investigación: {usuarios[1]}")
    print(f"  con consentimiento Y etiquetas elegidas: {con_etq}")
    print("=== PROYECTOS ===")
    print(f"  total: {proyectos[0]}   abiertos: {proyectos[1]}")
    print("=== INTERACCIONES (registro histórico) ===")
    for t in ("like", "dislike", "favorito", "descarte", "postulacion", "comentario", "voto_quitado", "favorito_quitado"):
        print(f"  {t:<17}{eventos.get(t, 0):>6}")
    positivas = sum(eventos.get(t, 0) for t in POSITIVAS)
    negativas = sum(eventos.get(t, 0) for t in NEGATIVAS)
    print(f"  => positivas: {positivas}   negativas: {negativas}")
    print("=== RECOMENDACIONES MOSTRADAS ===")
    print("  " + (", ".join(f"{a}: {n}" for a, n in sorted(servidas.items())) or "ninguna todavía"))
    print("=== ÚLTIMOS 7 DÍAS (interacciones por día) ===")
    print("  " + (", ".join(f"{d}: {n}" for d, n in ult7) or "sin actividad"))
    print("=== MODELO ACTIVO ===")
    if modelo:
        v, k, sil, nu, np_, cuando = modelo[0]
        # Prisma guarda las fechas en UTC sin zona horaria
        dias = (datetime.now(timezone.utc).replace(tzinfo=None) - cuando.replace(tzinfo=None)).days
        print(f"  {v}: k={k}, silueta={sil if sil is None else round(sil, 3)}, {nu} usuarios, {np_} proyectos (hace {dias} días)")
    else:
        print("  ninguno todavía (la app funciona con etiquetas + comportamiento)")

    n_dec = [n for _, n in por_usuario]
    prom = sum(n_dec) / len(n_dec) if n_dec else 0
    checks = [
        (con_etq >= args.min_usuarios, f"usuarios con consentimiento y etiquetas: {con_etq} / {args.min_usuarios}"),
        (proyectos[1] >= args.min_proyectos, f"proyectos abiertos: {proyectos[1]} / {args.min_proyectos}"),
        (prom >= args.min_decisiones, f"decisiones por usuario (promedio): {prom:.1f} / {args.min_decisiones}"),
        (positivas >= args.min_positivas, f"interacciones positivas: {positivas} / {args.min_positivas}"),
        (len({a for a in servidas}) >= 2, "se han mostrado proyectos de ambos algoritmos"),
    ]
    print("\n=== ¿LISTO PARA ENTRENAR Y EVALUAR? ===")
    for ok, texto in checks:
        print(f"  [{'x' if ok else ' '}] {texto}")
    if all(ok for ok, _ in checks):
        print("\n  Listo: python entrenar_clusters.py  →  python evaluar_offline.py  →  python evaluar.py")
    else:
        print("\n  Aún falta: sigue invitando usuarios / pídeles que usen Descubrir (ver la guía de usuarios de prueba).")


if __name__ == "__main__":
    main()