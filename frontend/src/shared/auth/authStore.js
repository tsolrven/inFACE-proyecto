import { create } from 'zustand';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  obtenerPerfilActual,
} from './auth.service';
import { refrescarSesion, clearAccessToken } from '@/shared/api/client';
import { queryClient } from '@/shared/api/queryClient';
import { mensajeDeError } from '@/shared/lib/errores';

export const useAuthStore = create((set) => ({
  usuario: null,
  cargando: true,
  // Mensaje de suspensión (motivo y fecha) para mostrarlo en el login
  suspension: null,

  login: async (credenciales) => {
    const data = await apiLogin(credenciales);
    set({ usuario: data.usuario, suspension: null });
    return data;
  },

  register: async (datos) => {
    return await apiRegister(datos);
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch {
      // sin conexión: igual se cierra la sesión localmente
    } finally {
      queryClient.clear();
      set({ usuario: null });
    }
  },

  init: async () => {
    try {
      await refrescarSesion();
      const usuario = await obtenerPerfilActual();
      set({ usuario });
    } catch (err) {
      clearAccessToken();
      set({
        usuario: null,
        suspension:
          err?.code === 'CUENTA_SUSPENDIDA' ? mensajeDeError(err) : null,
      });
    } finally {
      set({ cargando: false });
    }
  },

  actualizarUsuario: (usuario) => set({ usuario }),

  marcarInteresesConfigurados: () => {
    set((state) =>
      state.usuario
        ? { usuario: { ...state.usuario, tiene_intereses: true } }
        : state,
    );
  },
}));

window.addEventListener('auth:session-expired', () => {
  queryClient.clear();
  useAuthStore.setState({ usuario: null });
});

window.addEventListener('auth:account-suspended', (e) => {
  queryClient.clear();
  useAuthStore.setState({
    usuario: null,
    suspension: mensajeDeError(e.detail),
  });
});