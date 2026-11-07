import { create } from 'zustand';

const FILTROS_INICIALES = {
  flair_id: null,
  orden: 'recientes',
};

export const useAnunciosFiltrosStore = create((set, get) => ({
  filtros: { ...FILTROS_INICIALES },
  // Carrera a la que pertenecen los filtros: los flairs son de una carrera y
  // no deben viajar a la comunidad de otra.
  carreraId: null,
  setFiltro: (key, value) =>
    set((state) => ({ filtros: { ...state.filtros, [key]: value } })),
  resetFiltros: () => set({ filtros: { ...FILTROS_INICIALES } }),
  alinearCarrera: (carreraId) => {
    if (get().carreraId === carreraId) return;
    set({ carreraId, filtros: { ...FILTROS_INICIALES } });
  },
}));