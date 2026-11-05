
import {
  apiFetch,
  setAccessToken,
  clearAccessToken,
} from '@/shared/api/client';

export function register({
  correo,
  contrasena,
  nombre_usuario,
  carrera_id,
  acepta_terminos,
  acepta_investigacion,
}) {
  return apiFetch('/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      correo,
      contrasena,
      nombre_usuario,
      carrera_id,
      acepta_terminos,
      acepta_investigacion,
    },
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

export async function aceptarTerminos({
  acepta_terminos,
  acepta_investigacion,
}) {
  const data = await apiFetch('/auth/aceptar-terminos', {
    method: 'POST',
    body: { acepta_terminos, acepta_investigacion },
  });
  return data.data;
}

export function solicitarRecuperacion(correo) {
  return apiFetch('/auth/olvide-contrasena', {
    method: 'POST',
    auth: false,
    body: { correo },
  });
}

export function restablecerContrasena(token, nueva) {
  return apiFetch('/auth/restablecer-contrasena', {
    method: 'POST',
    auth: false,
    body: { token, nueva },
  });
}