"""Conexión a Postgres reutilizando la misma DATABASE_URL del backend"""
import os
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import psycopg


def conectar():
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise SystemExit("Falta la variable DATABASE_URL en el entorno, no se puede conectar a la base de datos.")
    partes = urlsplit(url)
    query = [(k, v) for k, v in parse_qsl(partes.query) if k != "schema"]
    limpia = urlunsplit(partes._replace(query=urlencode(query)))
    return psycopg.connect(limpia)