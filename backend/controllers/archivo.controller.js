import { subirArchivo, eliminarArchivo } from '../services/archivo.service.js';
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
    });
    return ApiResponse.created(res, archivo);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    await eliminarArchivo(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { subir, eliminar };
