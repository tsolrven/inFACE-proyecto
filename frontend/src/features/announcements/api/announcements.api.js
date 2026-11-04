import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarAnuncios({
  carrera_id,
  flair_id,
  hashtag,
  orden,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    carrera_id,
    flair_id,
    hashtag,
    orden,
    pagina,
    limite,
  });
  const res = await apiFetch(`/anuncios${qs ? `?${qs}` : ''}`, { signal });
  return { anuncios: res.data, meta: res.meta };
}
