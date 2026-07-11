import {
  listarApuntes,
  obtenerApunte,
  crearApunte,
  actualizarApunte,
  eliminarApunte,
} from '../services/apunte.service.js';
import ApiResponse from '../utils/ApiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { ramo_id, tipo, tipo_archivo, hashtag, orden, pagina, limite } =
      req.query;
    const pag = pagina ? parseInt(pagina) : 1;
    const lim = limite ? parseInt(limite) : 20;
    const { apuntes, total } = await listarApuntes({
      ramo_id,
      tipo,
      tipo_archivo,
      hashtag,
      orden,
      pagina: pag,
      limite: lim,
      usuario_id: req.usuario.id,
      carrera_id: req.usuario.carrera_id,
    });
    return ApiResponse.paginated(res, apuntes, total, pag, lim);
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
