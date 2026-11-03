import { create } from 'zustand';

const FILTROS_INICIALES = {
  ramo_id: null,
  orden: 'recientes',
};

export const useForumFiltrosStore = create((set) => ({
  filtros: { ...FILTROS_INICIALES },
  setFiltro: (key, value) =>
    set((state) => ({ filtros: { ...state.filtros, [key]: value } })),
  resetFiltros: () => set({ filtros: { ...FILTROS_INICIALES } }),
}));
