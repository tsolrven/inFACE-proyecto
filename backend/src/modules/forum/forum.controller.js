import {
  listarHilos,
  obtenerHilo,
  crearHilo,
  actualizarHilo,
  eliminarHilo,
} from './forum.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { carrera_id, ramo_id, hashtag, orden, pagina, limite } = req.query;
    const { hilos, total } = await listarHilos({
      carrera_id: carrera_id ?? req.usuario.carrera_id,
      ramo_id,
      hashtag,
      orden,
      pagina,
      limite,
      usuario_id: req.usuario.id,
    });
    return ApiResponse.paginated(res, hilos, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function detalle(req, res, next) {
  try {
    const hilo = await obtenerHilo(req.params.id, req.usuario.id);
    return ApiResponse.success(res, hilo);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const hilo = await crearHilo({
      autor_id: req.usuario.id,
      carrera_id: req.usuario.carrera_id,
      ...req.body,
      archivos: req.files ?? [],
    });
    return ApiResponse.created(res, hilo);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizar(req, res, next) {
  try {
    const hilo = await actualizarHilo(req.params.id, req.usuario.id, req.body);
    return ApiResponse.success(res, hilo);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    await eliminarHilo(req.params.id, req.usuario.id, req.usuario.rol);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, detalle, crear, actualizar, eliminar };
