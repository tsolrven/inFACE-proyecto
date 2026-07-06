//! capa de acceso a la API de etiquetas (genérica, usada por match de proyectos)

import { getAccessToken, refreshAccessToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function listarEtiquetas({ q } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);

    async function ejecutar(retry = true) {
        const token = getAccessToken(); // se lee de nuevo en cada intento, no queda "pegado"

        const res = await fetch(`${API_URL}/etiquetas?${params.toString()}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: 'include',
        });

        if (res.status === 401 && retry) {
            await refreshAccessToken();
            return ejecutar(false);
        }

        const data = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(data?.error?.message || 'No se pudieron cargar las etiquetas');
        }
        return data.data || [];
    }

    return ejecutar();
}