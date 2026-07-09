import { votar } from '../services/voto.service.js';
import ApiResponse from '../utils/ApiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function votarApunte(req, res, next) {
  try {
    const { tipo } = req.body;
    const resultado = await votar({
      usuario_id: req.usuario.id,
      contenido_id: req.params.apunte_id,
      tipo_contenido: 'apunte',
      tipo,
    });
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function votarComentario(req, res, next) {
  try {
    const { tipo } = req.body;
    const resultado = await votar({
      usuario_id: req.usuario.id,
      contenido_id: req.params.comentario_id,
      tipo_contenido: 'comentario',
      tipo,
    });
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { votarApunte, votarComentario };
