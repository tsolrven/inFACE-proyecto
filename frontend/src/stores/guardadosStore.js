import { create } from 'zustand';
import { listarGuardados } from '../services/repositorioMateriales/guardado.service';

export const useGuardadosStore = create((set, get) => ({
  tipo: 'apunte', //apunte o comentaerio
  items: [],
  meta: null,
  pagina: 1,
  cargando: false,
  cargandoMas: false,
  error: null,

  setTipo: (tipo) => {
    if (get().tipo === tipo) return;
    set({ tipo });
    get().fetchGuardados();
  },

  fetchGuardados: async () => {
    set({ cargando: true, error: null });
    try {
      const { tipo } = get();
      const { items, meta } = await listarGuardados({ tipo, pagina: 1 });
      set({ items, meta, pagina: 1, cargando: false });
    } catch (err) {
      set({ error: err.message, cargando: false });
    }
  },

  cargarMasGuardados: async () => {
    const { meta, pagina, tipo, cargandoMas } = get();
    if (cargandoMas || (meta && !meta.hasNext)) return;

    set({ cargandoMas: true });
    try {
      const siguiente = pagina + 1;
      const { items, meta: nuevaMeta } = await listarGuardados({
        tipo,
        pagina: siguiente,
      });
      set((state) => ({
        items: [...state.items, ...items],
        meta: nuevaMeta,
        pagina: siguiente,
        cargandoMas: false,
      }));
    } catch (err) {
      set({ error: err.message, cargandoMas: false });
    }
  },

  // usado cuando el usuario quita algo de sus guardados directamente desde esta vista
  quitarDeGuardados: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      meta: state.meta ? { ...state.meta, total: state.meta.total - 1 } : state.meta,
    }));
  },
}));
