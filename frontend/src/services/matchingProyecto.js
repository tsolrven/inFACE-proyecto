//! capa de acceso a la API del módulo de match de proyectos

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
        }
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {

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
// PROYECTOS
// ─────────────────────────────────────────────────────────────────────────────

export async function listarProyectos({ modalidad, estado, etiquetas, creador_id, mias, pagina, limite } = {}) {
    const params = new URLSearchParams();
    if (modalidad) params.set('modalidad', modalidad);
    if (estado) params.set('estado', estado);
    if (etiquetas?.length) params.set('etiquetas', etiquetas.join(','));
    if (creador_id) params.set('creador_id', creador_id);
    if (mias) params.set('mias', 'true');
    params.set('pagina', pagina || 1);
    params.set('limite', limite || 50);

    const data = await request(`/proyecto?${params.toString()}`);
    return {
        datos: data.datos || [],
        total: data.total || 0,
        pagina: data.pagina || 1,
        total_paginas: data.total_paginas || 1,
    };
}

export async function listarMisProyectos({ pagina, limite } = {}) {
    const params = new URLSearchParams();
    params.set('pagina', pagina || 1);
    params.set('limite', limite || 50);

    const data = await request(`/proyecto/mios?${params.toString()}`);
    return {
        datos: data.datos || [],
        total: data.total || 0,
        pagina: data.pagina || 1,
        total_paginas: data.total_paginas || 1,
    };
}

export async function obtenerProyecto(id) {
    const data = await request(`/proyecto/${id}`);
    return data.data;
}

export async function crearProyecto(payload) {
    const data = await request('/proyecto', { method: 'POST', body: payload });
    return data.data;
}

export async function actualizarProyecto(id, payload) {
    const data = await request(`/proyecto/${id}`, { method: 'PUT', body: payload });
    return data.data;
}

export async function eliminarProyecto(id) {
    const data = await request(`/proyecto/${id}`, { method: 'DELETE' });
    return data.mensaje;
}

// ─────────────────────────────────────────────────────────────────────────────
// POSTULACIONES
// ─────────────────────────────────────────────────────────────────────────────

export async function postularProyecto(id, mensaje_postulacion) {
    const data = await request(`/proyecto/${id}/postular`, {
        method: 'POST',
        body: { mensaje_postulacion },
    });
    return data.data;
}

export async function listarPostulacionesProyecto(id) {
    const data = await request(`/proyecto/${id}/postulaciones`);
    return data.data || [];
}

export async function listarMisPostulaciones() {
    const data = await request('/proyecto/postulaciones/usuario');
    return data.data || [];
}

export async function responderPostulacion(proyectoId, postulacionId, estado) {
    const data = await request(`/proyecto/${proyectoId}/postulaciones/${postulacionId}`, {
        method: 'PATCH',
        body: { estado },
    });
    return data.data;
}

export async function retirarPostulacion(proyectoId, postulacionId) {
    const data = await request(`/proyecto/${proyectoId}/postulaciones/${postulacionId}`, {
        method: 'DELETE',
    });
    return data.mensaje;
}

export async function eliminarPostulacionRechazada(proyectoId, postulacionId) {
    const data = await request(`/proyecto/${proyectoId}/postulaciones/${postulacionId}/rechazada`, {
        method: 'DELETE',
    });
    return data.mensaje;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRANTES
// ─────────────────────────────────────────────────────────────────────────────

export async function listarIntegrantes(proyectoId) {
    const data = await request(`/proyecto/${proyectoId}/integrantes`);
    return data.data || [];
}

export async function expulsarIntegrante(proyectoId, usuarioId) {
    const data = await request(`/proyecto/${proyectoId}/integrantes/${usuarioId}`, {
        method: 'DELETE',
    });
    return data.mensaje;
}

export async function salirDeProyecto(proyectoId) {
    const data = await request(`/proyecto/${proyectoId}/salir`, { method: 'DELETE' });
    return data.mensaje;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAVORITOS
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleFavorito(proyectoId) {
    return await request(`/proyecto/${proyectoId}/favorito`, { method: 'POST' });
}

export async function listarFavoritos() {
    const data = await request('/proyecto/favoritos');
    return data.data || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMENDADOS (matching por etiquetas)
// ─────────────────────────────────────────────────────────────────────────────

export async function listarProyectosRecomendados({ pagina, limite } = {}) {
    const params = new URLSearchParams();
    params.set('pagina', pagina || 1);
    params.set('limite', limite || 20);

    const data = await request(`/proyecto/recomendados?${params.toString()}`);
    return {
        datos: data.datos || [],
        total: data.total || 0,
        pagina: data.pagina || 1,
        total_paginas: data.total_paginas || 1,
        tieneIntereses: data.tiene_intereses ?? true,
    };
}