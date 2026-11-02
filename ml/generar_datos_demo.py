#!/usr/bin/env python3
"""Genera usuarios, proyectos e interacciones FICTICIOS para ensayar todo el flujo
(entrenar, evaluar, estado_datos) antes de tener usuarios reales.

SOLO PARA UNA BASE DE PRUEBAS. Se niega a correr si DATABASE_URL no apunta a localhost,
salvo que agregues --confirmo-que-no-es-produccion. Todo lo que crea se reconoce por
el correo '...@demo.invalid' y el título 'Proyecto demo N', y se borra con --limpiar. Los números que salgan de datos ficticios NO son
resultados de la tesis.

Uso:
    python generar_datos_demo.py --usuarios 40 --proyectos 30
    python generar_datos_demo.py --limpiar
"""
import argparse
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit

from db import conectar

DOMINIO = "@demo.invalid"
NAMESPACE = uuid.UUID("6f1c2d3e-0000-4000-8000-00000000d3a0")  # ids deterministas (UUID válidos)


def uid_demo(i):
    return str(uuid.uuid5(NAMESPACE, f"usuario-{i}"))


def pid_demo(j):
    return str(uuid.uuid5(NAMESPACE, f"proyecto-{j}"))


def comprobar_entorno(confirmado):
    host = urlsplit(os.environ.get("DATABASE_URL", "")).hostname or ""
    if host not in ("localhost", "127.0.0.1", "::1") and not confirmado:
        raise SystemExit(
            f"Me niego: DATABASE_URL apunta a '{host}', no a localhost. Esto crea datos falsos.\n"
            "Si estás SEGURO de que es una base de pruebas, agrega --confirmo-que-no-es-produccion."
        )


