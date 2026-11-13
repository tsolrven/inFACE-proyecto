import { useEffect, useState } from 'react';
import {
  BUSQUEDA_RETARDO_MS,
  busquedaEfectiva,
} from '@/shared/lib/busqueda';

// Texto de la barra -> búsqueda que se envía al backend.
// - Mientras se escribe: espera BUSQUEDA_RETARDO_MS sin cambios (debounce).
// - Al vaciar (botón ✕, Esc o borrar a mano): se aplica al instante.
// - Un texto bajo el mínimo cuenta como vacío (no filtra).
export function useBusqueda(texto) {
  const efectiva = busquedaEfectiva(texto);
  const [retardada, setRetardada] = useState(efectiva);

  useEffect(() => {
    if (efectiva === '') {
      setRetardada('');
      return;
    }
    const id = setTimeout(() => setRetardada(efectiva), BUSQUEDA_RETARDO_MS);
    return () => clearTimeout(id);
  }, [efectiva]);

  // en el mismo render en que se vacía ya se devuelve '' (sin esperar al efecto)
  return efectiva === '' ? '' : retardada;
}