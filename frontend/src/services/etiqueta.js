//! capa de acceso a la API de etiquetas (genérica, usada por match de proyectos)
import { apiFetch } from './api';

export async function listarEtiquetas({ q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);

  const data = await apiFetch(`/etiquetas?${params.toString()}`);
  return data.data || [];
}
