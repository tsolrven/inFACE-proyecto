import { apiFetch } from '@/shared/api/client';

// Conteos del panel de administración del Inicio (solo superadmin)
export async function obtenerResumenAdmin({ signal } = {}) {
  const res = await apiFetch('/admin/resumen', { signal });
  return res.data;
}