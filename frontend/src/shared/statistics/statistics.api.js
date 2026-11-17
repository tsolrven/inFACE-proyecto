import { apiFetch } from '@/shared/api/client';

// tipo: 'apunte' | 'hilo' | 'anuncio' (backend: /api/estadisticas/:tipo/...)
// carreraId: la de la comunidad; sin él, el backend usa la del usuario
function ruta(tipo, recurso, carreraId) {
  const qs = carreraId
    ? `?${new URLSearchParams({ carrera_id: carreraId })}`
    : '';
  return `/estadisticas/${tipo}/${recurso}${qs}`;
}

export async function listarTopColaboradores(tipo, carreraId) {
  const res = await apiFetch(ruta(tipo, 'top-colaboradores', carreraId));
  return res.data;
}

// devuelve { dias, hashtags: [{ nombre, usos }] }
export async function listarHashtagsPopulares(tipo, carreraId) {
  const res = await apiFetch(ruta(tipo, 'hashtags-populares', carreraId));
  return res.data;
}