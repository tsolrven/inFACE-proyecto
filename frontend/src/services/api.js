import { getAccessToken, refreshAccessToken, clearAccessToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let refreshPromise = null;

function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

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
  const error = new Error(err.message || 'Error desconocido');
  error.code = err.code || 'UNKNOWN_ERROR';
  error.details = err.details ?? null;
  error.status = status;
  return error;
}

/**
 * @param {string} path - ej. '/apuntes' (se le antepone API_URL)
 * @param {object} options
 * @param {string} [options.method='GET']
 * @param {object|FormData} [options.body]
 * @param {boolean} [options._isRetry] - uso interno, no pasar manualmente
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, _isRetry = false, ...rest } = options;

  const isFormData = body instanceof FormData;
  const headers = { ...(rest.headers || {}) };

  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  // Nunca seteamos Content-Type manualmente en FormData: el navegador
  // arma el "multipart/form-data; boundary=..." correcto solo.

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // manda la cookie del refresh token
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    ...rest,
  });

  // 204 No Content no trae body
  if (res.status === 204) return null;

  const data = await parseBody(res);

  if (res.ok) return data;

  // si el access token venció, intentamos refrescar UNA sola vez y reintentar
  if (res.status === 401 && !_isRetry) {
    try {
      await getRefreshPromise();
      return apiFetch(path, { ...options, _isRetry: true });
    } catch {
      clearAccessToken();
      // deja que quien use esto (ej. authStore) decida qué hacer;
      // emitimos un evento global para que App.jsx pueda reaccionar
      // (ej. redirigir a /login) sin acoplar este archivo a react-router.
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw buildError(data, res.status);
    }
  }

  throw buildError(data, res.status);
}
