//! capa de acceso a la API de perfil (datos básicos + intereses del usuario)

import { getAccessToken, refreshAccessToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─────────────────────────────────────────────────────────────────────────────
async function request(path, { method = 'GET', body, retry = true } = {}) {
    const token = getAccessToken();

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && retry) {
        try {
            await refreshAccessToken();
            return request(path, { method, body, retry: false });
        } catch {
            // se deja caer al manejo de error normal
        }
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // los endpoints de perfil usan manejarController, que responde { ok:false, codigo, mensaje, detalles }
        const mensaje = data?.mensaje || data?.error?.message || 'Ocurrió un error inesperado';
        const codigo = data?.codigo || data?.error?.code;
        const detalles = data?.detalles || data?.error?.details || null;

        const error = new Error(mensaje);
        error.code = codigo;
        error.details = detalles;
        error.status = res.status;
        throw error;
    }

    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────────────────────────────────────

export async function obtenerMiPerfil() {
    const data = await request('/perfil/me');
    return data.data;
}

export async function actualizarMiPerfil(payload) {
    const data = await request('/perfil/me', { method: 'PUT', body: payload });
    return data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERESES (etiquetas del usuario)
// ─────────────────────────────────────────────────────────────────────────────

export async function actualizarMisIntereses(etiqueta_ids) {
    const data = await request('/perfil/me/etiquetas', {
        method: 'PUT',
        body: { etiqueta_ids },
    });
    return data.data;
}