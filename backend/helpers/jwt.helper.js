//! helper de autenticación jwt (funciones para crear y validar tokens jwt)

import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generarAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

function generarRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

function verificarAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verificarRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

export {
  generarAccessToken,
  generarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
};
