import ApiResponse from '../../utils/apiResponse.js';
import { obtenerResumen } from './resumen.service.js';

async function resumen(req, res, next) {
  try {
    return ApiResponse.success(res, await obtenerResumen());
  } catch (err) {
    next(err);
  }
}

export { resumen };