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
    // lista explícita: apunte no hereda extensiones que otros módulos agreguen
    // a la lista global (p. ej. audio). Debe coincidir con
    // frontend/src/features/materials/utils/limites.js (ADJUNTOS_EXTENSIONES)
    adjuntos: {
      max: 10,
      extensiones: [
        '.pdf',
        '.doc',
        '.docx',
        '.ppt',
        '.pptx',
        '.xls',
        '.xlsx',
        '.zip',
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.gif',
        '.txt',
        '.md',
        '.csv',
        '.tsv',
        '.json',
        '.jsonl',
        '.xml',
        '.yaml',
        '.yml',
      ],
    },
  },
  hilo: {
    modelName: 'hilo',
    tableName: 'hilos',
    label: 'Hilo',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
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
    adjuntos: {
      max: 10,
      extensiones: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'],
    },
  },
  obra: {
    modelName: 'obra',
    tableName: 'obras',
    label: 'Obra',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
    adjuntos: {
      max: 40,
      extensiones: [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.gif',
        '.mp3',
        '.wav',
        '.ogg',
        '.m4a',
      ],
    },
  },
  producto: {
    modelName: 'producto',
    tableName: 'productos',
    label: 'Producto',
    ownerField: 'vendedor_id',
    votesField: 'votos_neto',
    previewField: 'titulo',
    allowsComments: true,
    adjuntos: {
      max: 8,
      extensiones: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
  },
  parrafo: {
    modelName: 'capituloParrafo',
    tableName: 'capitulo_parrafos',
    label: 'Párrafo',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'extracto',
    allowsComments: true,
  },
  comentario: {
    modelName: 'comentario',
    tableName: 'comentarios',
    label: 'Comentario',
    ownerField: 'autor_id',
    votesField: 'votos_neto',
    previewField: 'contenido',
    // un comentario sin texto es solo imagen: así se muestra en vistas
    // previas (reportes, correos, avisos), en vez de quedar en blanco
    previewSinTexto: '[Imagen]',
    allowsComments: false,
    eliminadoField: 'eliminado',
    // 1 imagen por comentario, con límite propio (5 MB)
    adjuntos: {
      max: 1,
      maxBytes: 5 * 1024 * 1024,
      extensiones: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
  },
  solicitud_rol: {
    modelName: 'solicitudRol',
    tableName: 'solicitudes_rol',
    label: 'Solicitud',
    ownerField: 'usuario_id',
    previewField: 'mensaje',
    allowsComments: false,
    interno: true,
    adjuntos: {
      max: 5,
      extensiones: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    },
  },
  proyecto: {
    modelName: 'proyecto',
    tableName: 'proyectos',
    label: 'Proyecto',
    ownerField: 'creador_id',
    votesField: 'votos_neto',
    previewField: 'titulo_proyecto',
    createdField: 'fecha_creacion',
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

// Texto de vista previa de un registro: si el campo viene vacío y el tipo
// define `previewSinTexto`, se usa ese. No aplica a eliminados (un comentario
// que su autor eliminó queda con texto vacío, y no es "solo imagen").
function textoPreview(entrada, texto) {
  return texto?.trim() ? texto : (entrada.previewSinTexto ?? texto);
}

// Como obtenerPreviewsContenido, pero indica también si el contenido está
// eliminado lógicamente (comentarios): Map id → { texto, eliminado }.
// Un comentario eliminado conserva su fila (y, si lo eliminó el staff, su texto).
async function obtenerVistasContenido(tipo_contenido, ids, client = prisma) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const campo = entrada.eliminadoField;
  const registros = await client[entrada.modelName].findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      [entrada.previewField]: true,
      ...(campo && { [campo]: true }),
    },
  });
  return new Map(
    registros.map((r) => {
      const eliminado = campo ? Boolean(r[campo]) : false;
      const texto = r[entrada.previewField];
      return [
        r.id,
        { texto: eliminado ? texto : textoPreview(entrada, texto), eliminado },
      ];
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerPreviewsContenido(tipo_contenido, ids, client = prisma) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const registros = await client[entrada.modelName].findMany({
    where: { id: { in: ids } },
    select: { id: true, [entrada.previewField]: true },
  });
  return new Map(
    registros.map((r) => [r.id, textoPreview(entrada, r[entrada.previewField])]),
  );
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
// Cada módulo registra cómo filtra una lista de ids de SUS contenidos
// (pestaña Guardados y comentarios guardados de una comunidad). El filtro
// recibe (ids, { consulta, carrera_id }) — consulta de interpretarBusqueda o
// null; carrera_id o undefined — y devuelve los ids que cumplen ambos, en
// cualquier orden. Un contenido que ya no existe nunca cumple.
function registrarFiltroGuardados(tipo_contenido, filtro) {
  obtenerEntradaRegistro(tipo_contenido).filtrarGuardados = filtro;
}

async function filtrarGuardados(tipo_contenido, ids, opciones) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  if (!entrada.filtrarGuardados) {
    throw new BadRequestError(
      `"${entrada.label}" no admite búsqueda ni filtro por carrera en guardados`,
    );
  }
  return entrada.filtrarGuardados(ids, opciones);
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Estadísticas del panel derecho (tags populares y top colaboradores).
// Cada módulo registra cómo se calculan para SUS publicaciones:
//   modelo:            delegate de Prisma de la publicación (ej. prisma.hilo)
//   whereCarrera(id):  where de Prisma "publicaciones de esta carrera"
//   hashtags:          { modelo: delegate de la tabla puente, relacion: campo
//                        de la tabla puente que apunta a la publicación }
//   diasTags:          ventana de los tags populares
//   topColaboradores:  si el módulo tiene ranking de colaboradores
// Así shared/statistics no conoce las tablas de los módulos.
function registrarEstadisticas(tipo_contenido, config) {
  obtenerEntradaRegistro(tipo_contenido).estadisticas = config;
}

function tieneEstadisticas(tipo_contenido) {
  return Boolean(CONTENT_REGISTRY[tipo_contenido]?.estadisticas);
}

function obtenerConfigEstadisticas(tipo_contenido) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  if (!entrada.estadisticas) {
    throw new BadRequestError(`"${entrada.label}" no tiene estadísticas`);
  }
  return entrada.estadisticas;
}
// ────────────────────────────────────────────────────────────────────────────────────────
function registrarAlEliminarComentario(tipo_contenido, hook) {
  obtenerEntradaRegistro(tipo_contenido).alEliminarComentario = hook;
}

// Cada módulo registra cómo elimina un contenido por moderación. Lo usa la
// pantalla de reportes: shared no puede importar de modules.
// `respuesta` = { texto, personalizada }: el mensaje que recibe quien reportó.
function registrarEliminadorModeracion(tipo_contenido, eliminador) {
  obtenerEntradaRegistro(tipo_contenido).eliminarPorModeracion = eliminador;
}

async function eliminarPorModeracion(
  tipo_contenido,
  contenido_id,
  usuario,
  respuesta,
) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  if (!entrada.eliminarPorModeracion) {
    throw new BadRequestError(
      `"${entrada.label}" no se puede eliminar desde la pantalla de reportes`,
    );
  }
  return entrada.eliminarPorModeracion(contenido_id, usuario, respuesta);
}

async function ejecutarAlEliminarComentario(tx, comentario) {
  const hook =
    CONTENT_REGISTRY[comentario.tipo_contenido]?.alEliminarComentario;
  if (hook) await hook(tx, comentario);
}
// ────────────────────────────────────────────────────────────────────────────────────────
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
// Cada tipo puede restringir quién LEE sus archivos (ver y descargar). El hook
// recibe (usuario, archivo) y devuelve true/false. Sin hook, un tipo normal
// mantiene la regla general (cualquier usuario autenticado); un tipo interno
// sin hook no es legible por nadie (falla cerrado).
function registrarPermisoLectura(tipo_contenido, hook) {
  obtenerEntradaRegistro(tipo_contenido).permisoLectura = hook;
}

async function evaluarPermisoLectura(usuario, archivo) {
  const entrada = CONTENT_REGISTRY[archivo.tipo_contenido];
  if (!entrada) return false;
  if (entrada.permisoLectura) return entrada.permisoLectura(usuario, archivo);
  return !entrada.interno;
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
  } catch {
    // Un fallo del oyente (ej: al notificar) no debe romper la acción
    // principal (votar, comentar, etc.): se ignora a propósito.
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
function tiposContenidoValidos() {
  return Object.keys(CONTENT_REGISTRY).filter(
    (tipo) => !CONTENT_REGISTRY[tipo].interno,
  );
}
// Tipos que admiten archivos, incluidos los internos: solo la ruta de archivos
// los usa (votos, guardados y reportes siguen con tiposContenidoValidos).
function tiposContenidoConArchivos() {
  return Object.keys(CONTENT_REGISTRY).filter(
    (tipo) => CONTENT_REGISTRY[tipo].adjuntos,
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
function admiteComentarios(tipo_contenido) {
  return CONTENT_REGISTRY[tipo_contenido]?.allowsComments === true;
}
// ────────────────────────────────────────────────────────────────────────────────────────
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
  obtenerVistasContenido,
  registrarHidratadorGuardados,
  hidratarGuardados,
  registrarFiltroGuardados,
  filtrarGuardados,
  registrarEstadisticas,
  tieneEstadisticas,
  obtenerConfigEstadisticas,
  registrarAlEliminarComentario,
  registrarEliminadorModeracion,
  eliminarPorModeracion,
  ejecutarAlEliminarComentario,
  registrarAlQuitarArchivo,
  ejecutarAlQuitarArchivo,
  registrarPermisoAdjuntos,
  evaluarPermisoAdjuntos,
  registrarPermisoLectura,
  evaluarPermisoLectura,
  registrarOyenteInteraccion,
  notificarInteraccion,
  tiposContenidoValidos,
  tiposContenidoConArchivos,
  admiteComentarios,
  obtenerConfigAdjuntos,
  textoPreview,
};