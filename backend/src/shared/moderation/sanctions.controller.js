import {
  crearSancion,
  revocarSancion,
  listarSancionesDeUsuario,
} from './sanctions.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarSanciones(req, res, next) {
  try {
    const sanciones = await listarSancionesDeUsuario(req.params.id);
    return ApiResponse.success(res, sanciones);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function aplicarSancion(req, res, next) {
  try {
    const { tipo, motivo, dias, permanente, contenido_tipo, contenido_id } =
      req.body;
    const sancion = await crearSancion({
      usuario_id: req.params.id,
      tipo,
      motivo,
      dias,
      permanente,
      contenido_tipo,
      contenido_id,
      aplicada_por: req.usuario.id,
    });
    return ApiResponse.created(res, sancion);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function revocarSancionDeUsuario(req, res, next) {
  try {
    const sancion = await revocarSancion({
      usuario_id: req.params.id,
      sancion_id: req.params.sancionId,
      revocada_por: req.usuario.id,
      motivo_revocacion: req.body.motivo_revocacion,
    });
    return ApiResponse.success(res, sancion);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarSanciones, aplicarSancion, revocarSancionDeUsuario };