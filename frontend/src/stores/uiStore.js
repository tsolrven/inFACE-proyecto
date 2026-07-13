import { create } from 'zustand';

// se guarda en localStorage para que la preferencia de "sidebar oculto" persista entre sesiones
const KEY = 'inface:sidebar-colapsado';

export const useUiStore = create((set) => ({
    sidebarColapsado: localStorage.getItem(KEY) === 'true',

    toggleSidebar: () => {
        set((state) => {
            const next = !state.sidebarColapsado;
            localStorage.setItem(KEY, String(next));
            return { sidebarColapsado: next };
        });
    },
}));
