import { revocarCargo } from './cargosAdmin.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function revocar(req, res, next) {
  try {
    const cargo = await revocarCargo(
      req.params.id,
      req.usuario.id,
      req.body.motivo,
    );
    return ApiResponse.success(res, cargo);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { revocar };