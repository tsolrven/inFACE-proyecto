import fs from 'fs';
import {
  subirArchivo,
  eliminarArchivo,
  descargarArchivo,
} from '../services/archivo.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { BadRequestError } from '../errors/AppError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function subir(req, res, next) {
  try {
    if (!req.file) {
      return next(new BadRequestError('No se envió ningún archivo'));
    }
    const archivo = await subirArchivo({
      apunte_id: req.params.apunte_id,
      file: req.file,
      usuario_id: req.usuario.id,
      rol: req.usuario.rol,
    });
    return ApiResponse.created(res, archivo);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    await eliminarArchivo(req.params.id, req.usuario.id, req.usuario.rol);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function descargar(req, res, next) {
  try {
    const { rutaFisica, nombre_archivo, tipo_mime } = await descargarArchivo(
      req.params.id,
    );
    if (tipo_mime) res.type(tipo_mime);
    return res.download(rutaFisica, nombre_archivo);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { subir, eliminar, descargar };
