// Predicción local para actualizar la UI al instante, antes de que responda el servidor.
// La verdad la decide el servidor: al responder, su valor reemplaza esta predicción.
const VALOR = { up: 1, down: -1 };

export function predecirVoto(miVotoActual, tipo) {
  const miVotoNuevo = miVotoActual === tipo ? null : tipo; // mismo botón = quitar voto
  const delta = (VALOR[miVotoNuevo] ?? 0) - (VALOR[miVotoActual] ?? 0);
  return { mi_voto: miVotoNuevo, delta };
}
