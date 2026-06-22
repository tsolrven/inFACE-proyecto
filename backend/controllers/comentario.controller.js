import {
  listarComentarios,
  crearComentario,
} from '../services/comentario.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { BadRequestError } from '../errors/AppError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const comentarios = await listarComentarios(req.params.apunte_id);
    return ApiResponse.success(res, comentarios);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const { contenido, padre_id } = req.body;
    if (!contenido || contenido.trim() === '') {
      return next(new BadRequestError('El contenido no puede estar vacío'));
    }
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
