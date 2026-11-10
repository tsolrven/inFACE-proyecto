import {
  listarSolicitudesAdmin,
  obtenerSolicitudAdmin,
} from './solicitudesAdmin.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { estado, pagina, limite } = req.query;
    const { solicitudes, total } = await listarSolicitudesAdmin({
      estado,
      pagina,
      limite,
      adminId: req.usuario.id,
    });
    return ApiResponse.paginated(res, solicitudes, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function detalle(req, res, next) {
  try {
    const solicitud = await obtenerSolicitudAdmin(
      req.params.id,
      req.usuario.id,
    );
    return ApiResponse.success(res, solicitud);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, detalle };