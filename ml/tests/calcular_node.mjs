// Calcula con el código REAL del backend los puntajes de los casos de fixture.json
// y los imprime como JSON (los compara test_paridad.py contra la versión de Python).
import { readFileSync } from 'node:fs';
import { puntuarCandidatos } from '../../backend/modules/module-4/recomendador.puro.js';

const casos = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const salida = casos.map((c) => {
    const r = puntuarCandidatos({
        candidatos: Object.entries(c.candidatos).map(([id, etiquetas]) => ({ id, etiquetas })),
        misEtiquetas: new Set(c.mis_etiquetas),
        historial: c.historial.map(([etiquetas, puntaje]) => ({ etiquetas, puntaje })),
        clusterUsuario: c.cluster_usuario,
        clusterDeProyecto: new Map(Object.entries(c.cluster_de_proyecto)),
        netoPares: new Map(Object.entries(c.neto_pares)),
        hayPares: c.hay_pares,
        parametros: c.parametros,
    });
    return Object.fromEntries([...r].map(([id, v]) => [id, v.puntaje]));
});
console.log(JSON.stringify(salida));