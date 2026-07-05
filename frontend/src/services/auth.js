//! capa de acceso a la API de autenticación

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}
// ─────────────────────────────────────────────────────────────────────────────
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const err = data?.error ?? {};
    const error = new Error(err.message || 'Error desconocido');
    error.code = err.code;
    error.details = err.details ?? null;
    error.status = res.status;
    throw error;
  }
  return data;
}
// ─────────────────────────────────────────────────────────────────────────────
export async function register({ correo, contrasena, nombre_usuario }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena, nombre_usuario }),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function login({ correo, contrasena }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
    credentials: 'include', 
  });
  const data = await handleResponse(res);
  setAccessToken(data.data.accessToken);
  return data.data; 
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  clearAccessToken();
}

export async function refreshAccessToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await handleResponse(res);
  setAccessToken(data.data.accessToken);
  return data.data.accessToken;
}
