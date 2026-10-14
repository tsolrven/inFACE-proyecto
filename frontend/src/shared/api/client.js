const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── token de acceso (vive solo en memoria) ──────────────────────────────────
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}
export function clearAccessToken() {
  accessToken = null;
}

// ── utilidades ──────────────────────────────────────────────────────────────
async function parseBody(res) {
  const texto = await res.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

function buildError(data, status) {
  const err = data?.error ?? {};
  const error = new Error(err.message || data?.mensaje || 'Error desconocido');
  error.code = err.code || data?.codigo || 'UNKNOWN_ERROR';
  error.details = err.details ?? data?.detalles ?? null;
  error.status = status;
  return error;
}

// Una petición a la API. No sabe nada de reintentos ni de sesión.
// `auth: false` omite el header Authorization (login, registro, refresh, logout).
async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    responseType,
    ...rest
  } = options;

  const isFormData = body instanceof FormData;
  const finalHeaders = { ...headers };

  if (!isFormData && body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (auth && accessToken) {
    finalHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  // `...rest` va primero: así nada de lo que venga en options puede pisar
  // el método, los headers, las cookies ni el cuerpo ya preparados
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  if (res.ok) {
    if (res.status === 204) return null;
    return responseType === 'blob' ? res.blob() : parseBody(res);
  }
  throw buildError(await parseBody(res), res.status);
}

// ── refresco de sesión ──────────────────────────────────────────────────────
// Si varias peticiones fallan con 401 a la vez, comparten un único refresh.
let refreshPromise = null;

export function refrescarSesion() {
  if (!refreshPromise) {
    refreshPromise = request('/auth/refresh', { method: 'POST', auth: false })
      .then((data) => {
        accessToken = data.data.accessToken;
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ── petición con sesión: si el token venció, refresca y reintenta una vez ───
export async function apiFetch(path, options = {}) {
  try {
    return await request(path, options);
  } catch (error) {
    if (error.status !== 401 || options.auth === false) throw error;

    try {
      await refrescarSesion();
    } catch {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw error;
    }
    return request(path, options);
  }
}
