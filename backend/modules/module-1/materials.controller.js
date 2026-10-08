import {
  listarApuntes,
  obtenerApunte,
  crearApunte,
  actualizarApunte,
  eliminarApunte,
} from './materials.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { ramo_id, tipo, tipo_archivo, hashtag, orden, pagina, limite } =
      req.query;
    const { apuntes, total } = await listarApuntes({
      ramo_id,
      tipo,
      tipo_archivo,
      hashtag,
      orden,
      pagina,
      limite,
      usuario_id: req.usuario.id,
      carrera_id: req.usuario.carrera_id,
    });
    return ApiResponse.paginated(res, apuntes, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function detalle(req, res, next) {
  try {
    const apunte = await obtenerApunte(
      req.params.id,
      req.usuario.id,
      req.usuario.carrera_id,
    );
    return ApiResponse.success(res, apunte);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const apunte = await crearApunte({
      autor_id: req.usuario.id,
      carrera_id: req.usuario.carrera_id,
      ...req.body,
    });
    return ApiResponse.created(res, apunte);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizar(req, res, next) {
  try {
    const apunte = await actualizarApunte(
      req.params.id,
      req.usuario.id,
      req.usuario.rol,
      req.body,
    );
    return ApiResponse.success(res, apunte);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    await eliminarApunte(req.params.id, req.usuario.id, req.usuario.rol);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, detalle, crear, actualizar, eliminar };
