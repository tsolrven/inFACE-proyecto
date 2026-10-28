import { useMemo, useSyncExternalStore } from 'react';

// Devuelve si el media query se cumple ahora y se actualiza al redimensionar.
export default function useMediaQuery(query) {
  const suscribir = useMemo(
    () => (avisar) => {
      const lista = window.matchMedia(query);
      lista.addEventListener('change', avisar);
      return () => lista.removeEventListener('change', avisar);
    },
    [query],
  );

  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
