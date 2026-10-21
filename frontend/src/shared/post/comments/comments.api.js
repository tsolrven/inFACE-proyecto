import { apiFetch } from '@/shared/api/client';

export async function listarComentarios(tipoContenido, contenidoId) {
  const res = await apiFetch(`/comentarios/${tipoContenido}/${contenidoId}`);
  return res.data;
}

export async function crearComentario(
  tipoContenido,
  contenidoId,
  { contenido, padre_id } = {},
) {
  const res = await apiFetch(`/comentarios/${tipoContenido}/${contenidoId}`, {
    method: 'POST',
    body: { contenido, padre_id },
  });
  return res.data;
}

export async function editarComentario(comentarioId, contenido) {
  const res = await apiFetch(`/comentarios/${comentarioId}`, {
    method: 'PATCH',
    body: { contenido },
  });
  return res.data;
}

export async function eliminarComentario(comentarioId) {
  const res = await apiFetch(`/comentarios/${comentarioId}`, {
    method: 'DELETE',
  });
  return res.data;
}
