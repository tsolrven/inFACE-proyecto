//! endpoints de autenticación (la mecánica de red y de token vive en api.js)
import {
  apiFetch,
  setAccessToken,
  clearAccessToken,
} from '../shared/api/client';

export function register({ correo, contrasena, nombre_usuario, carrera_id }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    auth: false,
    body: { correo, contrasena, nombre_usuario, carrera_id },
  });
}

export async function login({ correo, contrasena }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    auth: false,
    body: { correo, contrasena },
  });
  setAccessToken(data.data.accessToken);
  return data.data;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST', auth: false });
  } finally {
    clearAccessToken();
  }
}

export async function obtenerPerfilActual() {
  const data = await apiFetch('/auth/me');
  return data.data;
}
