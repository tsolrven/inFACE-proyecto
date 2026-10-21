import {
  listarComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario,
} from './comments.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarDeContenido(req, res, next) {
  try {
    const { tipo, id } = req.params;
    const comentarios = await listarComentarios(tipo, id, req.usuario.id);
    return ApiResponse.success(res, comentarios);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearEnContenido(req, res, next) {
  try {
    const { tipo, id } = req.params;
    const { contenido, padre_id } = req.body;
    const comentario = await crearComentario({
      autor_id: req.usuario.id,
      tipo_contenido: tipo,
      contenido_id: id,
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
      req.usuario.rol,
    );
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarDeContenido, crearEnContenido, editar, eliminar };
