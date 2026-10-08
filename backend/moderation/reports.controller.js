import { crearReporte, listarReportesPropios } from './reports.service.js';
import ApiResponse from '../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function reportarContenido(req, res, next) {
  try {
    const { tipo: tipo_contenido, id: contenido_id } = req.params;
    const { motivo, detalle, objetivo } = req.body;

    const resultado = await crearReporte({
      usuario_id: req.usuario.id,
      contenido_id,
      tipo_contenido,
      motivo,
      detalle,
      objetivo,
    });
    return ApiResponse.created(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarMisReportes(req, res, next) {
  try {
    const reportes = await listarReportesPropios(req.usuario.id);
    return ApiResponse.success(res, reportes);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { reportarContenido, listarMisReportes };
