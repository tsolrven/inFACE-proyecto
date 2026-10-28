import { apiFetch } from '@/shared/api/client';

export async function votar(tipoContenido, id, tipo) {
  const res = await apiFetch(`/votos/${tipoContenido}/${id}`, {
    method: 'POST',
    body: { tipo },
  });
  return res.data;
}