def limpiar(cur):
    cur.execute("SELECT id FROM usuarios WHERE correo LIKE %s", ("%" + DOMINIO,))
    us = [r[0] for r in cur.fetchall()]
    cur.execute("SELECT id FROM proyectos WHERE titulo_proyecto LIKE 'Proyecto demo %'")
    ps = [r[0] for r in cur.fetchall()]
    # eventos y comentarios de usuarios demo, y todo lo que cuelga de proyectos demo
    for tabla, col in (("interaccion_proyecto_log", "usuario_id"), ("recomendacion_log", "usuario_id"),
                       ("votos", "usuario_id"), ("comentarios", "autor_id"), ("favoritos_proyecto", "usuario_id"),
                       ("descartes_proyecto", "usuario_id"), ("postulaciones_proyecto", "postulante_id"),
                       ("usuario_etiquetas", "usuario_id"), ("perfiles", "usuario_id")):
        cur.execute(f"DELETE FROM {tabla} WHERE {col} = ANY(%s)", (us,))
    for tabla, col in (("interaccion_proyecto_log", "proyecto_id"), ("recomendacion_log", "proyecto_id"),
                       ("favoritos_proyecto", "proyecto_id"), ("descartes_proyecto", "proyecto_id"),
                       ("postulaciones_proyecto", "proyecto_id"), ("proyecto_etiquetas", "proyecto_id")):
        cur.execute(f"DELETE FROM {tabla} WHERE {col} = ANY(%s)", (ps,))
    cur.execute("DELETE FROM votos WHERE tipo_contenido = 'proyecto' AND contenido_id = ANY(%s)", (ps,))
    cur.execute("DELETE FROM comentarios WHERE tipo_contenido = 'proyecto' AND contenido_id = ANY(%s)", (ps,))
    cur.execute("DELETE FROM proyectos WHERE id = ANY(%s)", (ps,))
    cur.execute("DELETE FROM usuarios WHERE id = ANY(%s)", (us,))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--usuarios", type=int, default=40)
    ap.add_argument("--proyectos", type=int, default=30)
    ap.add_argument("--grupos", type=int, default=3, help="grupos de gustos latentes")
    ap.add_argument("--etiquetas-por-usuario", type=int, default=3,
                    help="cuántas etiquetas declara cada usuario de su grupo (1 = perfiles muy incompletos)")
    ap.add_argument("--semilla", type=int, default=7)
    ap.add_argument("--limpiar", action="store_true")
    ap.add_argument("--confirmo-que-no-es-produccion", action="store_true")
    args = ap.parse_args()
    comprobar_entorno(args.confirmo_que_no_es_produccion)
    rnd = random.Random(args.semilla)

    with conectar() as conn, conn.cursor() as cur:
        limpiar(cur)
        if args.limpiar:
            conn.commit()
            print("Datos demo eliminados.")
            return

        cur.execute("SELECT id FROM etiquetas ORDER BY id")
        etiquetas = [r[0] for r in cur.fetchall()]
        if len(etiquetas) < args.grupos * 3:
            raise SystemExit("Hay muy pocas etiquetas en la base para generar grupos (se necesitan al menos 3 por grupo).")
        # cada grupo "latente" prefiere un tercio distinto de las etiquetas
        tam = len(etiquetas) // args.grupos
        favoritas = [etiquetas[g * tam:(g + 1) * tam] for g in range(args.grupos)]

        ahora = datetime.now(timezone.utc).replace(tzinfo=None)  # UTC sin zona, como Prisma
        usuarios = []
        for i in range(args.usuarios):
            uid, g = uid_demo(i), i % args.grupos
            cur.execute("INSERT INTO usuarios (id, correo, contrasena, actualizado_en, terminos_version, terminos_aceptados_en, consentimiento_investigacion, consentimiento_investigacion_en) "
                        "VALUES (%s,%s,%s,now(),'2026-10-v1',now(),true,now())", (uid, f"demo.{i}{DOMINIO}", "no-puede-iniciar-sesion"))
            cur.execute("INSERT INTO perfiles (id, usuario_id, nombre_usuario, actualizado_en) VALUES (%s,%s,%s,now())", (str(uuid.uuid5(NAMESPACE, f"perfil-{i}")), uid, f"demo_{i}"))
            propias = rnd.sample(favoritas[g], min(args.etiquetas_por_usuario, len(favoritas[g])))
            if rnd.random() < 0.25:  # algunos declaran un gusto "fuera de grupo"
                propias.append(rnd.choice(etiquetas))
            for e in set(propias):
                cur.execute("INSERT INTO usuario_etiquetas (usuario_id, etiqueta_id) VALUES (%s,%s)", (uid, e))
            usuarios.append((uid, g, set(propias)))

        proyectos = []
        for j in range(args.proyectos):
            pid, g = pid_demo(j), j % args.grupos
            creador = usuarios[rnd.randrange(len(usuarios))][0]
            cur.execute("INSERT INTO proyectos (id, creador_id, titulo_proyecto, modalidad_proyecto, estado_proyecto) VALUES (%s,%s,%s,'remoto','abierto')",
                        (pid, creador, f"Proyecto demo {j}"))
            etqs = set(rnd.sample(favoritas[g], min(3, len(favoritas[g]))))
            if rnd.random() < 0.3:
                etqs.add(rnd.choice(etiquetas))
            for e in etqs:
                cur.execute("INSERT INTO proyecto_etiquetas (proyecto_id, etiqueta_id) VALUES (%s,%s)", (pid, e))
            proyectos.append((pid, g, creador))

        # cada usuario "ve" ~15 proyectos; reacciona según su grupo (con ruido)
        for uid, g, _ in usuarios:
            vistos = rnd.sample([p for p in proyectos if p[2] != uid], min(15, len(proyectos) - 1))
            for k, (pid, gp, _) in enumerate(vistos):
                algoritmo = "hibrido" if k % 2 else "etiquetas"
                servido = ahora - timedelta(days=rnd.randint(1, 6), minutes=k)
                cur.execute("INSERT INTO recomendacion_log (id, usuario_id, proyecto_id, algoritmo, posicion, puntaje, servido_en) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                            (str(uuid.uuid4()), uid, pid, algoritmo, k + 1, rnd.random(), servido))
                afin = (gp == g)
                r = rnd.random()
                eventos = []
                if afin and r < 0.55:
                    accion = rnd.choice(["like", "favorito", "like", "postulacion"] if r < 0.12 else ["like", "favorito"])
                    eventos.append(accion)
                    if rnd.random() < 0.25:
                        eventos.append("comentario")
                elif not afin and r < 0.45:
                    eventos.append(rnd.choice(["descarte", "dislike", "descarte"]))
                for tipo in eventos:
                    cur.execute("INSERT INTO interaccion_proyecto_log (id, usuario_id, proyecto_id, tipo, creado_en) VALUES (%s,%s,%s,%s,%s)",
                                (str(uuid.uuid4()), uid, pid, tipo, servido + timedelta(minutes=2)))
                    if tipo == "like":
                        cur.execute("INSERT INTO votos (usuario_id, tipo_contenido, contenido_id, tipo) VALUES (%s,'proyecto',%s,'up') ON CONFLICT DO NOTHING", (uid, pid))
                    elif tipo == "dislike":
                        cur.execute("INSERT INTO votos (usuario_id, tipo_contenido, contenido_id, tipo) VALUES (%s,'proyecto',%s,'down') ON CONFLICT DO NOTHING", (uid, pid))
                    elif tipo == "favorito":
                        cur.execute("INSERT INTO favoritos_proyecto (usuario_id, proyecto_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (uid, pid))
                    elif tipo == "descarte":
                        cur.execute("INSERT INTO descartes_proyecto (usuario_id, proyecto_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (uid, pid))
                    elif tipo == "postulacion":
                        cur.execute("INSERT INTO postulaciones_proyecto (id, proyecto_id, postulante_id, estado_postulacion) VALUES (%s,%s,%s,'pendiente') ON CONFLICT DO NOTHING", (str(uuid.uuid4()), pid, uid))
                    elif tipo == "comentario":
                        cur.execute("INSERT INTO comentarios (id, autor_id, tipo_contenido, contenido_id, contenido, actualizado_en) VALUES (%s,%s,'proyecto',%s,'comentario demo',now())", (str(uuid.uuid4()), uid, pid))
        conn.commit()
        print(f"Creados {args.usuarios} usuarios, {args.proyectos} proyectos y sus interacciones (correos '*{DOMINIO}').")
        print("Recuerda: son datos FICTICIOS. Para borrarlos: python generar_datos_demo.py --limpiar")


if __name__ == "__main__":
    main()