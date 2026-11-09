//! validación de contenido real de archivos subidos (después de multer)

import fs from 'fs';
import path from 'path';
import { BadRequestError } from '../../errors/appError.js';

const FIRMAS = {
  '.pdf': [[0x25, 0x50, 0x44, 0x46]],
  '.zip': [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ],
  '.docx': [[0x50, 0x4b, 0x03, 0x04]],
  '.pptx': [[0x50, 0x4b, 0x03, 0x04]],
  '.xlsx': [[0x50, 0x4b, 0x03, 0x04]],
  '.doc': [[0xd0, 0xcf, 0x11, 0xe0]],
  '.ppt': [[0xd0, 0xcf, 0x11, 0xe0]],
  '.xls': [[0xd0, 0xcf, 0x11, 0xe0]],
  '.jpg': [[0xff, 0xd8, 0xff]],
  '.jpeg': [[0xff, 0xd8, 0xff]],
  '.png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  '.ogg': [[0x4f, 0x67, 0x67, 0x53]],
  '.gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
};

function esMp3(b) {
  return (
    coincideFirma(b, [[0x49, 0x44, 0x33]]) ||
    (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)
  );
}
function esWav(b) {
  return (
    coincideFirma(b, [[0x52, 0x49, 0x46, 0x46]]) &&
    b[8] === 0x57 &&
    b[9] === 0x41 &&
    b[10] === 0x56 &&
    b[11] === 0x45
  );
}
function esM4a(b) {
  return b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70;
}

const EXTENSIONES_TEXTO = ['.txt'];

function coincideFirma(buffer, firmas) {
  return firmas.some((firma) => firma.every((byte, i) => buffer[i] === byte));
}

function esWebp(buffer) {
  return (
    coincideFirma(buffer, [[0x52, 0x49, 0x46, 0x46]]) &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  );
}

// ─── A PARTIR DE AQUÍ SE REEMPLAZA TODO HASTA EL FINAL ───────────────────

function leerCabecera(ruta) {
  const fd = fs.openSync(ruta, 'r');
  try {
    const buffer = Buffer.alloc(512);
    const leidos = fs.readSync(fd, buffer, 0, 512, 0);
    return buffer.subarray(0, leidos);
  } finally {
    fs.closeSync(fd);
  }
}

function pareceBinario(cabecera) {
  return cabecera.includes(0x00);
}

function descartar(archivos) {
  archivos.forEach((f) => fs.unlink(f.path, () => { }));
}

function validarContenidoReal(req, res, next) {
  const archivos = req.files ?? (req.file ? [req.file] : []);

  for (const file of archivos) {
    const ext = path.extname(file.originalname).toLowerCase();

    let cabecera;
    try {
      cabecera = leerCabecera(file.path);
    } catch {
      descartar(archivos);
      return next(
        new BadRequestError('No se pudo verificar el archivo subido'),
      );
    }

    let valido = true;
    if (ext === '.webp') valido = esWebp(cabecera);
    else if (ext === '.mp3') valido = esMp3(cabecera);
    else if (ext === '.wav') valido = esWav(cabecera);
    else if (ext === '.m4a') valido = esM4a(cabecera);
    else if (FIRMAS[ext]) valido = coincideFirma(cabecera, FIRMAS[ext]);
    else if (EXTENSIONES_TEXTO.includes(ext)) valido = !pareceBinario(cabecera);

    if (!valido) {
      descartar(archivos);
      return next(
        new BadRequestError(
          `El contenido de "${file.originalname}" no coincide con la extensión "${ext}" (¿fue renombrado?)`,
        ),
      );
    }
  }
  next();
}

export { validarContenidoReal };