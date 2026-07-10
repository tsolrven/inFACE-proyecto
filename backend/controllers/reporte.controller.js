import { crearReporte } from '../services/reporte.service.js';
import ApiResponse from '../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function reportarApunte(req, res, next) {
  try {
    const { motivo, detalle, objetivo } = req.body;
    const resultado = await crearReporte({
      usuario_id: req.usuario.id,
      contenido_id: req.params.apunte_id,
      tipo_contenido: 'apunte',
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
async function reportarComentario(req, res, next) {
  try {
    const { motivo, detalle, objetivo } = req.body;
    const resultado = await crearReporte({
      usuario_id: req.usuario.id,
      contenido_id: req.params.comentario_id,
      tipo_contenido: 'comentario',
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
export { reportarApunte, reportarComentario };
