import {
  listarComentarios,
  listarRespuestas,
  crearComentario,
  editarComentario,
  eliminarComentario,
} from './comments.service.js';
import ApiResponse from '../../utils/apiResponse.js';
import { obtenerContextoComentario } from './comments.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarDeContenido(req, res, next) {
  try {
    const { tipo, id } = req.params;
    const { orden, limite, cursor } = req.query;
    const { items, meta } = await listarComentarios({
      tipo_contenido: tipo,
      contenido_id: id,
      usuario_id: req.usuario.id,
      orden,
      limite,
      cursor,
    });
    return ApiResponse.success(res, items, 200, meta);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarRespuestasDeComentario(req, res, next) {
  try {
    const { orden, limite, cursor } = req.query;
    const { items, meta } = await listarRespuestas({
      comentario_id: req.params.comentario_id,
      usuario_id: req.usuario.id,
      orden,
      limite,
      cursor,
    });
    return ApiResponse.success(res, items, 200, meta);
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
async function obtenerContexto(req, res, next) {
  try {
    const { orden } = req.query;
    const contexto = await obtenerContextoComentario({
      comentario_id: req.params.comentario_id,
      usuario_id: req.usuario.id,
      orden,
    });
    return ApiResponse.success(res, contexto);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarDeContenido,
  listarRespuestasDeComentario,
  crearEnContenido,
  editar,
  eliminar,
  obtenerContexto,
};
