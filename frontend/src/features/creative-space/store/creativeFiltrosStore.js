import { create } from 'zustand';

const FILTROS_INICIALES = {
  tipo: null,
  orden: 'recientes',
  hashtag: null,
  busqueda: '',
};

export const useCreativeFiltrosStore = create((set) => ({
  filtros: { ...FILTROS_INICIALES },
  setFiltro: (key, value) =>
    set((state) => ({ filtros: { ...state.filtros, [key]: value } })),
  resetFiltros: () => set({ filtros: { ...FILTROS_INICIALES } }),
}));