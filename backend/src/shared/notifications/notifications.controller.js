import ApiResponse from '../../utils/apiResponse.js';
import {
  listarMisNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
} from './notifications.service.js';

async function listar(req, res) {
  const data = await listarMisNotificaciones(req.usuario.id, {
    limite: req.query.limite,
    soloNoLeidas: req.query.solo_no_leidas === 'true',
  });
  return ApiResponse.success(res, data);
}

async function leer(req, res) {
  const data = await marcarComoLeida(req.params.id, req.usuario.id);
  return ApiResponse.success(res, data);
}

async function leerTodas(req, res) {
  const data = await marcarTodasComoLeidas(req.usuario.id);
  return ApiResponse.success(res, data);
}

async function eliminar(req, res) {
  const data = await eliminarNotificacion(req.params.id, req.usuario.id);
  return ApiResponse.success(res, data);
}

export { listar, leer, leerTodas, eliminar };
