import ApiResponse from '../../utils/apiResponse.js';
import { buscarUsuarios, obtenerFichaUsuario } from './usuarios.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function buscar(req, res, next) {
  try {
    const resultado = await buscarUsuarios(req.query.q);
    return ApiResponse.success(res, resultado);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerFicha(req, res, next) {
  try {
    const ficha = await obtenerFichaUsuario(req.params.id);
    return ApiResponse.success(res, ficha);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { buscar, obtenerFicha };