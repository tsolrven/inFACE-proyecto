//! capa de acceso a la API de perfil (datos básicos + intereses del usuario)
import { apiFetch } from '@/shared/api/client';

function request(path, { method = 'GET', body } = {}) {
  return apiFetch(path, { method, body });
}
// ─────────────────────────────────────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────────────────────────────────────

export async function obtenerMiPerfil() {
  const data = await request('/perfil/me');
  return data.data;
}

export async function obtenerPerfilPublico(nombreUsuario) {
  const data = await request(
    `/perfil/usuario/${encodeURIComponent(nombreUsuario)}`,
  );
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
