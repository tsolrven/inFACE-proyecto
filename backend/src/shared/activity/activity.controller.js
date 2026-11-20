import { listarActividad } from './activity.service.js';
import ApiResponse from '../../utils/apiResponse.js';

async function listar(req, res, next) {
  try {
    const { tipo, lista, carrera_id, pagina, limite } = req.query;
    const { items, total } = await listarActividad({
      usuario_id: req.params.usuarioId,
      tipo,
      lista,
      carrera_id,
      viewer_id: req.usuario.id,
      pagina,
      limite,
    });
    return ApiResponse.paginated(res, items, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}

export { listar };