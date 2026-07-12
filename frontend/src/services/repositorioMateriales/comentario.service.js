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

export async function editarComentario(comentarioId, contenido) {
  const res = await apiFetch(`/comentarios/comentario/${comentarioId}`, {
    method: 'PATCH',
    body: { contenido },
  });
  return res.data;
}

export async function eliminarComentario(comentarioId) {
  const res = await apiFetch(`/comentarios/comentario/${comentarioId}`, {
    method: 'DELETE',
  });
  return res.data;
}
