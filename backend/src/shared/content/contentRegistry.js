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
  hilo: {
    modelName: 'hilo',
    tableName: 'hilos',
    label: 'Hilo',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
    // solo imágenes: se aplica sobre EXTENSIONES_PERMITIDAS (multer.helper.js)
    adjuntos: {
      max: 10,
      extensiones: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
  },
  anuncio: {
    modelName: 'anuncio',
    tableName: 'anuncios',
    label: 'Anuncio',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
    // imágenes (afiches) y PDF (calendarios, reglamentos)
    adjuntos: {
      max: 10,
      extensiones: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'],
    },
  },
  comentario: {
    modelName: 'comentario',
    tableName: 'comentarios',
    label: 'Comentario',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'contenido',
    allowsComments: false,
    eliminadoField: 'eliminado',
  },
  proyecto: {
    modelName: 'proyecto',
    tableName: 'proyectos',
    label: 'Proyecto',
    ownerField: 'creador_id',
    votesField: 'votos_neto',
    previewField: 'titulo_proyecto',
    allowsComments: true,
    adjuntos: { max: 1, extensiones: ['.pdf'] },
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
// Cada módulo puede reaccionar cuando se elimina (lógica o físicamente) un comentario
// de SU contenido. Ej: el foro limpia la respuesta aceptada del hilo.
// El hook corre dentro de la transacción del borrado: recibe (tx, comentario),
// con `comentario` tal como estaba ANTES de eliminarlo.
function registrarAlEliminarComentario(tipo_contenido, hook) {
  obtenerEntradaRegistro(tipo_contenido).alEliminarComentario = hook;
}

async function ejecutarAlEliminarComentario(tx, comentario) {
  const hook =
    CONTENT_REGISTRY[comentario.tipo_contenido]?.alEliminarComentario;
  if (hook) await hook(tx, comentario);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cada módulo puede impedir que se quite un archivo de SU contenido (ej: el apunte
// no puede quedar vacío). Corre dentro de la transacción de eliminarArchivo, con el
// contenido bloqueado. Recibe (tx, archivo) y lanza un error para rechazar.
function registrarAlQuitarArchivo(tipo_contenido, hook) {
  obtenerEntradaRegistro(tipo_contenido).alQuitarArchivo = hook;
}

async function ejecutarAlQuitarArchivo(tx, archivo) {
  const hook = CONTENT_REGISTRY[archivo.tipo_contenido]?.alQuitarArchivo;
  if (hook) await hook(tx, archivo);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cada módulo puede imponer su propia regla sobre quién sube o elimina archivos de
// SU contenido. El hook recibe (usuario, contenido_id, accion), con accion 'subir' o
// 'eliminar', y devuelve true/false (puede lanzar NotFoundError si el contenido no
// existe). Si el tipo no registra ninguno, files.service aplica la regla general:
// sube el autor; elimina el autor o el staff.
function registrarPermisoAdjuntos(tipo_contenido, hook) {
  obtenerEntradaRegistro(tipo_contenido).permisoAdjuntos = hook;
}

// true/false según el hook del tipo, o null si el tipo no definió regla
async function evaluarPermisoAdjuntos(
  tipo_contenido,
  contenido_id,
  usuario,
  accion,
) {
  const hook = CONTENT_REGISTRY[tipo_contenido]?.permisoAdjuntos;
  if (!hook) return null;
  return hook(usuario, contenido_id, accion);
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
  obtenerEntradaRegistro,
  obtenerPropietarioContenido,
  actualizarVotosNetoContenido,
  bloquearContenido,
  obtenerPreviewsContenido,
  registrarHidratadorGuardados,
  hidratarGuardados,
  registrarAlEliminarComentario,
  ejecutarAlEliminarComentario,
  registrarAlQuitarArchivo,
  ejecutarAlQuitarArchivo,
  registrarPermisoAdjuntos,
  evaluarPermisoAdjuntos,
  registrarOyenteInteraccion,
  notificarInteraccion,
  tiposContenidoValidos,
  admiteComentarios,
  obtenerConfigAdjuntos,
};
