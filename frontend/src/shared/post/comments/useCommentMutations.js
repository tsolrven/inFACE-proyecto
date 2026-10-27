import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  crearComentario,
  editarComentario,
  eliminarComentario,
} from '@/shared/post/comments/comments.api';
import { commentKeys } from '@/shared/post/comments/useComments';
import {
  insertarRaiz,
  insertarRespuesta,
  quitarNodos,
} from '@/shared/post/comments/commentTree';
import {
  buscarContenido,
  parchearContenido,
  quitarDeGuardados,
} from '@/shared/post/cache';
import { mostrarToast } from '@/shared/stores/toastStore';

// Mantiene al día el contador de comentarios del contenido (feed y detalle).
function sumarComentarios(qc, tipoContenido, contenidoId, delta) {
  parchearContenido(qc, tipoContenido, contenidoId, (item) => ({
    comentarios_count: Math.max(0, (item.comentarios_count ?? 0) + delta),
  }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCrearComentario(tipoContenido, contenidoId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contenido, padre_id }) =>
      crearComentario(tipoContenido, contenidoId, { contenido, padre_id }),

    onSuccess: (nuevo, { padre_id }) => {
      // se inserta en el árbol de todos los órdenes ya cargados
      qc.setQueriesData(
        { queryKey: commentKeys.contenido(tipoContenido, contenidoId) },
        (data) =>
          padre_id
            ? insertarRespuesta(data, padre_id, nuevo)
            : insertarRaiz(data, nuevo),
      );
      sumarComentarios(qc, tipoContenido, contenidoId, 1);
    },

    onError: (err) =>
      mostrarToast(err.message || 'No se pudo publicar el comentario'),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEditarComentario() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, contenido }) => editarComentario(id, contenido),

    onSuccess: (actualizado, { id }) => {
      parchearContenido(qc, 'comentario', id, {
        contenido: actualizado.contenido,
        editado_en: actualizado.editado_en,
      });
    },

    onError: (err) =>
      mostrarToast(err.message || 'No se pudo guardar la edición'),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEliminarComentario(tipoContenido, contenidoId, alEliminar) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (comentarioId) => eliminarComentario(comentarioId),

    onSuccess: (resultado, comentarioId) => {
      // se lee ANTES de tocar el caché: ¿contaba como comentario visible?
      const eraVisible =
        buscarContenido(qc, 'comentario', comentarioId)?.eliminado === false;

      if (resultado.eliminado_permanente) {
        // incluye los fantasmas que el servidor podó hacia arriba
        const ids = new Set(resultado.ids_eliminados);
        qc.setQueriesData(
          { queryKey: commentKeys.contenido(tipoContenido, contenidoId) },
          (data) => quitarNodos(data, ids),
        );
        ids.forEach((id) => quitarDeGuardados(qc, 'comentario', id));
      } else {
        // queda como fantasma "[eliminado]": se actualiza en todas las copias
        parchearContenido(qc, 'comentario', comentarioId, resultado.comentario);
        quitarDeGuardados(qc, 'comentario', comentarioId);
      }

      if (eraVisible) sumarComentarios(qc, tipoContenido, contenidoId, -1);

      alEliminar?.(comentarioId, resultado);
    },

    onError: (err) =>
      mostrarToast(err.message || 'No se pudo eliminar el comentario'),
  });
}
