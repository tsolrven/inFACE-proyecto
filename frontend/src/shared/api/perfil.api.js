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

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINACIÓN DE CUENTA
// ─────────────────────────────────────────────────────────────────────────────

export async function solicitarEliminacionCuenta(contrasena) {
  const data = await request('/perfil/me/eliminacion', {
    method: 'POST',
    body: { contrasena },
  });
  return data.data; // { eliminacion_programada_en, dias }
}

export async function cancelarEliminacionCuenta() {
  const data = await request('/perfil/me/eliminacion', { method: 'DELETE' });
  return data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AJUSTES DE CUENTA
// ─────────────────────────────────────────────────────────────────────────────

export async function cambiarContrasena(actual, nueva) {
  const data = await request('/perfil/me/contrasena', {
    method: 'PUT',
    body: { actual, nueva },
  });
  return data.data;
}

export async function actualizarConsentimientoInvestigacion(acepta) {
  const data = await request('/perfil/me/consentimiento', {
    method: 'PUT',
    body: { consentimiento_investigacion: acepta },
  });
  return data.data;
}