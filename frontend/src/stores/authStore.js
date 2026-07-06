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
  // arranca en true: App.jsx muestra el SplashScreen hasta que init()
  // termine su primer intento de recuperar la sesión.
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

  // llamado una sola vez al montar <App/> (ver App.jsx). El access token
  // vive solo en memoria (services/auth.js), así que se pierde en cada F5;
  // acá se reconstruye la sesión pidiendo un access token nuevo con la
  // cookie httpOnly del refresh token, y con eso se trae el usuario.
  init: async () => {
    try {
      await refreshAccessToken();
      const usuario = await obtenerPerfilActual();
      set({ usuario });
    } catch {
      // no había sesión válida (cookie ausente/expirada) — no es un error
      // real, es el caso normal de "nadie ha iniciado sesión todavía".
      clearAccessToken();
      set({ usuario: null });
    } finally {
      set({ cargando: false });
    }
  },
}));

// api.js emite este evento cuando un access token expira y el refresh
// también falla (ej. la cookie venció, o cerraste sesión en otra pestaña).
// Lo escuchamos acá para que el resto de la app (rutas protegidas, etc.)
// se entere y redirija a /login.
window.addEventListener('auth:session-expired', () => {
  useAuthStore.setState({ usuario: null });
});
