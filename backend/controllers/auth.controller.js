import {
  registrar,
  iniciarSesion,
  refrescarToken,
  obtenerUsuarioActual,
} from '../services/auth.service.js';
import ApiResponse from '../utils/apiResponse.js';
import logger from '../lib/logger.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
// ────────────────────────────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const usuario = await registrar(req.body);
    return ApiResponse.created(res, usuario);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { accessToken, refreshToken, usuario } = await iniciarSesion(
      req.body,
    );
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
    return ApiResponse.success(res, { accessToken, usuario });
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    const { accessToken } = await refrescarToken(token);
    return ApiResponse.success(res, { accessToken });
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function logout(req, res) {
  const { maxAge, ...opcionesLimpieza } = REFRESH_COOKIE_OPTS;
  res.clearCookie('refreshToken', opcionesLimpieza);
  return ApiResponse.success(res, { mensaje: 'Sesión cerrada' });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function me(req, res, next) {
  try {
    const usuario = await obtenerUsuarioActual(req.usuario.id);
    return ApiResponse.success(res, usuario);
  } catch (err) {
    next(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { register, login, refresh, logout, me };
