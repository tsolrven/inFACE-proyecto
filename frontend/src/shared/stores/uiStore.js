import { create } from 'zustand';

// se guarda en localStorage para que la preferencia de "sidebar oculto" persista entre sesiones
const KEY_SIDEBAR = 'inface:sidebar-colapsado';
const KEY_PANEL = 'inface:panel-derecho-colapsado';

export const useUiStore = create((set) => ({
    // ── sidebar izquierdo (escritorio: colapsado/expandido, ancho fijo) ──
    sidebarColapsado: localStorage.getItem(KEY_SIDEBAR) === 'true',
    toggleSidebar: () => {
        set((state) => {
            const next = !state.sidebarColapsado;
            localStorage.setItem(KEY_SIDEBAR, String(next));
            return { sidebarColapsado: next };
        });
    },

    // ── sidebar izquierdo (mobile: se abre como cajón encima del contenido) ──
    sidebarMovilAbierto: false,
    abrirSidebarMovil: () => set({ sidebarMovilAbierto: true }),
    cerrarSidebarMovil: () => set({ sidebarMovilAbierto: false }),
    toggleSidebarMovil: () =>
        set((state) => ({ sidebarMovilAbierto: !state.sidebarMovilAbierto })),

    // ── panel derecho (mismo patrón de colapso que el sidebar izquierdo) ──
    panelDerechoColapsado: localStorage.getItem(KEY_PANEL) === 'true',
    togglePanelDerecho: () => {
        set((state) => {
            const next = !state.panelDerechoColapsado;
            localStorage.setItem(KEY_PANEL, String(next));
            return { panelDerechoColapsado: next };
        });
    },
}));
