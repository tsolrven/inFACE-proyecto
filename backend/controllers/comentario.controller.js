import {
  listarComentarios,
  crearComentario,
} from '../services/comentario.service.js';
import ApiResponse from '../utils/ApiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const comentarios = await listarComentarios(
      req.params.apunte_id,
      req.usuario.id,
    );
    return ApiResponse.success(res, comentarios);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const { contenido, padre_id } = req.body;
    const comentario = await crearComentario({
      autor_id: req.usuario.id,
      apunte_id: req.params.apunte_id,
      contenido,
      padre_id,
    });
    return ApiResponse.created(res, comentario);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, crear };
