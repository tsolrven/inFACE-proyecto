import { create } from 'zustand';
import {
  listarApuntes,
  actualizarApunte,
  eliminarApunte,
} from '../services/repositorioMateriales/apunte.service';
import { votarApunte } from '../services/repositorioMateriales/voto.service';
import { alternarGuardadoApunte } from '../services/repositorioMateriales/guardado.service';
import { predecirVoto } from '../utils/votos';

const FILTROS_INICIALES = {
  ramo_id: null,
  tipo_archivo: null,
  hashtag: null,
  orden: 'recientes',
};

export const useRepositorioStore = create((set, get) => ({
  filtros: { ...FILTROS_INICIALES },
  apuntes: [],
  meta: null,
  pagina: 1,
  cargando: false,
  cargandoMas: false,
  error: null,

  fetchApuntes: async () => {
    set({ cargando: true, error: null });
    try {
      const { filtros } = get();
      const { apuntes, meta } = await listarApuntes({ ...filtros, pagina: 1 });
      set({ apuntes, meta, pagina: 1, cargando: false });
    } catch (err) {
      set({ error: err.message, cargando: false });
    }
  },

  cargarMasApuntes: async () => {
    const { meta, pagina, filtros, cargandoMas } = get();
    if (cargandoMas || (meta && !meta.hasNext)) return;

    set({ cargandoMas: true });
    try {
      const siguiente = pagina + 1;
      const { apuntes, meta: nuevaMeta } = await listarApuntes({
        ...filtros,
        pagina: siguiente,
      });
      set((state) => ({
        apuntes: [...state.apuntes, ...apuntes],
        meta: nuevaMeta,
        pagina: siguiente,
        cargandoMas: false,
      }));
    } catch (err) {
      set({ error: err.message, cargandoMas: false });
    }
  },

  setFiltro: (key, value) => {
    set((state) => ({ filtros: { ...state.filtros, [key]: value } }));
    get().fetchApuntes();
  },

  resetFiltros: () => {
    set({ filtros: { ...FILTROS_INICIALES } });
    get().fetchApuntes();
  },

  votar: async (apunteId, tipo) => {
    const previo = get().apuntes.find((a) => a.id === apunteId);
    if (!previo) return;

    // 1) predicción instantánea
    set((state) => ({
      apuntes: state.apuntes.map((a) => {
        if (a.id !== apunteId) return a;
        const { mi_voto, delta } = predecirVoto(a.mi_voto, tipo);
        return { ...a, mi_voto, votos_neto: a.votos_neto + delta };
      }),
    }));

    try {
      // 2) el servidor manda la verdad y reemplaza la predicción
      const { votos_neto, mi_voto } = await votarApunte(apunteId, tipo);
      set((state) => ({
        apuntes: state.apuntes.map((a) =>
          a.id === apunteId ? { ...a, votos_neto, mi_voto } : a,
        ),
      }));
    } catch (err) {
      // 3) si falla, vuelve solo este apunte a como estaba
      set((state) => ({
        apuntes: state.apuntes.map((a) =>
          a.id === apunteId
            ? { ...a, mi_voto: previo.mi_voto, votos_neto: previo.votos_neto }
            : a,
        ),
        error: err.message,
      }));
    }
  },

  actualizarApunteEnFeed: (apunteId, cambios) => {
    set((state) => ({
      apuntes: state.apuntes.map((a) =>
        a.id === apunteId ? { ...a, ...cambios } : a,
      ),
    }));
  },

  guardar: async (apunteId) => {
    const anterior = get().apuntes;

    set((state) => ({
      apuntes: state.apuntes.map((a) =>
        a.id === apunteId ? { ...a, esta_guardado: !a.esta_guardado } : a,
      ),
    }));

    try {
      const { guardado } = await alternarGuardadoApunte(apunteId);
      get().actualizarApunteEnFeed(apunteId, { esta_guardado: guardado });
    } catch (err) {
      set({ apuntes: anterior, error: err.message });
    }
  },

  editarApunte: async (apunteId, payload) => {
    const actualizado = await actualizarApunte(apunteId, payload);
    const {
      titulo,
      descripcion,
      ramo,
      hashtags,
      links,
      codigo_snippet,
      lenguaje_snippet,
      etiquetas_visuales,
      editado_en,
    } = actualizado;
    get().actualizarApunteEnFeed(apunteId, {
      titulo,
      descripcion,
      ramo,
      hashtags,
      links,
      codigo_snippet,
      lenguaje_snippet,
      etiquetas_visuales,
      editado_en,
    });
    return actualizado;
  },

  eliminarApunteDelFeed: async (apunteId) => {
    await eliminarApunte(apunteId);
    set((state) => ({
      apuntes: state.apuntes.filter((a) => a.id !== apunteId),
    }));
  },
}));
