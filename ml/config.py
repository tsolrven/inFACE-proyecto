"""Parámetros por defecto del recomendador."""

# Cuánto "vale" cada cosa que un usuario hace con un proyecto (positivo = le interesa)
PESOS_SENALES = {
    "postulacion": 3.0,
    "favorito": 2.0,
    "like": 2.0,
    "comentario": 1.0,
    "dislike": -2.0,
    "descarte": -3.0,
}

# Peso de cada componente en el puntaje híbrido (se renormalizan si falta alguno)
PESOS_PUNTAJE = {"declarado": 0.45, "inferido": 0.20, "cluster": 0.15, "pares": 0.20}

ESCALA_INFERIDO = 3.0
ESCALA_PARES = 3.0

# Cuánto pesa el comportamiento al construir el vector de un usuario para el clustering
# (0 = solo las etiquetas que eligió; 1 = el comportamiento pesa tanto como lo declarado)
LAMBDA_PERFIL = 0.5

# Señales que cuentan como "le gustó" / "no le gustó" al evaluar (aceptación)
POSITIVAS = ("like", "favorito", "postulacion")
NEGATIVAS = ("dislike", "descarte")


def parametros_defecto():
    return {
        "pesos_senales": dict(PESOS_SENALES),
        "pesos_puntaje": dict(PESOS_PUNTAJE),
        "escala_inferido": ESCALA_INFERIDO,
        "escala_pares": ESCALA_PARES,
        "lambda_perfil": LAMBDA_PERFIL,
    }


def combinar_parametros(p=None):
    base = parametros_defecto()
    p = p or {}
    base["pesos_senales"].update(p.get("pesos_senales") or {})
    base["pesos_puntaje"].update(p.get("pesos_puntaje") or {})
    for k in ("escala_inferido", "escala_pares", "lambda_perfil"):
        if p.get(k) is not None:
            base[k] = p[k]
    return base