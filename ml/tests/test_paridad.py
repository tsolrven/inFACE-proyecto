"""Comprueba que Node (backend) y Python (ml/) calculen EXACTAMENTE el mismo puntaje.

Si alguien cambia la fórmula en un lado y no en el otro, esta prueba falla.
Uso (desde la carpeta ml/):  python tests/test_paridad.py
Requiere Node instalado y el repositorio completo (necesita ../backend).
"""
import json
import os
import random
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from modelo import puntuar_candidatos  # noqa: E402


def caso(rnd, con_modelo, con_historial, parametros):
    etiquetas = [f"e{i}" for i in range(12)]
    candidatos = {f"p{i}": rnd.sample(etiquetas, rnd.randint(0, 4)) for i in range(15)}
    return {
        "candidatos": candidatos,
        "mis_etiquetas": rnd.sample(etiquetas, rnd.randint(0, 5)),
        "historial": [[rnd.sample(etiquetas, rnd.randint(1, 3)), rnd.choice([-3, -2, 1, 2, 3, 5, -1, 4])]
                    for _ in range(rnd.randint(1, 8))] if con_historial else [],
        "cluster_usuario": rnd.randint(0, 3) if con_modelo else None,
        "cluster_de_proyecto": {p: rnd.randint(0, 3) for p in candidatos if rnd.random() < 0.9} if con_modelo else {},
        "neto_pares": {p: rnd.choice([-6, -3, 0, 1, 2, 5, 9]) for p in candidatos if rnd.random() < 0.5} if con_modelo else {},
        "hay_pares": bool(con_modelo and rnd.random() < 0.85),
        "parametros": parametros,
    }


def main():
    rnd = random.Random(1)
    variantes = [None, {"pesos_puntaje": {"declarado": 0.1, "pares": 0.6}, "escala_inferido": 2.0, "escala_pares": 5.0},
                {"pesos_senales": {"descarte": -5, "like": 1}}]
    casos = [caso(rnd, m, h, v) for v in variantes for m in (True, False) for h in (True, False) for _ in range(10)]
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(casos, f)
        ruta = f.name
    aqui = os.path.dirname(os.path.abspath(__file__))
    out = subprocess.run(["node", os.path.join(aqui, "calcular_node.mjs"), ruta], capture_output=True, text=True)
    os.unlink(ruta)
    if out.returncode != 0:
        raise SystemExit(f"Node falló:\n{out.stderr}")
    esperado = json.loads(out.stdout)

    peor, n = 0.0, 0
    for c, js in zip(casos, esperado):
        py = puntuar_candidatos(c["candidatos"], set(c["mis_etiquetas"]), [(e, s) for e, s in c["historial"]],
                                c["cluster_usuario"], c["cluster_de_proyecto"], c["neto_pares"], c["hay_pares"], c["parametros"])
        for pid, (valor, _) in py.items():
            peor = max(peor, abs(valor - js[pid]))
            n += 1
    print(f"{n} puntajes comparados; diferencia máxima Node vs Python: {peor:.2e}")
    if peor > 1e-9:
        raise SystemExit("FALLA: las dos implementaciones difieren. Corrige la que se desvió.")
    print("OK: Node y Python calculan lo mismo.")


if __name__ == "__main__":
    main()