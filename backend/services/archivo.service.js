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
// ────────────────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_ARCHIVOS_POR_APUNTE = 10;
const ROLES_STAFF = ['admin', 'moderador'];
// ────────────────────────────────────────────────────────────────────────────────────────
async function verificarPropietarioContenido(tipo_contenido, contenido_id) {
  if (tipo_contenido === 'apunte') {
    const apunte = await prisma.apunte.findUnique({
      where: { id: contenido_id },
      select: { autor_id: true },
    });
    if (!apunte) throw new NotFoundError('Apunte');
    return apunte.autor_id;
  }
  throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function subirArchivo({ apunte_id, file, usuario_id, rol }) {
  const autor_id = await verificarPropietarioContenido('apunte', apunte_id);

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

  const rutaFisica = path.join(__dirname, '..', archivo.ruta_url);
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

  const autor_id = await verificarPropietarioContenido(
    archivo.tipo_contenido,
    archivo.contenido_id,
  );

  if (autor_id !== usuario_id && !ROLES_STAFF.includes(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este archivo');
  }

  const rutaFisica = path.join(__dirname, '..', archivo.ruta_url);
  if (fs.existsSync(rutaFisica)) {
    fs.unlinkSync(rutaFisica);
  } else {
    logger.warn('Archivo físico no encontrado al eliminar', {
      archivo_id: id,
      ruta: rutaFisica,
    });
  }

  await prisma.archivo.delete({ where: { id } });

  return { mensaje: 'Archivo eliminado' };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { subirArchivo, eliminarArchivo, descargarArchivo };