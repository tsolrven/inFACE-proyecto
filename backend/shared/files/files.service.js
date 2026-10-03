import fs from 'fs';
import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import { obtenerPropietarioContenido } from '../content/contentRegistry.js';
import { resolverRutaFisica } from './uploadsPath.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const MAX_ARCHIVOS_POR_APUNTE = 10;
const ROLES_STAFF = ['admin', 'moderador'];
// ────────────────────────────────────────────────────────────────────────────────────────
async function subirArchivo({ apunte_id, file, usuario_id, rol }) {
  const autor_id = await obtenerPropietarioContenido('apunte', apunte_id);

  if (autor_id !== usuario_id && !ROLES_STAFF.includes(rol)) {
    throw new ForbiddenError(
      'No tienes permiso para subir archivos a este apunte',
    );
  }

  const cantidadActual = await prisma.archivo.count({
    where: { tipo_contenido: 'apunte', contenido_id: apunte_id },
  });
  if (cantidadActual >= MAX_ARCHIVOS_POR_APUNTE) {
    throw new BadRequestError(
      `No puedes subir más de ${MAX_ARCHIVOS_POR_APUNTE} archivos por apunte`,
    );
  }

  const archivo = await prisma.archivo.create({
    data: {
      tipo_contenido: 'apunte',
      contenido_id: apunte_id,
      nombre_archivo: file.originalname,
      ruta_url: `/uploads/${file.filename}`,
      tipo_mime: file.mimetype,
      tamanio: file.size,
    },
  });

  logger.info('Archivo subido', {
    archivo_id: archivo.id,
    apunte_id,
    nombre: file.originalname,
    tamanio: file.size,
  });

  return archivo;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function descargarArchivo(id) {
  const archivo = await prisma.archivo
    .update({
      where: { id },
      data: { contador_descargas: { increment: 1 } },
    })
    .catch(() => null);

  if (!archivo) throw new NotFoundError('Archivo');

  const rutaFisica = resolverRutaFisica(archivo.ruta_url);
  if (!fs.existsSync(rutaFisica)) {
    logger.warn('Archivo físico no encontrado al descargar', {
      archivo_id: id,
      ruta: rutaFisica,
    });
    throw new NotFoundError('Archivo');
  }

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

  if (autor_id !== usuario_id && !ROLES_STAFF.includes(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este archivo');
  }

  await prisma.archivo.delete({ where: { id } });
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
export {
  subirArchivo,
  eliminarArchivo,
  descargarArchivo,
  borrarArchivosFisicos,
};
