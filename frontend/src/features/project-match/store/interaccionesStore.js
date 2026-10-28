import { create } from 'zustand';
import { votar as votarApi } from '@/shared/post/votes/votes.api';
import { predecirVoto } from '@/shared/post/votes/votes';

export const useInteraccionesProyecto = create((set, get) => ({
  porId: {},

  actualizar: (id, parche) =>
    set((s) => ({
      porId: { ...s.porId, [id]: { ...s.porId[id], ...parche } },
    })),

  votar: async (id, tipo, actual) => {
    const { mi_voto, delta } = predecirVoto(actual.mi_voto, tipo);
    get().actualizar(id, { mi_voto, votos_neto: actual.votos_neto + delta });
    try {
      const real = await votarApi(id, tipo);
      get().actualizar(id, {
        mi_voto: real.mi_voto,
        votos_neto: real.votos_neto,
      });
    } catch {
      get().actualizar(id, {
        mi_voto: actual.mi_voto,
        votos_neto: actual.votos_neto,
      });
    }
  },
}));

export function valoresEfectivos(proyecto, cambios) {
  return {
    mi_voto:
      cambios && 'mi_voto' in cambios
        ? cambios.mi_voto
        : (proyecto?.mi_voto ?? null),
    votos_neto:
      cambios && 'votos_neto' in cambios
        ? cambios.votos_neto
        : (proyecto?.votos_neto ?? 0),
    comentarios_count:
      cambios && 'comentarios_count' in cambios
        ? cambios.comentarios_count
        : (proyecto?.comentarios_count ?? 0),
  };
}

export function useValoresProyecto(proyecto) {
  const cambios = useInteraccionesProyecto((s) => s.porId[proyecto?.id]);
  return valoresEfectivos(proyecto, cambios);
}
