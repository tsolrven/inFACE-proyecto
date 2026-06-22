import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/AppError.js';
import logger from '../lib/logger.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarApuntes({
  ramo_id,
  tipo,
  orden = 'recientes',
  pagina = 1,
  limite = 20,
}) {
  const where = {};
  if (ramo_id) where.ramo_id = ramo_id;
  if (tipo) where.tipo = tipo;

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
        _count: { select: { hashtags: true } },
      },
    }),
    prisma.apunte.count({ where }),
  ]);

  return {
    apuntes: apuntes.map(formatearApunte),
    total,
    pagina,
    paginas: Math.ceil(total / limite),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerApunte(id) {
  const apunte = await prisma.apunte.findUnique({
    where: { id },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
      ramo: {
        select: { id: true, nombre: true, codigo: true, semestre: true },
      },
      hashtags: { include: { hashtag: { select: { nombre: true } } } },
    },
  });

  if (!apunte) throw new NotFoundError('Apunte');

  const archivos = await prisma.archivo.findMany({
    where: { tipo_contenido: 'apunte', contenido_id: id },
  });

  return { ...formatearApunte(apunte), archivos };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearApunte({
  autor_id,
  ramo_id,
  titulo,
  descripcion,
  tipo,
  link_repositorio,
  codigo_snippet,
  hashtags = [],
}) {
  if (link_repositorio && codigo_snippet) {
    throw new BadRequestError('No puedes enviar link y snippet a la vez');
  }

  const ramo = await prisma.ramo.findUnique({ where: { id: ramo_id } });
  if (!ramo) throw new NotFoundError('Ramo');

  const apunte = await prisma.apunte.create({
    data: {
      autor_id,
      ramo_id,
      titulo,
      descripcion,
      tipo: tipo || 'apunte',
      link_repositorio,
      codigo_snippet,
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
    hashtags,
  } = datos;

  // validar que no vengan link y snippet juntos
  const nuevoLink =
    link_repositorio !== undefined ? link_repositorio : apunte.link_repositorio;
  const nuevoSnippet =
    codigo_snippet !== undefined ? codigo_snippet : apunte.codigo_snippet;
  if (nuevoLink && nuevoSnippet) {
    throw new BadRequestError('No puedes tener link y snippet a la vez');
  }

  // validar ramo si se cambió
  if (ramo_id && ramo_id !== apunte.ramo_id) {
    const ramo = await prisma.ramo.findUnique({ where: { id: ramo_id } });
    if (!ramo) throw new NotFoundError('Ramo');
  }

  const apunteActualizado = await prisma.apunte.update({
    where: { id },
    data: {
      ...(ramo_id && { ramo_id }),
      ...(titulo && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(tipo && { tipo }),
      ...(link_repositorio !== undefined && { link_repositorio }),
      ...(codigo_snippet !== undefined && { codigo_snippet }),
      // si vienen hashtags se reemplazan completamente
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

  // 1. obtener archivos físicos antes de borrar de la BD
  const archivos = await prisma.archivo.findMany({
    where: { tipo_contenido: 'apunte', contenido_id: id },
  });

  // 2. eliminar el apunte (ApunteHashtag en cascada por el schema)
  //    Comentarios y Votos son polimórficos, no tienen FK directa al apunte,
  //    así que los borramos explícitamente antes.
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

  // 3. eliminar archivos físicos del disco (fuera de la transacción,
  //    si falla solo se pierde el archivo físico, la BD ya está limpia)
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
function formatearApunte(apunte) {
  return {
    id: apunte.id,
    titulo: apunte.titulo,
    descripcion: apunte.descripcion,
    tipo: apunte.tipo,
    votos_neto: apunte.votos_neto,
    link_repositorio: apunte.link_repositorio,
    codigo_snippet: apunte.codigo_snippet,
    creado_en: apunte.creado_en,
    actualizado_en: apunte.actualizado_en,
    autor: {
      id: apunte.autor.id,
      nombre_usuario: apunte.autor.perfil?.nombre_usuario,
    },
    ramo: apunte.ramo,
    hashtags: apunte.hashtags.map((h) => h.hashtag.nombre),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarApuntes,
  obtenerApunte,
  crearApunte,
  actualizarApunte,
  eliminarApunte,
};
