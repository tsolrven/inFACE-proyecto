import ApiResponse from '../../utils/apiResponse.js';
import {
  solicitarRecuperacion,
  restablecerContrasena,
} from './recuperacion.service.js';

async function olvideContrasena(req, res) {
  await solicitarRecuperacion(req.body.correo);
  return ApiResponse.success(res, {
    mensaje:
      'Si el correo tiene una cuenta, te enviamos un enlace para restablecer tu contraseña.',
  });
}

async function restablecer(req, res) {
  const data = await restablecerContrasena(req.body.token, req.body.nueva);
  return ApiResponse.success(res, data);
}

export { olvideContrasena, restablecer };
