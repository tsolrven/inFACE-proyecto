import {
  listarObras,
  obtenerObra,
  crearObra,
  actualizarObra,
  eliminarObra,
  reemplazarImagenEspecial,
  quitarImagenEspecial,
  obtenerParrafosDeCapitulo,
  resolverParrafo,
  listarComentariosDeParrafos,
  listarHashtagsPopulares,
} from './creative.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res) {
  const { tipo, hashtag, orden, solo_mias, busqueda, pagina, limite } =
    req.query;
  const { obras, total } = await listarObras({
    tipo,
    hashtag,
    orden,
    solo_mias,
    busqueda,
    pagina,
    limite,
    usuario_id: req.usuario.id,
  });
  return ApiResponse.paginated(res, obras, total, pagina, limite);
}

async function detalle(req, res) {
  const obra = await obtenerObra(req.params.id, req.usuario.id);
  return ApiResponse.success(res, obra);
}

async function crear(req, res) {
  const obra = await crearObra({
    autor_id: req.usuario.id,
    ...req.body,
    archivos: req.files ?? [],
  });
  return ApiResponse.created(res, obra);
}

async function actualizar(req, res) {
  const obra = await actualizarObra(req.params.id, req.usuario.id, req.body);
  return ApiResponse.success(res, obra);
}

async function eliminar(req, res) {
  await eliminarObra(req.params.id, req.usuario.id, req.usuario.rol);
  return ApiResponse.noContent(res);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function subirImagen(req, res) {
  const [file] = req.files ?? [];
  if (!file) {
    const { BadRequestError } = await import('../../errors/appError.js');
    throw new BadRequestError('Debes adjuntar un archivo');
  }
  const archivo = await reemplazarImagenEspecial({
    obra_id: req.params.id,
    usuario_id: req.usuario.id,
    personaje_id: req.params.personajeId ?? null,
    pista_id: req.params.pistaId ?? null,
    file,
  });
  return ApiResponse.success(res, archivo);
}

async function quitarImagen(req, res) {
  await quitarImagenEspecial({
    obra_id: req.params.id,
    usuario_id: req.usuario.id,
    personaje_id: req.params.personajeId ?? null,
    pista_id: req.params.pistaId ?? null,
  });
  return ApiResponse.noContent(res);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function parrafosDeCapitulo(req, res) {
  const parrafos = await obtenerParrafosDeCapitulo(req.params.id);
  return ApiResponse.success(res, parrafos);
}

async function resolver(req, res) {
  const parrafo = await resolverParrafo(req.params.id, req.params.indice);
  return ApiResponse.success(res, parrafo);
}
async function comentariosDeParrafos(req, res) {
  const items = await listarComentariosDeParrafos(
    req.params.id,
    req.usuario.id,
  );
  return ApiResponse.success(res, items);
}

async function hashtagsPopulares(req, res) {
  const items = await listarHashtagsPopulares(req.query.limite);
  return ApiResponse.success(res, items);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
  subirImagen,
  quitarImagen,
  parrafosDeCapitulo,
  resolver,
  comentariosDeParrafos,
  hashtagsPopulares,
};