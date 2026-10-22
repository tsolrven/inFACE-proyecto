import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alternarGuardado } from '@/shared/post/bookmarks/bookmarks.api';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  instantanea,
  parchearContenido,
  quitarDeGuardados,
  restaurar,
} from '@/shared/post/cache';

export function useGuardar(tipoContenido) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => alternarGuardado(tipoContenido, id),

    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: [tipoContenido] });
      const snapshot = instantanea(qc, tipoContenido);
      parchearContenido(qc, tipoContenido, id, (item) => ({
        esta_guardado: !item.esta_guardado,
      }));
      return { snapshot };
    },

    onSuccess: ({ guardado }, { id }) => {
      parchearContenido(qc, tipoContenido, id, { esta_guardado: guardado });
      if (!guardado) quitarDeGuardados(qc, tipoContenido, id);
      mostrarToast(guardado ? 'Guardado' : 'Quitado de guardados');
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.snapshot) restaurar(qc, ctx.snapshot);
      mostrarToast(err.message || 'No se pudo actualizar tus guardados');
    },

    // la lista de guardados cambia de contenido: se vuelve a pedir
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ['guardados', tipoContenido] }),
  });
}
