import { create } from 'zustand';

const FILTROS_INICIALES = {
  flair_id: null,
  orden: 'recientes',
};

export const useAnunciosFiltrosStore = create((set) => ({
  filtros: { ...FILTROS_INICIALES },
  setFiltro: (key, value) =>
    set((state) => ({ filtros: { ...state.filtros, [key]: value } })),
  resetFiltros: () => set({ filtros: { ...FILTROS_INICIALES } }),
}));
