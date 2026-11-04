import {
  listarAnuncios,
  obtenerAnuncio,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio,
} from './announcements.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res, next) {
  try {
    const { carrera_id, flair_id, hashtag, orden, pagina, limite } = req.query;
    const { anuncios, total } = await listarAnuncios({
      carrera_id: carrera_id ?? req.usuario.carrera_id,
      flair_id,
      hashtag,
      orden,
      pagina,
      limite,
      usuario_id: req.usuario.id,
    });
    return ApiResponse.paginated(res, anuncios, total, pagina, limite);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function detalle(req, res, next) {
  try {
    const anuncio = await obtenerAnuncio(req.params.id, req.usuario.id);
    return ApiResponse.success(res, anuncio);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crear(req, res, next) {
  try {
    const anuncio = await crearAnuncio({
      usuario: req.usuario,
      ...req.body,
      archivos: req.files ?? [],
    });
    return ApiResponse.created(res, anuncio);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizar(req, res, next) {
  try {
    const anuncio = await actualizarAnuncio(
      req.params.id,
      req.usuario,
      req.body,
    );
    return ApiResponse.success(res, anuncio);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminar(req, res, next) {
  try {
    await eliminarAnuncio(req.params.id, req.usuario);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, detalle, crear, actualizar, eliminar };
