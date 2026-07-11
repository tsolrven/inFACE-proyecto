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

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, _isRetry = false, ...rest } = options;

  const isFormData = body instanceof FormData;
  const headers = { ...(rest.headers || {}) };

  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    ...rest,
  });

  if (res.status === 204) return null;

  const data = await parseBody(res);

  if (res.ok) return data;

  if (res.status === 401 && !_isRetry) {
    try {
      await getRefreshPromise();
      return apiFetch(path, { ...options, _isRetry: true });
    } catch {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw buildError(data, res.status);
    }
  }

  throw buildError(data, res.status);
}
