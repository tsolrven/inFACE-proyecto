import fs from 'fs';
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
      usuario_id: req.usuario.id,
      rol: req.usuario.rol,
    });
    return ApiResponse.created(res, archivo);
  } catch (err) {
    // multer ya escribió el archivo en disco antes de llegar acá (corre
    // antes que el controller). Si el servicio rechaza la subida (permiso,
    // apunte no existe, límite alcanzado, etc.) el archivo físico queda
    // huérfano si no lo borramos nosotros mismos.
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
export { subir, eliminar };
