import { apiFetch } from '@/shared/api/client';

export async function votarApunte(apunteId, tipo) {
  const res = await apiFetch(`/votos/apunte/${apunteId}`, {
    method: 'POST',
    body: { tipo },
  });
  return res.data;
}

export async function votarComentario(comentarioId, tipo) {
  const res = await apiFetch(`/votos/comentario/${comentarioId}`, {
    method: 'POST',
    body: { tipo },
  });
  return res.data;
}
