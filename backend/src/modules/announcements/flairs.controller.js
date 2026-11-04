import {
  listarFlairs,
  crearFlair,
  actualizarFlair,
  eliminarFlair,
} from './flairs.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const flairs = await listarFlairs({
      carrera_id: req.query.carrera_id ?? req.usuario.carrera_id,
    });
    return ApiResponse.success(res, flairs);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const flair = await crearFlair({ usuario: req.usuario, ...req.body });
    return ApiResponse.created(res, flair);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizar(req, res, next) {
  try {
    const flair = await actualizarFlair(req.params.id, req.usuario, req.body);
    return ApiResponse.success(res, flair);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    await eliminarFlair(req.params.id, req.usuario);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, crear, actualizar, eliminar };
