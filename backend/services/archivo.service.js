import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../config/configDb.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import logger from '../lib/logger.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ────────────────────────────────────────────────────────────────────────────────────────
const MAX_ARCHIVOS_POR_APUNTE = 10;

async function subirArchivo({ apunte_id, file }) {
  const apunte = await prisma.apunte.findUnique({ where: { id: apunte_id } });
  if (!apunte) throw new NotFoundError('Apunte');

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
async function eliminarArchivo(id) {
  const archivo = await prisma.archivo.findUnique({ where: { id } });
  if (!archivo) throw new NotFoundError('Archivo');

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
export { subirArchivo, eliminarArchivo };
