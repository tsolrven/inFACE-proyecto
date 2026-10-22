import {
  guardarContenido,
  quitarGuardado,
  listarGuardados,
} from './bookmarks.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function guardar(req, res, next) {
  try {
    const { tipo: tipo_contenido, id: contenido_id } = req.params;
    const resultado = await guardarContenido({
      usuario_id: req.usuario.id,
      tipo_contenido,
      contenido_id,
    });
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function quitar(req, res, next) {
  try {
    const { tipo: tipo_contenido, id: contenido_id } = req.params;
    const resultado = await quitarGuardado({
      usuario_id: req.usuario.id,
      tipo_contenido,
      contenido_id,
    });
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { tipo, pagina, limite } = req.query;
    const { items, total } = await listarGuardados({
      usuario_id: req.usuario.id,
      tipo_contenido: tipo || 'apunte',
      pagina,
      limite,
    });
    return ApiResponse.paginated(res, items, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { guardar, quitar, listar };
