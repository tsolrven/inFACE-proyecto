import { apiFetch } from '@/shared/api/client';

export async function listarComentarios({
  tipoContenido,
  contenidoId,
  orden = 'mejores',
  cursor,
  signal,
}) {
  const qs = new URLSearchParams({ orden });
  if (cursor) qs.set('cursor', cursor);
  const res = await apiFetch(
    `/comentarios/${tipoContenido}/${contenidoId}?${qs}`,
    { signal },
  );
  return { items: res.data, meta: res.meta };
}

export async function listarRespuestas({
  comentarioId,
  orden = 'mejores',
  cursor,
  signal,
}) {
  const qs = new URLSearchParams({ orden });
  if (cursor) qs.set('cursor', cursor);
  const res = await apiFetch(`/comentarios/${comentarioId}/respuestas?${qs}`, {
    signal,
  });
  return { items: res.data, meta: res.meta };
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

// Un comentario con el camino desde su raíz (GET /comentarios/:id/contexto).
// Devuelve { raiz, ruta, contenido }: `ruta` son los ids de la raíz al comentario.
export async function obtenerContextoComentario({ comentarioId, signal }) {
  const res = await apiFetch(`/comentarios/${comentarioId}/contexto`, {
    signal,
  });
  return res.data;
}
