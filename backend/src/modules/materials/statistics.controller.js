import {
  obtenerTopColaboradores,
  obtenerHashtagsPopulares,
} from './statistics.service.js';
import ApiResponse from '../../utils/apiResponse.js';

async function topColaboradores(req, res, next) {
  try {
    const carrera_id = req.query.carrera_id ?? req.usuario.carrera_id;
    const colaboradores = await obtenerTopColaboradores(carrera_id);
    return ApiResponse.success(res, colaboradores);
  } catch (err) {
    next(err);
  }
}

async function hashtagsPopulares(req, res, next) {
  try {
    const carrera_id = req.query.carrera_id ?? req.usuario.carrera_id;
    const tags = await obtenerHashtagsPopulares(carrera_id);
    return ApiResponse.success(res, tags);
  } catch (err) {
    next(err);
  }
}

export { topColaboradores, hashtagsPopulares };
