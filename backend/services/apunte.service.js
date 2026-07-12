import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/appError.js';
import logger from '../lib/logger.js';
import { MIME_MAP } from '../helpers/tipoArchivo.helper.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    // usuario sin carrera asignada: no le corresponde ver ningún repositorio académico
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

  const orderBy =
    orden === 'populares' ? { votos_neto: 'desc' } : { creado_en: 'desc' };

  const [apuntes, total] = await Promise.all([
    prisma.apunte.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: {
        autor: { include: { perfil: { select: { nombre_usuario: true } } } },
        ramo: {
          select: { id: true, nombre: true, codigo: true, semestre: true },
        },
        hashtags: { include: { hashtag: { select: { nombre: true } } } },
      },
    }),
    prisma.apunte.count({ where }),
  ]);

  const ids = apuntes.map((a) => a.id);

  const [conteoComentarios, archivos, misVotos, misGuardados] =
    await Promise.all([
      prisma.comentario.groupBy({
        by: ['contenido_id'],
        where: { tipo_contenido: 'apunte', contenido_id: { in: ids } },
        _count: { _all: true },
      }),
      prisma.archivo.findMany({
        where: { tipo_contenido: 'apunte', contenido_id: { in: ids } },
      }),
      usuario_id
        ? prisma.voto.findMany({
            where: {
              usuario_id,
              tipo_contenido: 'apunte',
              contenido_id: { in: ids },
            },
          })
        : Promise.resolve([]),
      usuario_id
        ? prisma.guardado.findMany({
            where: {
              usuario_id,
              tipo_contenido: 'apunte',
              contenido_id: { in: ids },
            },
          })
        : Promise.resolve([]),
    ]);

  const mapComentarios = Object.fromEntries(
    conteoComentarios.map((c) => [c.contenido_id, c._count._all]),
  );
  const mapArchivos = {};
  for (const arch of archivos) {
    if (!mapArchivos[arch.contenido_id]) mapArchivos[arch.contenido_id] = [];
    mapArchivos[arch.contenido_id].push(arch);
  }
  const mapVotos = Object.fromEntries(
    misVotos.map((v) => [v.contenido_id, v.tipo]),
  );
  const setGuardados = new Set(misGuardados.map((g) => g.contenido_id));

  return {
    apuntes: apuntes.map((a) =>
      formatearApunte(a, {
        comentarios: mapComentarios[a.id] || 0,
        archivos: mapArchivos[a.id] || [],
        mi_voto: mapVotos[a.id] || null,
        esta_guardado: setGuardados.has(a.id),
      }),
    ),
    total,
    pagina,
    paginas: Math.ceil(total / limite),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerApunte(id, usuario_id, carrera_id) {
  const apunte = await prisma.apunte.findUnique({
    where: { id },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
      ramo: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
          semestre: true,
          ramo_carrera: { select: { carrera_id: true } },
        },
      },
      hashtags: { include: { hashtag: { select: { nombre: true } } } },
    },
  });
  if (!apunte) throw new NotFoundError('Apunte');

  // cuando exista el módulo de "comunidades", permitir además el acceso
  // de lectura si el apunte pertenece a una carrera distinta a la del usuario.
  const perteneceASuCarrera = apunte.ramo.ramo_carrera.some(
    (rc) => rc.carrera_id === carrera_id,
  );
  if (!perteneceASuCarrera) {
    throw new NotFoundError('Apunte');
  }

  const [archivos, comentariosCount, miVoto, miGuardado] = await Promise.all([
    prisma.archivo.findMany({
      where: { tipo_contenido: 'apunte', contenido_id: id },
    }),
    prisma.comentario.count({
      where: { tipo_contenido: 'apunte', contenido_id: id },
    }),
    usuario_id
      ? prisma.voto.findUnique({
          where: {
            usuario_id_tipo_contenido_contenido_id: {
              usuario_id,
              tipo_contenido: 'apunte',
              contenido_id: id,
            },
          },
        })
      : Promise.resolve(null),
    usuario_id
      ? prisma.guardado.findUnique({
          where: {
            usuario_id_tipo_contenido_contenido_id: {
              usuario_id,
              tipo_contenido: 'apunte',
              contenido_id: id,
            },
          },
        })
      : Promise.resolve(null),
  ]);

  return formatearApunte(apunte, {
    comentarios: comentariosCount,
    archivos,
    mi_voto: miVoto?.tipo || null,
    esta_guardado: !!miGuardado,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearApunte({
  autor_id,
  carrera_id,
  ramo_id,
  titulo,
  descripcion,
  tipo,
  link_repositorio,
  codigo_snippet,
  lenguaje_snippet,
  hashtags = [],
}) {
  if (link_repositorio && codigo_snippet) {
    throw new BadRequestError('No puedes enviar link y snippet a la vez');
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

  const apunte = await prisma.apunte.create({
    data: {
      autor_id,
      ramo_id,
      titulo,
      descripcion,
      tipo: tipo || 'apunte',
      link_repositorio,
      codigo_snippet,
      lenguaje_snippet: codigo_snippet ? lenguaje_snippet : null,
      hashtags: {
        create: await resolverHashtags(hashtags),
      },
    },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
      ramo: {
        select: { id: true, nombre: true, codigo: true, semestre: true },
      },
      hashtags: { include: { hashtag: { select: { nombre: true } } } },
    },
  });

  return formatearApunte(apunte);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarApunte(id, usuario_id, rol, datos) {
  const apunte = await prisma.apunte.findUnique({ where: { id } });
  if (!apunte) throw new NotFoundError('Apunte');

  // solo el autor o un moderador/admin pueden editar
  if (
    apunte.autor_id !== usuario_id &&
    rol !== 'admin' &&
    rol !== 'moderador'
  ) {
    throw new ForbiddenError('No tienes permiso para editar este apunte');
  }

  const {
    ramo_id,
    titulo,
    descripcion,
    tipo,
    link_repositorio,
    codigo_snippet,
    lenguaje_snippet,
    hashtags,
  } = datos;

  const nuevoLink =
    link_repositorio !== undefined ? link_repositorio : apunte.link_repositorio;
  const nuevoSnippet =
    codigo_snippet !== undefined ? codigo_snippet : apunte.codigo_snippet;
  if (nuevoLink && nuevoSnippet) {
    throw new BadRequestError('No puedes tener link y snippet a la vez');
  }

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
      ...(ramo_id && { ramo_id }),
      ...(titulo && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(tipo && { tipo }),
      ...(link_repositorio !== undefined && { link_repositorio }),
      ...(codigo_snippet !== undefined && {
        codigo_snippet,
        lenguaje_snippet: codigo_snippet ? lenguaje_snippet : null,
      }),
      ...(hashtags && {
        hashtags: {
          deleteMany: {},
          create: await resolverHashtags(hashtags),
        },
      }),
    },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
      ramo: {
        select: { id: true, nombre: true, codigo: true, semestre: true },
      },
      hashtags: { include: { hashtag: { select: { nombre: true } } } },
    },
  });

  return formatearApunte(apunteActualizado);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarApunte(id, usuario_id, rol) {
  const apunte = await prisma.apunte.findUnique({ where: { id } });
  if (!apunte) throw new NotFoundError('Apunte');

  // solo el autor o un moderador/admin pueden eliminar
  if (
    apunte.autor_id !== usuario_id &&
    rol !== 'admin' &&
    rol !== 'moderador'
  ) {
    throw new ForbiddenError('No tienes permiso para eliminar este apunte');
  }

  const archivos = await prisma.archivo.findMany({
    where: { tipo_contenido: 'apunte', contenido_id: id },
  });

  await prisma.$transaction([
    prisma.voto.deleteMany({
      where: { tipo_contenido: 'apunte', contenido_id: id },
    }),
    prisma.comentario.deleteMany({
      where: { tipo_contenido: 'apunte', contenido_id: id },
    }),
    prisma.archivo.deleteMany({
      where: { tipo_contenido: 'apunte', contenido_id: id },
    }),
    prisma.apunte.delete({ where: { id } }),
  ]);

  for (const archivo of archivos) {
    const rutaFisica = path.join(__dirname, '..', archivo.ruta_url);
    if (fs.existsSync(rutaFisica)) {
      fs.unlinkSync(rutaFisica);
    } else {
      logger.warn('Archivo físico no encontrado al eliminar apunte', {
        archivo_id: archivo.id,
        ruta: rutaFisica,
      });
    }
  }

  logger.info('Apunte eliminado', { apunte_id: id, eliminado_por: usuario_id });
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
    titulo: apunte.titulo,
    descripcion: apunte.descripcion,
    tipo: apunte.tipo,
    votos_neto: apunte.votos_neto,
    mi_voto,
    esta_guardado,
    link_repositorio: apunte.link_repositorio,
    codigo_snippet: apunte.codigo_snippet,
    lenguaje_snippet: apunte.lenguaje_snippet,
    creado_en: apunte.creado_en,
    actualizado_en: apunte.actualizado_en,
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
    archivos,
    comentarios_count: comentarios,
    descargas: archivos.reduce(
      (acc, a) => acc + (a.contador_descargas ?? 0),
      0,
    ),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarApuntes,
  obtenerApunte,
  crearApunte,
  actualizarApunte,
  eliminarApunte,
  formatearApunte,
};
