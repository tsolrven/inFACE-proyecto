import fs from 'fs';
import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import {
  obtenerPropietarioContenido,
  obtenerConfigAdjuntos,
  bloquearContenido,
  ejecutarAlQuitarArchivo,
} from '../content/contentRegistry.js';
import { resolverRutaFisica } from './uploadsPath.js';
import { esStaff } from '../auth/permissions.js';
import { obtenerMimePorExtension } from './fileMime.helper.js';
// ────────────────────────────────────────────────────────────────────────────────────────
function formatearArchivo(archivo) {
  return {
    id: archivo.id,
    nombre_archivo: archivo.nombre_archivo,
    tipo_mime: archivo.tipo_mime,
    tamanio: archivo.tamanio,
    contador_descargas: archivo.contador_descargas,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
function datosArchivo(file) {
  const tipo_mime = obtenerMimePorExtension(file.originalname);
  if (!tipo_mime)
    throw new BadRequestError('No se reconoce el tipo de archivo');
  return {
    nombre_archivo: file.originalname,
    ruta_url: `/uploads/${file.filename}`,
    tipo_mime,
    tamanio: file.size,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function subirArchivo({
  tipo_contenido,
  contenido_id,
  file,
  usuario_id,
}) {
  const { max } = obtenerConfigAdjuntos(tipo_contenido);
  const autor_id = await obtenerPropietarioContenido(
    tipo_contenido,
    contenido_id,
  );

  if (autor_id !== usuario_id) {
    throw new ForbiddenError(
      'Solo el autor puede subir archivos a este contenido',
    );
  }

  const datos = datosArchivo(file);

  const archivo = await prisma.$transaction(async (tx) => {
    await bloquearContenido(tipo_contenido, contenido_id, tx);

    const cantidadActual = await tx.archivo.count({
      where: { tipo_contenido, contenido_id },
    });
    if (cantidadActual >= max) {
      throw new BadRequestError(`No puedes subir más de ${max} archivos`);
    }

    return tx.archivo.create({
      data: { tipo_contenido, contenido_id, ...datos },
    });
  });

  logger.info('Archivo subido', {
    archivo_id: archivo.id,
    tipo_contenido,
    contenido_id,
    nombre: file.originalname,
    tamanio: file.size,
  });

  return formatearArchivo(archivo);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function descargarArchivo(id) {
  const archivo = await prisma.archivo.findUnique({ where: { id } });
  if (!archivo) throw new NotFoundError('Archivo');

  const rutaFisica = resolverRutaFisica(archivo.ruta_url);
  if (!fs.existsSync(rutaFisica)) {
    logger.warn('Archivo físico no encontrado al descargar', {
      archivo_id: id,
      ruta: rutaFisica,
    });
    throw new NotFoundError('Archivo');
  }

  await prisma.archivo.update({
    where: { id },
    data: { contador_descargas: { increment: 1 } },
  });

  return {
    rutaFisica,
    nombre_archivo: archivo.nombre_archivo,
    tipo_mime: archivo.tipo_mime,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarArchivo(id, usuario_id, rol) {
  const archivo = await prisma.archivo.findUnique({ where: { id } });
  if (!archivo) throw new NotFoundError('Archivo');

  const autor_id = await obtenerPropietarioContenido(
    archivo.tipo_contenido,
    archivo.contenido_id,
  );

  if (autor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este archivo');
  }

  await prisma.$transaction(async (tx) => {

    await bloquearContenido(archivo.tipo_contenido, archivo.contenido_id, tx);

    const vigente = await tx.archivo.findUnique({ where: { id } });
    if (!vigente) throw new NotFoundError('Archivo');

    await ejecutarAlQuitarArchivo(tx, vigente);
    await tx.archivo.delete({ where: { id } });
  });

  await borrarArchivosFisicos([archivo]);

  return { mensaje: 'Archivo eliminado' };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function borrarArchivosFisicos(archivos) {
  await Promise.all(
    archivos.map(async (archivo) => {
      try {
        await fs.promises.unlink(resolverRutaFisica(archivo.ruta_url));
      } catch (err) {
        const nivel = err.code === 'ENOENT' ? 'warn' : 'error';
        logger[nivel]('No se pudo borrar archivo físico', {
          archivo_id: archivo.id,
          ruta: archivo.ruta_url,
          code: err.code,
        });
      }
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerImagenParaVer(id) {
  const archivo = await prisma.archivo.findUnique({ where: { id } });
  if (!archivo) throw new NotFoundError('Archivo');
  if (
    !archivo.tipo_mime?.startsWith('image/') &&
    !archivo.tipo_mime?.startsWith('audio/')
  ) {
    throw new BadRequestError('Solo se pueden visualizar imágenes o audios');
  }

  const rutaFisica = resolverRutaFisica(archivo.ruta_url);
  if (!fs.existsSync(rutaFisica)) throw new NotFoundError('Archivo');

  return { rutaFisica, tipo_mime: archivo.tipo_mime };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  subirArchivo,
  eliminarArchivo,
  descargarArchivo,
  borrarArchivosFisicos,
  formatearArchivo,
  datosArchivo,
  obtenerImagenParaVer,
};