import { create } from 'zustand';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../services/auth';

export const useAuthStore = create((set) => ({
  usuario: null,

  login: async (credenciales) => {
    const data = await apiLogin(credenciales);
    set({ usuario: data.usuario });
    return data;
  },

  register: async (datos) => {
    return await apiRegister(datos);
  },

  logout: async () => {
    await apiLogout();
    set({ usuario: null });
  },
}));
