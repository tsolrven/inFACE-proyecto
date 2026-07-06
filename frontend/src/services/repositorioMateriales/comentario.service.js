import { apiFetch } from '../api';

export async function listarComentarios(apunteId) {
  const res = await apiFetch(`/comentarios/${apunteId}`);
  return res.data;
}

export async function crearComentario(apunteId, { contenido, padre_id } = {}) {
  const res = await apiFetch(`/comentarios/${apunteId}`, {
    method: 'POST',
    body: { contenido, padre_id },
  });
  return res.data;
}
