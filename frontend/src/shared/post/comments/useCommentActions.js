import { useVotar } from '@/shared/post/votes/useVotar';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useMasRespuestas } from '@/shared/post/comments/useComments';
import {
  useCrearComentario,
  useEditarComentario,
  useEliminarComentario,
} from '@/shared/post/comments/useCommentMutations';

// Todas las acciones sobre comentarios en un solo objeto. Se llama UNA vez por
// contenido (en CommentsSection) y se baja como prop `acciones`.
// opciones.claveFijado: caché del comentario fijado (ej: respuesta aceptada).
// opciones.alEliminar: (comentarioId, resultado) tras eliminar con éxito.
export function useCommentActions(
  tipoContenido,
  contenidoId,
  orden,
  { claveFijado, alEliminar } = {},
) {
  return {
    votar: useVotar('comentario'),
    guardar: useGuardar('comentario'),
    crear: useCrearComentario(tipoContenido, contenidoId),
    editar: useEditarComentario(),
    eliminar: useEliminarComentario(tipoContenido, contenidoId, alEliminar),
    masRespuestas: useMasRespuestas(tipoContenido, contenidoId, orden),
    // el comentario fijado siempre se pide en orden 'mejores'
    masRespuestasFijado: useMasRespuestas(
      tipoContenido,
      contenidoId,
      'mejores',
      claveFijado,
    ),
  };
}
