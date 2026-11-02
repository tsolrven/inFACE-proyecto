"""Lectura de la base de datos hacia las estructuras de modelo.py"""
from config import PESOS_SENALES 
from modelo import Datos


def cargar_datos(cur):
    cur.execute("SELECT id, nombre_etiqueta FROM etiquetas ORDER BY id")
    etiquetas = cur.fetchall()

    cur.execute("SELECT id, consentimiento_investigacion FROM usuarios WHERE esta_activo")
    filas = cur.fetchall()
    consentimiento = {uid: bool(c) for uid, c in filas}
    usuarios = {uid: set() for uid, _ in filas}
    cur.execute("SELECT usuario_id, etiqueta_id FROM usuario_etiquetas")
    for uid, eid in cur.fetchall():
        if uid in usuarios:
            usuarios[uid].add(eid)

    cur.execute("SELECT id, creador_id, estado_proyecto FROM proyectos")
    creador, estado, proyectos = {}, {}, {}
    for pid, cid, est in cur.fetchall():
        creador[pid], estado[pid], proyectos[pid] = cid, est, []
    cur.execute("SELECT proyecto_id, etiqueta_id FROM proyecto_etiquetas")
    for pid, eid in cur.fetchall():
        if pid in proyectos:
            proyectos[pid].append(eid)

    senales = []

    def agregar(sql, tipo):
        cur.execute(sql)
        for uid, pid in cur.fetchall():
            if uid in usuarios and pid in proyectos:
                senales.append((uid, pid, tipo))

    cur.execute("SELECT usuario_id, contenido_id, tipo FROM votos WHERE tipo_contenido = 'proyecto'")
    for uid, pid, tipo in cur.fetchall():
        if uid in usuarios and pid in proyectos:
            senales.append((uid, pid, "like" if tipo == "up" else "dislike"))
    agregar("SELECT usuario_id, proyecto_id FROM favoritos_proyecto", "favorito")
    agregar("SELECT usuario_id, proyecto_id FROM descartes_proyecto", "descarte")
    agregar("SELECT postulante_id, proyecto_id FROM postulaciones_proyecto", "postulacion")
    agregar(
        "SELECT DISTINCT autor_id, contenido_id FROM comentarios "
        "WHERE tipo_contenido = 'proyecto' AND NOT eliminado",
        "comentario",
    )
    return Datos(etiquetas=etiquetas, usuarios=usuarios, consentimiento=consentimiento,
                proyectos=proyectos, creador=creador, estado=estado, senales=senales)