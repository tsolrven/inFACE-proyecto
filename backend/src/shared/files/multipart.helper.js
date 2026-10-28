import fs from 'fs';
import { BadRequestError } from '../../errors/appError.js';

// Si la petición termina con error (validación, firma, BD…), borra los
// archivos que multer ya escribió. Un solo lugar cubre todos los casos.
function limpiarArchivosSiFalla(req, res, next) {
  res.on('finish', () => {
    if (res.statusCode < 400) return;
    for (const f of req.files ?? []) fs.unlink(f.path, () => {});
  });
  next();
}

// En multipart los arrays/objetos no viajan bien como campos sueltos:
// el front manda todo el JSON en el campo "datos".
function parsearDatosMultipart(req, res, next) {
  if (!req.is('multipart/form-data')) return next();
  try {
    req.body = JSON.parse(req.body?.datos ?? '{}');
  } catch {
    return next(new BadRequestError('El campo "datos" no es un JSON válido'));
  }
  next();
}

export { limpiarArchivosSiFalla, parsearDatosMultipart };
