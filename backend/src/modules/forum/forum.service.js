import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import {
  borrarArchivosFisicos,
  formatearArchivo,
  datosArchivo,
} from '../../shared/files/files.service.js';
import { eliminarContenido } from '../../shared/content/contentCleanup.js';
import {
  registrarHidratadorGuardados,
  registrarAlEliminarComentario,
  bloquearContenido,
} from '../../shared/content/contentRegistry.js';
import { obtenerComentarioConArbol } from '../../shared/comments/comments.service.js';
import { obtenerEnriquecimiento } from '../../shared/content/contentEnrichment.js';
import { esStaff } from '../../shared/auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
import {
  INCLUDE_HASHTAGS,
  resolverHashtags,
  filtroPorHashtag,
  nombresDeHashtags,
} from '../../shared/hashtags/hashtags.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// En las listas el contenido viaja recortado (hasta 20 hilos x 10000 caracteres
// pesarían demasiado); el detalle lo trae completo.
const EXTRACTO_MAX = 300;

const INCLUDE_HILO = {
  autor: { select: AUTOR_PUBLICO_SELECT },
  ramo: { select: { id: true, nombre: true, codigo: true, semestre: true } },
  hashtags: INCLUDE_HASHTAGS,
};
// ────────────────────────────────────────────────────────────────────────────────────────
// Único lugar donde se arma el hilo para un usuario (lista, detalle, guardados, edición).
async function formatearHilos(hilos, usuario_id, { extracto = false } = {}) {
  const ids = hilos.map((h) => h.id);
  const { mapVotos, setGuardados, mapComentarios, mapArchivos } =
    await obtenerEnriquecimiento('hilo', ids, usuario_id);

  return hilos.map((h) =>
    formatearHilo(h, {
      extracto,
      comentarios: mapComentarios.get(h.id) ?? 0,
      archivos: mapArchivos.get(h.id) ?? [],
      mi_voto: mapVotos.get(h.id) ?? null,
      esta_guardado: setGuardados.has(h.id),
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarHilos({
  ramo_id,
  hashtag,
  orden = 'recientes',
  pagina = 1,
  limite = 20,
  usuario_id,
  carrera_id,
}) {
  if (!carrera_id) {
    return { hilos: [], total: 0, pagina, paginas: 0 };
  }

  const where = { ramo: { ramo_carrera: { some: { carrera_id } } } };
  if (ramo_id) where.ramo_id = ramo_id;
  if (hashtag) where.hashtags = filtroPorHashtag(hashtag);

  // `id` como último criterio: orden total y estable entre páginas
  const orderBy =
    orden === 'populares'
      ? [{ votos_neto: 'desc' }, { creado_en: 'desc' }, { id: 'desc' }]
      : [{ creado_en: 'desc' }, { id: 'desc' }];

  const [hilos, total] = await Promise.all([
    prisma.hilo.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: INCLUDE_HILO,
    }),
    prisma.hilo.count({ where }),
  ]);

  return {
    hilos: await formatearHilos(hilos, usuario_id, { extracto: true }),
    total,
    pagina,
    paginas: Math.ceil(total / limite),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerHilo(id, usuario_id) {
  const hilo = await prisma.hilo.findUnique({
    where: { id },
    include: INCLUDE_HILO,
  });
  if (!hilo) throw new NotFoundError('Hilo');

  return armarDetalle(hilo, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Detalle = hilo completo + su respuesta aceptada (con respuestas precargadas) o null.
async function armarDetalle(hilo, usuario_id) {
  const [formateado] = await formatearHilos([hilo], usuario_id);
  const respuesta_aceptada = hilo.respuesta_aceptada_id
    ? await obtenerComentarioConArbol(hilo.respuesta_aceptada_id, usuario_id)
    : null;
  return { ...formateado, respuesta_aceptada };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Se publica solo en ramos de la propia carrera (leer, comentar y votar es libre).
// OJO: misma regla que crearApunte; si se repite una tercera vez, extraerla.
async function exigirRamoDeSuCarrera(ramo_id, carrera_id) {
  const ramo = await prisma.ramo.findUnique({
    where: { id: ramo_id },
    include: { ramo_carrera: { select: { carrera_id: true } } },
  });
  if (!ramo) throw new NotFoundError('Ramo');

  if (!ramo.ramo_carrera.some((rc) => rc.carrera_id === carrera_id)) {
    throw new ForbiddenError('No puedes publicar en un ramo de otra carrera');
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearHilo({
  autor_id,
  carrera_id,
  ramo_id,
  titulo,
  contenido,
  hashtags = [],
  archivos = [],
}) {
  await exigirRamoDeSuCarrera(ramo_id, carrera_id);

  // todo lo que puede fallar por datos inválidos, antes de abrir la transacción
  const hashtagsCreate = await resolverHashtags(hashtags);
  const datosArchivos = archivos.map(datosArchivo);

  const { hilo, archivosCreados } = await prisma.$transaction(async (tx) => {
    const hilo = await tx.hilo.create({
      data: {
        autor_id,
        ramo_id,
        titulo,
        contenido: contenido ?? null,
        hashtags: { create: hashtagsCreate },
      },
      include: INCLUDE_HILO,
    });

    const archivosCreados = [];
    for (const data of datosArchivos) {
      archivosCreados.push(
        await tx.archivo.create({
          data: { tipo_contenido: 'hilo', contenido_id: hilo.id, ...data },
        }),
      );
    }
    return { hilo, archivosCreados };
  });

  return {
    ...formatearHilo(hilo, { archivos: archivosCreados }),
    respuesta_aceptada: null,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarHilo(id, usuario_id, datos) {
  const hilo = await prisma.hilo.findUnique({ where: { id } });
  if (!hilo) throw new NotFoundError('Hilo');

  // solo el autor edita (moderar es borrar, no reescribir)
  if (hilo.autor_id !== usuario_id) {
    throw new ForbiddenError('Solo el autor puede editar este hilo');
  }

  const { titulo, contenido, hashtags } = datos;
  const hashtagsCreate = hashtags ? await resolverHashtags(hashtags) : null;

  const actualizado = await prisma.hilo.update({
    where: { id },
    data: {
      editado_en: new Date(),
      ...(titulo && { titulo }),
      ...(contenido !== undefined && { contenido }),
      ...(hashtagsCreate && {
        hashtags: { deleteMany: {}, create: hashtagsCreate },
      }),
    },
    include: INCLUDE_HILO,
  });

  return armarDetalle(actualizado, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarHilo(id, usuario_id, rol) {
  const hilo = await prisma.hilo.findUnique({ where: { id } });
  if (!hilo) throw new NotFoundError('Hilo');

  if (hilo.autor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este hilo');
  }

  const archivos = await prisma.$transaction(async (tx) => {
    const { archivos } = await eliminarContenido(tx, 'hilo', id);
    await tx.hilo.delete({ where: { id } }); // HiloHashtag cae por cascade
    return archivos;
  });

  // después del commit: si el disco falla, la BD ya quedó consistente
  await borrarArchivosFisicos(archivos);

  logger.info('Hilo eliminado', { hilo_id: id, eliminado_por: usuario_id });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Solo el autor del hilo acepta o desmarca (ni el superadmin, igual que la política
// de que staff solo elimina). Aceptar otra respuesta reemplaza la anterior.
async function aceptarRespuesta(hilo_id, comentario_id, usuario_id) {
  return prisma.$transaction(async (tx) => {
    const hilo = await tx.hilo.findUnique({
      where: { id: hilo_id },
      select: { id: true, autor_id: true, respuesta_aceptada_id: true },
    });
    if (!hilo) throw new NotFoundError('Hilo');
    if (hilo.autor_id !== usuario_id) {
      throw new ForbiddenError(
        'Solo el autor del hilo puede aceptar una respuesta',
      );
    }

    // ORDEN DE LOCKS: comentario -> hilo. Es el mismo que usa el borrado de
    // comentarios (B1: actualiza el comentario y luego el hilo). Invertirlo
    // provocaría deadlocks. El bloqueo también garantiza que lo siguiente se lea
    // después de que termine un borrado concurrente del mismo comentario.
    await bloquearContenido('comentario', comentario_id, tx); // 404 si no existe
    const comentario = await tx.comentario.findUnique({
      where: { id: comentario_id },
    });

    if (
      comentario.tipo_contenido !== 'hilo' ||
      comentario.contenido_id !== hilo_id
    ) {
      throw new BadRequestError('El comentario no pertenece a este hilo');
    }
    if (comentario.padre_id !== null) {
      throw new BadRequestError(
        'Solo se puede aceptar una respuesta directa al hilo, no una sub-respuesta',
      );
    }
    if (comentario.eliminado) {
      throw new BadRequestError('No puedes aceptar un comentario eliminado');
    }

    // aceptar tu propia respuesta se permite (no hay reputación en juego)
    if (hilo.respuesta_aceptada_id !== comentario_id) {
      await tx.hilo.update({
        where: { id: hilo_id },
        data: { respuesta_aceptada_id: comentario_id },
      });
    }
    return { respuesta_aceptada_id: comentario_id, resuelto: true };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function desmarcarRespuestaAceptada(hilo_id, usuario_id) {
  const hilo = await prisma.hilo.findUnique({
    where: { id: hilo_id },
    select: { autor_id: true },
  });
  if (!hilo) throw new NotFoundError('Hilo');
  if (hilo.autor_id !== usuario_id) {
    throw new ForbiddenError(
      'Solo el autor del hilo puede desmarcar la respuesta aceptada',
    );
  }

  // idempotente: desmarcar un hilo sin respuesta aceptada no es un error
  await prisma.hilo.update({
    where: { id: hilo_id },
    data: { respuesta_aceptada_id: null },
  });
  return { respuesta_aceptada_id: null, resuelto: false };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarHilosGuardados(ids, usuario_id) {
  const hilos = await prisma.hilo.findMany({
    where: { id: { in: ids } },
    include: INCLUDE_HILO,
  });

  // se respeta el orden de `ids` y se omiten los hilos que ya no existen
  const mapHilos = new Map(hilos.map((h) => [h.id, h]));
  const ordenados = ids.map((id) => mapHilos.get(id)).filter(Boolean);

  return formatearHilos(ordenados, usuario_id, { extracto: true });
}
// ────────────────────────────────────────────────────────────────────────────────────────
function recortar(texto, max) {
  const caracteres = [...texto]; // por caracteres, no por unidades UTF-16 (emojis)
  return caracteres.length > max
    ? { texto: caracteres.slice(0, max).join(''), truncado: true }
    : { texto, truncado: false };
}

function formatearHilo(
  hilo,
  {
    extracto = false,
    comentarios = 0,
    archivos = [],
    mi_voto = null,
    esta_guardado = false,
  } = {},
) {
  const { texto, truncado } =
    extracto && hilo.contenido
      ? recortar(hilo.contenido, EXTRACTO_MAX)
      : { texto: hilo.contenido, truncado: false };

  return {
    id: hilo.id,
    tipo_contenido: 'hilo',
    titulo: hilo.titulo,
    contenido: texto,
    contenido_truncado: truncado,
    votos_neto: hilo.votos_neto,
    mi_voto,
    esta_guardado,
    respuesta_aceptada_id: hilo.respuesta_aceptada_id,
    resuelto: hilo.respuesta_aceptada_id !== null,
    creado_en: hilo.creado_en,
    editado_en: hilo.editado_en,
    autor: {
      id: hilo.autor.id,
      nombre_usuario: hilo.autor.perfil?.nombre_usuario,
    },
    ramo: {
      id: hilo.ramo.id,
      nombre: hilo.ramo.nombre,
      codigo: hilo.ramo.codigo,
      semestre: hilo.ramo.semestre,
    },
    hashtags: nombresDeHashtags(hilo.hashtags),
    archivos: archivos.map(formatearArchivo),
    comentarios_count: comentarios,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
registrarHidratadorGuardados('hilo', hidratarHilosGuardados);

// Si se elimina el comentario aceptado (por su autor o por moderación), el hilo deja
// de estar "resuelto". Corre dentro de la transacción del borrado (ver B1).
registrarAlEliminarComentario('hilo', async (tx, comentario) => {
  await tx.hilo.updateMany({
    where: {
      id: comentario.contenido_id,
      respuesta_aceptada_id: comentario.id,
    },
    data: { respuesta_aceptada_id: null },
  });
});
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarHilos,
  obtenerHilo,
  crearHilo,
  actualizarHilo,
  eliminarHilo,
  aceptarRespuesta,
  desmarcarRespuestaAceptada,
  formatearHilo,
};
