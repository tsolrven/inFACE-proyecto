import ApiResponse from '../../utils/apiResponse.js';
import { listarHistorialAdmin } from './historial.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { tipo, pagina, limite } = req.query;
    const { items, total } = await listarHistorialAdmin({
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
export { listar };