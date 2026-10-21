import { prisma } from '../../config/configDb.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../errors/appError.js'; 
import logger from '../../lib/logger.js';
import { MIME_MAP } from './fileType.helper.js';
import {
  borrarArchivosFisicos,
  formatearArchivo,
  datosArchivo, 
} from '../../shared/files/files.service.js';
import { eliminarContenido } from '../../shared/content/contentCleanup.js';
import { registrarHidratadorGuardados } from '../../shared/content/contentRegistry.js';
import { obtenerEnriquecimiento } from '../../shared/content/contentEnrichment.js';
import { esStaff } from '../../shared/auth/permissions.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// relaciones que siempre se piden junto con un apunte
const INCLUDE_APUNTE = {
  autor: { include: { perfil: { select: { nombre_usuario: true } } } },
  ramo: { select: { id: true, nombre: true, codigo: true, semestre: true } },
  hashtags: { include: { hashtag: { select: { nombre: true } } } },
};
// ────────────────────────────────────────────────────────────────────────────────────────
// Único lugar donde se arma el apunte "completo" para un usuario
// (feed, detalle, guardados y edición pasan todos por acá).
async function formatearApuntes(apuntes, usuario_id) {
  const ids = apuntes.map((a) => a.id);
  const { mapVotos, setGuardados, mapComentarios, mapArchivos } =
    await obtenerEnriquecimiento('apunte', ids, usuario_id);

  return apuntes.map((a) =>
    formatearApunte(a, {
      comentarios: mapComentarios.get(a.id) ?? 0,
      archivos: mapArchivos.get(a.id) ?? [],
      mi_voto: mapVotos.get(a.id) ?? null,
      esta_guardado: setGuardados.has(a.id),
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarApuntes({
  ramo_id,
  tipo,
  tipo_archivo,
  hashtag,
  orden = 'recientes',
  pagina = 1,
  limite = 20,
  usuario_id,
  carrera_id,
}) {
  if (!carrera_id) {
    return { apuntes: [], total: 0, pagina, paginas: 0 };
  }

  const where = {
    ramo: { ramo_carrera: { some: { carrera_id } } },
  };
  if (ramo_id) where.ramo_id = ramo_id;
  if (tipo) where.tipo = tipo;
  if (hashtag) {
    where.hashtags = { some: { hashtag: { nombre: hashtag } } };
  }

  if (tipo_archivo && MIME_MAP[tipo_archivo]) {
    const archivosMatch = await prisma.archivo.findMany({
      where: {
        tipo_contenido: 'apunte',
        OR: MIME_MAP[tipo_archivo].map((prefix) => ({
          tipo_mime: { startsWith: prefix },
        })),
      },
      select: { contenido_id: true },
      distinct: ['contenido_id'],
    });
    const idsConEseTipo = archivosMatch.map((a) => a.contenido_id);
    if (idsConEseTipo.length === 0) {
      return { apuntes: [], total: 0, pagina, paginas: 0 };
    }
    where.id = { in: idsConEseTipo };
  }

  // `id` como último criterio: garantiza un orden total y estable entre páginas
  const orderBy =
    orden === 'populares'
      ? [{ votos_neto: 'desc' }, { creado_en: 'desc' }, { id: 'desc' }]
      : [{ creado_en: 'desc' }, { id: 'desc' }];

  const [apuntes, total] = await Promise.all([
    prisma.apunte.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: INCLUDE_APUNTE,
    }),
    prisma.apunte.count({ where }),
  ]);

  return {
    apuntes: await formatearApuntes(apuntes, usuario_id),
    total,
    pagina,
    paginas: Math.ceil(total / limite),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerApunte(id, usuario_id) {
  const apunte = await prisma.apunte.findUnique({
    where: { id },
    include: INCLUDE_APUNTE,
  });
  if (!apunte) throw new NotFoundError('Apunte');

  const [formateado] = await formatearApuntes([apunte], usuario_id);
  return formateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearApunte({
  autor_id,
  carrera_id,
  ramo_id,
  titulo,
  descripcion,
  tipo,
  links = [],
  codigo_snippet,
  lenguaje_snippet,
  hashtags = [],
  etiquetas_visuales = [],
  archivos = [],
}) {
  const tieneContenido =
    archivos.length > 0 || links.length > 0 || !!codigo_snippet?.trim();
  if (!tieneContenido) {
    throw new BadRequestError(
      'El material debe incluir al menos un archivo, un link o un snippet de código',
    );
  }

  const ramo = await prisma.ramo.findUnique({
    where: { id: ramo_id },
    include: { ramo_carrera: { select: { carrera_id: true } } },
  });
  if (!ramo) throw new NotFoundError('Ramo');

  const ramoEsDeSuCarrera = ramo.ramo_carrera.some(
    (rc) => rc.carrera_id === carrera_id,
  );
  if (!ramoEsDeSuCarrera) {
    throw new ForbiddenError('No puedes publicar en un ramo de otra carrera');
  }

  // todo lo que puede fallar por datos inválidos, antes de abrir la transacción
  const hashtagsCreate = await resolverHashtags(hashtags);
  const datosArchivos = archivos.map(datosArchivo);

  const { apunte, archivosCreados } = await prisma.$transaction(async (tx) => {
    const apunte = await tx.apunte.create({
      data: {
        autor_id,
        ramo_id,
        titulo,
        descripcion,
        tipo: tipo || 'apunte',
        links,
        codigo_snippet,
        lenguaje_snippet: codigo_snippet ? lenguaje_snippet : null,
        etiquetas_visuales,
        hashtags: { create: hashtagsCreate },
      },
      include: INCLUDE_APUNTE,
    });

    const archivosCreados = [];
    for (const data of datosArchivos) {
      archivosCreados.push(
        await tx.archivo.create({
          data: { tipo_contenido: 'apunte', contenido_id: apunte.id, ...data },
        }),
      );
    }
    return { apunte, archivosCreados };
  });

  return formatearApunte(apunte, { archivos: archivosCreados });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarApunte(id, usuario_id, datos) {
  const apunte = await prisma.apunte.findUnique({ where: { id } });
  if (!apunte) throw new NotFoundError('Apunte');

  if (apunte.autor_id !== usuario_id) {
    throw new ForbiddenError('Solo el autor puede editar este apunte');
  }
  const {
    ramo_id,
    titulo,
    descripcion,
    tipo,
    links,
    codigo_snippet,
    lenguaje_snippet,
    hashtags,
    etiquetas_visuales,
  } = datos;

  if (ramo_id && ramo_id !== apunte.ramo_id) {
    const [ramoActual, ramoNuevo] = await Promise.all([
      prisma.ramo.findUnique({
        where: { id: apunte.ramo_id },
        include: { ramo_carrera: { select: { carrera_id: true } } },
      }),
      prisma.ramo.findUnique({
        where: { id: ramo_id },
        include: { ramo_carrera: { select: { carrera_id: true } } },
      }),
    ]);
    if (!ramoNuevo) throw new NotFoundError('Ramo');

    const carrerasActuales = new Set(
      ramoActual.ramo_carrera.map((rc) => rc.carrera_id),
    );
    const compartenCarrera = ramoNuevo.ramo_carrera.some((rc) =>
      carrerasActuales.has(rc.carrera_id),
    );
    if (!compartenCarrera) {
      throw new ForbiddenError(
        'No puedes mover este material a un ramo de otra carrera',
      );
    }
  }

  const apunteActualizado = await prisma.apunte.update({
    where: { id },
    data: {
      editado_en: new Date(), // ← nuevo: solo el autor editando llega hasta acá
      ...(ramo_id && { ramo_id }),
      ...(titulo && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(tipo && { tipo }),
      ...(links !== undefined && { links }),
      ...(codigo_snippet !== undefined && {
        codigo_snippet,
        lenguaje_snippet: codigo_snippet ? lenguaje_snippet : null,
      }),
      ...(etiquetas_visuales !== undefined && { etiquetas_visuales }),
      ...(hashtags && {
        hashtags: {
          deleteMany: {},
          create: await resolverHashtags(hashtags),
        },
      }),
    },
    include: INCLUDE_APUNTE,
  });

  const [apunteFormateado] = await formatearApuntes(
    [apunteActualizado],
    usuario_id,
  );
  return apunteFormateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarApunte(id, usuario_id, rol) {
  const apunte = await prisma.apunte.findUnique({ where: { id } });
  if (!apunte) throw new NotFoundError('Apunte');

  if (apunte.autor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este apunte');
  }

  const archivos = await prisma.$transaction(async (tx) => {
    const { archivos } = await eliminarContenido(tx, 'apunte', id);
    await tx.apunte.delete({ where: { id } });
    return archivos;
  });

  // después del commit: si el disco falla, la BD ya quedó consistente
  await borrarArchivosFisicos(archivos);

  logger.info('Apunte eliminado', { apunte_id: id, eliminado_por: usuario_id });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarApuntesGuardados(ids, usuario_id) {
  const apuntes = await prisma.apunte.findMany({
    where: { id: { in: ids } },
    include: INCLUDE_APUNTE,
  });

  // se respeta el orden de `ids` (el guardado más reciente primero) y se omiten
  // los apuntes que ya no existen
  const mapApuntes = new Map(apuntes.map((a) => [a.id, a]));
  const ordenados = ids.map((id) => mapApuntes.get(id)).filter(Boolean);

  return formatearApuntes(ordenados, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function resolverHashtags(hashtags) {
  return Promise.all(
    hashtags.map(async (nombre) => {
      const tag = await prisma.hashtag.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      });
      return { hashtag_id: tag.id };
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
function formatearApunte(
  apunte,
  {
    comentarios = 0,
    archivos = [],
    mi_voto = null,
    esta_guardado = false,
  } = {},
) {
  return {
    id: apunte.id,
    tipo_contenido: 'apunte',
    titulo: apunte.titulo,
    descripcion: apunte.descripcion,
    tipo: apunte.tipo, // apunte, código, guía, etc
    votos_neto: apunte.votos_neto,
    mi_voto,
    esta_guardado,
    links: apunte.links ?? [],
    codigo_snippet: apunte.codigo_snippet,
    lenguaje_snippet: apunte.lenguaje_snippet,
    etiquetas_visuales: apunte.etiquetas_visuales ?? [],
    creado_en: apunte.creado_en,
    editado_en: apunte.editado_en,
    autor: {
      id: apunte.autor.id,
      nombre_usuario: apunte.autor.perfil?.nombre_usuario,
    },
    ramo: {
      id: apunte.ramo.id,
      nombre: apunte.ramo.nombre,
      codigo: apunte.ramo.codigo,
      semestre: apunte.ramo.semestre,
    },
    hashtags: apunte.hashtags.map((h) => h.hashtag.nombre),
    archivos: archivos.map(formatearArchivo),
    comentarios_count: comentarios,
    descargas: archivos.reduce(
      (acc, a) => acc + (a.contador_descargas ?? 0),
      0,
    ),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
registrarHidratadorGuardados('apunte', hidratarApuntesGuardados);
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarApuntes,
  obtenerApunte,
  crearApunte,
  actualizarApunte,
  eliminarApunte,
  formatearApunte,
};
