//! registro de tipos de contenido - centraliza la información de qué tipos de contenido existen y cómo se accede a ellos.

import { prisma } from '../../config/configDb.js';
import { BadRequestError, NotFoundError } from '../../errors/appError.js';

// ────────────────────────────────────────────────────────────────────────────────────────
const CONTENT_REGISTRY = {
  apunte: {
    modelName: 'apunte',
    tableName: 'apuntes',
    label: 'Apunte',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
    adjuntos: { max: 10 },
  },
  comentario: {
    modelName: 'comentario',
    tableName: 'comentarios',
    label: 'Comentario',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'contenido',
    allowsComments: false,
    eliminadoField: 'eliminado', // borrado lógico: ya no admite interacciones
  },
  proyecto: {
    modelName: 'proyecto',
    tableName: 'proyectos',
    label: 'Proyecto',
    ownerField: 'creador_id',
    votesField: 'votos_neto',
    previewField: 'titulo_proyecto',
    allowsComments: true,
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
  const campo = entrada.eliminadoField;

  const registro = await client[entrada.modelName].findUnique({
    where: { id: contenido_id },
    select: { id: true, ...(campo && { [campo]: true }) },
  });
  if (!registro) throw new NotFoundError(entrada.label);
  if (campo && registro[campo]) {
    throw new BadRequestError(
      `${entrada.label} eliminado: ya no admite interacciones`,
    );
  }
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
async function bloquearContenido(
  tipo_contenido,
  contenido_id,
  client = prisma,
) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const filas = await client.$queryRawUnsafe(
    `SELECT id FROM "${entrada.tableName}" WHERE id = $1 FOR UPDATE`,
    contenido_id,
  );
  if (filas.length === 0) throw new NotFoundError(entrada.label);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerPreviewsContenido(tipo_contenido, ids, client = prisma) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const registros = await client[entrada.modelName].findMany({
    where: { id: { in: ids } },
    select: { id: true, [entrada.previewField]: true },
  });
  return new Map(registros.map((r) => [r.id, r[entrada.previewField]]));
}
// ────────────────────────────────────────────────────────────────────────────────────────
function registrarHidratadorGuardados(tipo_contenido, hidratador) {
  obtenerEntradaRegistro(tipo_contenido).hidratarGuardados = hidratador;
}

async function hidratarGuardados(tipo_contenido, ids, usuario_id) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  if (!entrada.hidratarGuardados) {
    throw new BadRequestError(
      `"${entrada.label}" no se puede listar como guardado`,
    );
  }
  return entrada.hidratarGuardados(ids, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
const OYENTES_INTERACCION = new Map();

function registrarOyenteInteraccion(tipo_contenido, oyente) {
  obtenerEntradaRegistro(tipo_contenido);
  OYENTES_INTERACCION.set(tipo_contenido, oyente);
}

async function notificarInteraccion(tipo_contenido, datos) {
  const oyente = OYENTES_INTERACCION.get(tipo_contenido);
  if (!oyente) return;
  try {
    await oyente(datos);
  } catch {}
}
// ────────────────────────────────────────────────────────────────────────────────────────
function tiposContenidoValidos() {
  return Object.keys(CONTENT_REGISTRY);
}
// ────────────────────────────────────────────────────────────────────────────────────────
function admiteComentarios(tipo_contenido) {
  return CONTENT_REGISTRY[tipo_contenido]?.allowsComments === true;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Config de adjuntos del tipo. Si el tipo no admite archivos, rechaza.
function obtenerConfigAdjuntos(tipo_contenido) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  if (!entrada.adjuntos) {
    throw new BadRequestError(`${entrada.label} no admite archivos adjuntos`);
  }
  return entrada.adjuntos;
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  verificarContenidoExiste,
  obtenerPropietarioContenido,
  actualizarVotosNetoContenido,
  bloquearContenido,
  obtenerPreviewsContenido,
  registrarHidratadorGuardados,
  hidratarGuardados,
  registrarOyenteInteraccion,
  notificarInteraccion,
  tiposContenidoValidos,
  admiteComentarios,
  obtenerConfigAdjuntos,
};
