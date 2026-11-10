import {
  crearSolicitud,
  listarMisSolicitudes,
  cancelarSolicitud,
} from './solicitudes.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const solicitud = await crearSolicitud({
      usuario: req.usuario,
      ...req.body,
    });
    return ApiResponse.created(res, solicitud);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarMias(req, res, next) {
  try {
    const { pagina, limite } = req.query;
    const { solicitudes, total } = await listarMisSolicitudes(req.usuario.id, {
      pagina,
      limite,
    });
    return ApiResponse.paginated(res, solicitudes, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function cancelar(req, res, next) {
  try {
    const solicitud = await cancelarSolicitud(req.params.id, req.usuario);
    return ApiResponse.success(res, solicitud);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { crear, listarMias, cancelar };