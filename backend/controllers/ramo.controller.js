import {
  listarRamosPorCarrera,
  getCarreras,
} from '../services/ramo.service.js';
import ApiResponse from '../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarCarreras(req, res, next) {
  try {
    const carreras = await getCarreras();
    return ApiResponse.success(res, carreras);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarRamos(req, res, next) {
  try {
    const ramos = await listarRamosPorCarrera(req.params.carrera_id);
    return ApiResponse.success(res, ramos);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarCarreras, listarRamos };
