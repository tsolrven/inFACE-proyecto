import { apiFetch } from '@/shared/api/client';

export async function listarComentarios(contenidoId, tipo = 'apunte') {
  const res = await apiFetch(`/comentarios/${tipo}/${contenidoId}`);
  return res.data;
}

export async function crearComentario(
  contenidoId,
  { contenido, padre_id } = {},
  tipo = 'apunte',
) {
  const res = await apiFetch(`/comentarios/${tipo}/${contenidoId}`, {
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