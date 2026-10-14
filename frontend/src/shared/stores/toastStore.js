import { create } from 'zustand';

let contadorId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  mostrarToast: (mensaje) => {
    const id = ++contadorId;
    set((state) => ({
      toasts: [...state.toasts, { id, mensaje }],
    }));
    return id;
  },

  cerrarToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function mostrarToast(mensaje) {
  return useToastStore.getState().mostrarToast(mensaje);
}
