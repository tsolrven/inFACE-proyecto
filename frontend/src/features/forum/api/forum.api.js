import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarHilos({
  carrera_id,
  ramo_id,
  hashtag,
  orden,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    carrera_id,
    ramo_id,
    hashtag,
    orden,
    pagina,
    limite,
  });
  const res = await apiFetch(`/hilos${qs ? `?${qs}` : ''}`, { signal });
  return { hilos: res.data, meta: res.meta };
}

export async function eliminarHilo(id) {
  return apiFetch(`/hilos/${id}`, { method: 'DELETE' });
}
