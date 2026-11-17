import {
  obtenerTopColaboradores,
  obtenerHashtagsPopulares,
} from './statistics.service.js';
import ApiResponse from '../../utils/apiResponse.js';

// carrera_id: la de la comunidad que se mira; si no viene, la del usuario
async function topColaboradores(req, res, next) {
  try {
    const carrera_id = req.query.carrera_id ?? req.usuario.carrera_id;
    const colaboradores = await obtenerTopColaboradores(
      req.params.tipo,
      carrera_id,
    );
    return ApiResponse.success(res, colaboradores);
  } catch (err) {
    next(err);
  }
}

async function hashtagsPopulares(req, res, next) {
  try {
    const carrera_id = req.query.carrera_id ?? req.usuario.carrera_id;
    const resultado = await obtenerHashtagsPopulares(
      req.params.tipo,
      carrera_id,
    );
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}

export { topColaboradores, hashtagsPopulares };