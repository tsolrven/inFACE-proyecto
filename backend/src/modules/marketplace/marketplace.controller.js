import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from './marketplace.service.js';
import ApiResponse from '../../utils/apiResponse.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listar(req, res) {
  const { pagina, limite } = req.query;
  const { productos, total } = await listarProductos({
    ...req.query,
    usuario_id: req.usuario.id,
  });
  return ApiResponse.paginated(res, productos, total, pagina, limite);
}

async function detalle(req, res) {
  const producto = await obtenerProducto(req.params.id, req.usuario.id);
  return ApiResponse.success(res, producto);
}

async function crear(req, res) {
  const producto = await crearProducto({
    vendedor_id: req.usuario.id,
    ...req.body,
    archivos: req.files ?? [],
  });
  return ApiResponse.created(res, producto);
}

async function actualizar(req, res) {
  const producto = await actualizarProducto(
    req.params.id,
    req.usuario.id,
    req.body,
  );
  return ApiResponse.success(res, producto);
}

async function eliminar(req, res) {
  await eliminarProducto(req.params.id, req.usuario.id, req.usuario.rol);
  return ApiResponse.noContent(res);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listar, detalle, crear, actualizar, eliminar };