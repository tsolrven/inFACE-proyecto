import { create } from 'zustand';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  refreshAccessToken,
  obtenerPerfilActual,
  clearAccessToken,
} from '../services/auth';

export const useAuthStore = create((set) => ({
  usuario: null,
  cargando: true,

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

  init: async () => {
    try {
      await refreshAccessToken();
      const usuario = await obtenerPerfilActual();
      set({ usuario });
    } catch {
      clearAccessToken();
      set({ usuario: null });
    } finally {
      set({ cargando: false });
    }
  },
}));
window.addEventListener('auth:session-expired', () => {
  useAuthStore.setState({ usuario: null });
});
