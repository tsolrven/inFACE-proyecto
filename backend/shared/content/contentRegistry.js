//! registro de tipos de contenido - centraliza la información de qué tipos de contenido existen y cómo se accede a ellos.

import { prisma } from '../../config/configDb.js';
import { BadRequestError, NotFoundError } from '../../errors/appError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const CONTENT_REGISTRY = {
  apunte: {
    modelName: 'apunte',
    label: 'Apunte',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
  },
  comentario: {
    modelName: 'comentario',
    label: 'Comentario',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
  },
};
// ────────────────────────────────────────────────────────────────────────────────────────
function obtenerEntradaRegistro(tipo_contenido) {
  const entrada = CONTENT_REGISTRY[tipo_contenido];
  if (!entrada) {
    throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
  }
  return entrada;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function verificarContenidoExiste(
  tipo_contenido,
  contenido_id,
  client = prisma,
) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const existe = await client[entrada.modelName].findUnique({
    where: { id: contenido_id },
    select: { id: true },
  });
  if (!existe) throw new NotFoundError(entrada.label);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerPropietarioContenido(
  tipo_contenido,
  contenido_id,
  client = prisma,
) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const registro = await client[entrada.modelName].findUnique({
    where: { id: contenido_id },
    select: { [entrada.ownerField]: true },
  });
  if (!registro) throw new NotFoundError(entrada.label);
  return registro[entrada.ownerField];
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarVotosNetoContenido(
  tipo_contenido,
  contenido_id,
  neto,
  client = prisma,
) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  await client[entrada.modelName].update({
    where: { id: contenido_id },
    data: { [entrada.votesField]: neto },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
function tiposContenidoValidos() {
  return Object.keys(CONTENT_REGISTRY);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  verificarContenidoExiste,
  obtenerPropietarioContenido,
  actualizarVotosNetoContenido,
  tiposContenidoValidos,
};
