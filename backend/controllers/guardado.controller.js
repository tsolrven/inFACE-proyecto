import { alternarGuardado, listarGuardados } from '../services/guardado.service.js';
import ApiResponse from '../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function guardarApunte(req, res, next) {
  try {
    const resultado = await alternarGuardado({
      usuario_id: req.usuario.id,
      contenido_id: req.params.apunte_id,
      tipo_contenido: 'apunte',
    });
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function guardarComentario(req, res, next) {
  try {
    const resultado = await alternarGuardado({
      usuario_id: req.usuario.id,
      contenido_id: req.params.comentario_id,
      tipo_contenido: 'comentario',
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
    const pag = pagina ? parseInt(pagina) : 1;
    const lim = limite ? parseInt(limite) : 20;
    const { items, total } = await listarGuardados({
      usuario_id: req.usuario.id,
      tipo_contenido: tipo || 'apunte',
      pagina: pag,
      limite: lim,
    });
    return ApiResponse.paginated(res, items, total, pag, lim);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { guardarApunte, guardarComentario, listar };
