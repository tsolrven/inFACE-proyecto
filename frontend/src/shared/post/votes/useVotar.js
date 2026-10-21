import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votar } from '@/shared/post/votes/votes.api';
import { predecirVoto } from '@/shared/post/votes/votes';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  buscarContenido,
  instantanea,
  parchearContenido,
  restaurar,
} from '@/shared/post/cache';

export function useVotar(tipoContenido) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tipo }) => votar(tipoContenido, id, tipo),

    // 1) predicción instantánea en todas las copias
    onMutate: async ({ id, tipo }) => {
      await qc.cancelQueries({ queryKey: [tipoContenido] });
      const snapshot = instantanea(qc, tipoContenido);
      const actual = buscarContenido(qc, tipoContenido, id);
      if (actual) {
        const { mi_voto, delta } = predecirVoto(actual.mi_voto, tipo);
        parchearContenido(qc, tipoContenido, id, (item) => ({
          mi_voto,
          votos_neto: item.votos_neto + delta,
        }));
      }
      return { snapshot };
    },

    // 2) la verdad del servidor reemplaza la predicción
    onSuccess: (real, { id }) => {
      parchearContenido(qc, tipoContenido, id, {
        mi_voto: real.mi_voto,
        votos_neto: real.votos_neto,
      });
    },

    // 3) si falla: deshace y avisa
    onError: (err, _vars, ctx) => {
      if (ctx?.snapshot) restaurar(qc, ctx.snapshot);
      mostrarToast(err.message || 'No se pudo registrar tu voto');
    },
  });
}
