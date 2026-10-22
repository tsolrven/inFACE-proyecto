import { useVotar } from '@/shared/post/votes/useVotar';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useMasRespuestas } from '@/shared/post/comments/useComments';
import {
  useCrearComentario,
  useEditarComentario,
  useEliminarComentario,
} from '@/shared/post/comments/useCommentMutations';

// Todas las acciones sobre comentarios en un solo objeto. Se llama UNA vez por
// hilo (en la página/modal del contenido) y se baja como prop `acciones`.
export function useCommentActions(tipoContenido, contenidoId, orden) {
  return {
    votar: useVotar('comentario'),
    guardar: useGuardar('comentario'),
    crear: useCrearComentario(tipoContenido, contenidoId),
    editar: useEditarComentario(),
    eliminar: useEliminarComentario(tipoContenido, contenidoId),
    masRespuestas: useMasRespuestas(tipoContenido, contenidoId, orden),
  };
}
