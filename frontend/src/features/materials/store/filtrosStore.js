import { create } from 'zustand';

const FILTROS_INICIALES = {
  ramo_id: null,
  tipo_archivo: null,
  orden: 'recientes',
};

export const useFiltrosStore = create((set, get) => ({
  filtros: { ...FILTROS_INICIALES },
  // Carrera a la que pertenecen los filtros: el ramo elegido es de una carrera
  // y no debe viajar a la comunidad de otra.
  carreraId: null,
  setFiltro: (key, value) =>
    set((state) => ({ filtros: { ...state.filtros, [key]: value } })),
  resetFiltros: () => set({ filtros: { ...FILTROS_INICIALES } }),
  alinearCarrera: (carreraId) => {
    if (get().carreraId === carreraId) return;
    set({ carreraId, filtros: { ...FILTROS_INICIALES } });
  },
}));