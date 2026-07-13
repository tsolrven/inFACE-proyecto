import {
  obtenerTopColaboradores,
  obtenerHashtagsPopulares,
} from '../services/estadisticas.service.js';
import ApiResponse from '../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function topColaboradores(req, res, next) {
  try {
    const colaboradores = await obtenerTopColaboradores(
      req.usuario.carrera_id,
    );
    return ApiResponse.success(res, colaboradores);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hashtagsPopulares(req, res, next) {
  try {
    const tags = await obtenerHashtagsPopulares(req.usuario.carrera_id);
    return ApiResponse.success(res, tags);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { topColaboradores, hashtagsPopulares };
