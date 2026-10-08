import { alternarGuardado, listarGuardados } from './bookmarks.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function guardarContenido(req, res, next) {
  try {
    const { tipo: tipo_contenido, id: contenido_id } = req.params;

    const resultado = await alternarGuardado({
      usuario_id: req.usuario.id,
      contenido_id,
      tipo_contenido,
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
export { guardarContenido, listar };
