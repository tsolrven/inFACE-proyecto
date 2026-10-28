import { votar } from './votes.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function votarContenido(req, res, next) {
  try {
    const { tipo: tipo_contenido, id: contenido_id } = req.params;
    const { tipo } = req.body;

    const resultado = await votar({
      usuario_id: req.usuario.id,
      contenido_id,
      tipo_contenido,
      tipo, // up/down
    });
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { votarContenido };
