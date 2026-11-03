import ApiResponse from '../../utils/apiResponse.js';
import {
  solicitarEliminacionCuenta,
  cancelarEliminacionCuenta,
} from './cuentaEliminacion.service.js';
import {
  cambiarContrasenaUsuario,
  actualizarConsentimientoInvestigacion,
} from './cuentaAjustes.service.js';

async function solicitarEliminacion(req, res) {
  const data = await solicitarEliminacionCuenta(
    req.usuario.id,
    req.body?.contrasena,
  );
  return ApiResponse.success(res, data);
}

async function cancelarEliminacion(req, res) {
  const data = await cancelarEliminacionCuenta(req.usuario.id);
  return ApiResponse.success(res, data);
}

async function cambiarContrasena(req, res) {
  const data = await cambiarContrasenaUsuario(
    req.usuario.id,
    req.body.actual,
    req.body.nueva,
  );
  return ApiResponse.success(res, data);
}

async function cambiarConsentimiento(req, res) {
  const data = await actualizarConsentimientoInvestigacion(
    req.usuario.id,
    req.body.consentimiento_investigacion,
  );
  return ApiResponse.success(res, data);
}

export {
  solicitarEliminacion,
  cancelarEliminacion,
  cambiarContrasena,
  cambiarConsentimiento,
};