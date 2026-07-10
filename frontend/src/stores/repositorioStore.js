import { create } from 'zustand';
import {
  listarApuntes,
  actualizarApunte,
  eliminarApunte,
} from '../services/repositorioMateriales/apunte.service';
import { votarApunte } from '../services/repositorioMateriales/voto.service';

const FILTROS_INICIALES = {
  ramo_id: null,
  tipo_archivo: null,
  orden: 'recientes', // recientes | populares
};

export const useRepositorioStore = create((set, get) => ({
  filtros: { ...FILTROS_INICIALES },
  apuntes: [],
  meta: null,
  pagina: 1,
  cargando: false,
  cargandoMas: false,
  error: null,

  // reemplaza el feed completo (se usa al cambiar filtros, o al montar la página)
  fetchApuntes: async () => {
    set({ cargando: true, error: null });
    try {
      const { filtros } = get();
      const { apuntes, meta } = await listarApuntes({ ...filtros, pagina: 1 });
      set({ apuntes, meta, pagina: 1, cargando: false });
    } catch (err) {
      set({ error: err.message, cargando: false });
    }
  },

  // trae la siguiente página y la agrega al final (scroll infinito / "cargar más")
  cargarMasApuntes: async () => {
    const { meta, pagina, filtros, cargandoMas } = get();
    if (cargandoMas || (meta && !meta.hasNext)) return;

    set({ cargandoMas: true });
    try {
      const siguiente = pagina + 1;
      const { apuntes, meta: nuevaMeta } = await listarApuntes({
        ...filtros,
        pagina: siguiente,
      });
      set((state) => ({
        apuntes: [...state.apuntes, ...apuntes],
        meta: nuevaMeta,
        pagina: siguiente,
        cargandoMas: false,
      }));
    } catch (err) {
      set({ error: err.message, cargandoMas: false });
    }
  },

  // cambia un filtro y vuelve a pedir el feed desde cero
  setFiltro: (key, value) => {
    set((state) => ({ filtros: { ...state.filtros, [key]: value } }));
    get().fetchApuntes();
  },

  resetFiltros: () => {
    set({ filtros: { ...FILTROS_INICIALES } });
    get().fetchApuntes();
  },

  // voto optimista: actualiza la UI al toque, y si el request falla,
  // revierte al estado anterior (evita el "salto" de esperar la respuesta)
  votar: async (apunteId, tipo) => {
    const anterior = get().apuntes;

    set((state) => ({
      apuntes: state.apuntes.map((a) => {
        if (a.id !== apunteId) return a;
        const mismoVoto = a.mi_voto === tipo;
        const delta = calcularDeltaVoto(a.mi_voto, tipo);
        return {
          ...a,
          mi_voto: mismoVoto ? null : tipo,
          votos_neto: a.votos_neto + delta,
        };
      }),
    }));

    try {
      await votarApunte(apunteId, tipo);
    } catch (err) {
      set({ apuntes: anterior, error: err.message });
    }
  },

  // permite que un modal de detalle actualice un apunte puntual en el
  // feed (ej. tras crear un comentario, para que "comentarios_count" cuadre)
  actualizarApunteEnFeed: (apunteId, cambios) => {
    set((state) => ({
      apuntes: state.apuntes.map((a) =>
        a.id === apunteId ? { ...a, ...cambios } : a,
      ),
    }));
  },

  // edita metadata del apunte (título, descripción, ramo, hashtags, etc).
  // OJO: el endpoint de actualizar devuelve el apunte formateado con
  // comentarios_count/archivos/descargas en sus valores por defecto (no
  // vienen recalculados), así que acá solo tomamos del response los campos
  // que realmente pueden haber cambiado y dejamos el resto del item del
  // feed intacto, en vez de hacer spread de todo el objeto.
  editarApunte: async (apunteId, payload) => {
    const actualizado = await actualizarApunte(apunteId, payload);
    const {
      titulo,
      descripcion,
      ramo,
      hashtags,
      link_repositorio,
      codigo_snippet,
      actualizado_en,
    } = actualizado;
    get().actualizarApunteEnFeed(apunteId, {
      titulo,
      descripcion,
      ramo,
      hashtags,
      link_repositorio,
      codigo_snippet,
      actualizado_en,
    });
    return actualizado;
  },

  // elimina el apunte en el backend y lo saca del feed local
  eliminarApunteDelFeed: async (apunteId) => {
    await eliminarApunte(apunteId);
    set((state) => ({
      apuntes: state.apuntes.filter((a) => a.id !== apunteId),
    }));
  },
}));

function calcularDeltaVoto(votoActual, tipoNuevo) {
  if (votoActual === tipoNuevo) {
    // toggle: quitar el voto
    return tipoNuevo === 'up' ? -1 : 1;
  }
  if (votoActual === null) {
    return tipoNuevo === 'up' ? 1 : -1;
  }
  // cambia de up a down o viceversa: cuenta doble
  return tipoNuevo === 'up' ? 2 : -2;
}
