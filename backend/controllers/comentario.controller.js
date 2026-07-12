import {
  listarComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario,
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
async function editar(req, res, next) {
  try {
    const { contenido } = req.body;
    const comentario = await editarComentario(
      req.params.comentario_id,
      req.usuario.id,
      contenido,
    );
    return ApiResponse.success(res, comentario);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    const resultado = await eliminarComentario(
      req.params.comentario_id,
      req.usuario.id,
    );
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, crear, editar, eliminar };
