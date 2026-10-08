//! registro de tipos de contenido - centraliza la información de qué tipos de contenido existen y cómo se accede a ellos.

import { prisma } from '../../config/configDb.js';
import { BadRequestError, NotFoundError } from '../../errors/appError.js';

// ────────────────────────────────────────────────────────────────────────────────────────
// Única fuente de verdad: qué tipos de contenido existen, a qué tabla de Prisma
// corresponden, cómo se llama su dueño, su contador de votos, qué campo sirve de
// vista previa y si admiten comentarios.
// Cuando llegue el foro/anuncios, SOLO se agrega una entrada acá (y cada módulo
// registra su hidratador de guardados, ver registrarHidratadorGuardados).
const CONTENT_REGISTRY = {
  apunte: {
    modelName: 'apunte',
    tableName: 'apuntes',
    label: 'Apunte',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
  },
  comentario: {
    modelName: 'comentario',
    tableName: 'comentarios',
    label: 'Comentario',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'contenido',
    allowsComments: false,
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
// `client` por defecto es el prisma global, pero se le puede pasar `tx` cuando se
// llama desde dentro de un prisma.$transaction (ver votes.service.js).
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
  // @updatedAt se actualiza solo en cada update; se conserva el valor actual para
  // que votar no cuente como "editar" (el frontend usa actualizado_en para el "(editado)")
  const actual = await client[entrada.modelName].findUnique({
    where: { id: contenido_id },
    select: { actualizado_en: true },
  });
  await client[entrada.modelName].update({
    where: { id: contenido_id },
    data: {
      [entrada.votesField]: neto,
      actualizado_en: actual.actualizado_en,
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Bloquea la fila del contenido hasta que termine la transacción: dos votos simultáneos
// sobre el mismo contenido se ejecutan uno tras otro y el contador no se desfasa.
// Solo tiene efecto dentro de una transacción (hay que pasar `tx`).
async function bloquearContenido(
  tipo_contenido,
  contenido_id,
  client = prisma,
) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  // tableName sale de este registro (constante del código), nunca de lo que envía el usuario
  const filas = await client.$queryRawUnsafe(
    `SELECT id FROM "${entrada.tableName}" WHERE id = $1 FOR UPDATE`,
    contenido_id,
  );
  // si lo borraron mientras esperaba el bloqueo, ya no existe
  if (filas.length === 0) throw new NotFoundError(entrada.label);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Devuelve un Map id -> texto de vista previa (título, texto del comentario, etc.).
// Los ids que ya no existen simplemente no aparecen en el Map.
async function obtenerPreviewsContenido(tipo_contenido, ids, client = prisma) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const registros = await client[entrada.modelName].findMany({
    where: { id: { in: ids } },
    select: { id: true, [entrada.previewField]: true },
  });
  return new Map(registros.map((r) => [r.id, r[entrada.previewField]]));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cada módulo registra cómo se muestra SU contenido en la lista de guardados.
// Así shared/bookmarks no necesita importar ningún módulo.
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
function tiposContenidoValidos() {
  return Object.keys(CONTENT_REGISTRY);
}
// ────────────────────────────────────────────────────────────────────────────────────────
function admiteComentarios(tipo_contenido) {
  return CONTENT_REGISTRY[tipo_contenido]?.allowsComments === true;
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
  tiposContenidoValidos,
  admiteComentarios,
};
