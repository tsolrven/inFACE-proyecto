import { apiFetch } from '@/shared/api/client';

export async function listarNotificaciones({ limite = 20 } = {}) {
    const res = await apiFetch(`/notificaciones?limite=${limite}`);
    return res.data;
}

export function marcarNotificacionLeida(id) {
    return apiFetch(`/notificaciones/${id}/leer`, { method: 'PATCH' });
}

export function marcarTodasLeidas() {
    return apiFetch('/notificaciones/leer-todas', { method: 'PATCH' });
}

export function eliminarNotificacion(id) {
    return apiFetch(`/notificaciones/${id}`, { method: 'DELETE' });
}