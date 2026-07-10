//! validación de contenido real de archivos subidos (después de multer)

import fs from 'fs';

// firmas binarias (magic numbers)
const FIRMAS = {
  '.pdf': [[0x25, 0x50, 0x44, 0x46]],
  '.zip': [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ],
  '.docx': [[0x50, 0x4b, 0x03, 0x04]],
  '.pptx': [[0x50, 0x4b, 0x03, 0x04]],
  '.doc': [[0xd0, 0xcf, 0x11, 0xe0]],
  '.ppt': [[0xd0, 0xcf, 0x11, 0xe0]],
};

// extensiones de texto plano
const EXTENSIONES_TEXTO = [
  '.js',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.cs',
  '.ts',
  '.html',
  '.css',
  '.txt',
];

function coincideFirma(buffer, firmas) {
  return firmas.some((firma) => firma.every((byte, i) => buffer[i] === byte));
}

function pareceBinario(buffer) {
  return buffer.subarray(0, 512).includes(0x00);
}

// middleware - se ejecuta después de multer
function validarContenidoReal(req, res, next) {
  if (!req.file) return next();

  const ext = req.file.originalname
    .slice(req.file.originalname.lastIndexOf('.'))
    .toLowerCase();

  let buffer;
  try {
    const fd = fs.openSync(req.file.path, 'r');
    buffer = Buffer.alloc(512);
    fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
  } catch {
    return next();
  }

  let valido = true;
  if (FIRMAS[ext]) {
    valido = coincideFirma(buffer, FIRMAS[ext]);
  } else if (EXTENSIONES_TEXTO.includes(ext)) {
    valido = !pareceBinario(buffer);
  }
  if (!valido) {
    fs.unlink(req.file.path, () => {});
    return next(
      Object.assign(
        new Error(
          `El contenido del archivo no coincide con la extensión "${ext}" (¿fue renombrado?)`,
        ),
        { statusCode: 400, code: 'BAD_REQUEST' },
      ),
    );
  }

  next();
}

export { validarContenidoReal };
