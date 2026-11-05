import {
  obtenerRespuestasPredeterminadas,
  listarReportesAgrupados,
  obtenerReportesDeContenido,
  cerrarReportesDeContenido,
  reintentarCorreoReporte,
} from './reports.moderation.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
function respuestasPredeterminadas(req, res, next) {
  try {
    return ApiResponse.success(res, obtenerRespuestasPredeterminadas());
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarParaModeracion(req, res, next) {
  try {
    const { vista, tipo, pagina, limite } = req.query;
    const { items, total } = await listarReportesAgrupados({
      vista,
      tipo,
      pagina,
      limite,
    });
    return ApiResponse.paginated(res, items, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function detalleDeContenido(req, res, next) {
  try {
    const { tipo, id } = req.params;
    const detalle = await obtenerReportesDeContenido(tipo, id);
    return ApiResponse.success(res, detalle);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function cerrarContenido(req, res, next) {
  try {
    const { tipo, id } = req.params;
    const { resultado, respuesta } = req.body;
    const cierre = await cerrarReportesDeContenido({
      tipo_contenido: tipo,
      contenido_id: id,
      resultado,
      respuesta,
      revisor: { id: req.usuario.id, rol: req.usuario.rol },
    });
    return ApiResponse.success(res, cierre);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function reintentarCorreo(req, res, next) {
  try {
    const resultado = await reintentarCorreoReporte(req.params.id);
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  respuestasPredeterminadas,
  listarParaModeracion,
  detalleDeContenido,
  cerrarContenido,
  reintentarCorreo,
};