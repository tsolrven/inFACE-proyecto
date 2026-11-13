import { useEffect, useState } from 'react';

// Devuelve `valor` solo cuando deja de cambiar durante `ms` milisegundos.
// Cada cambio reinicia la espera: mientras se escribe no se dispara nada.
export function useDebounce(valor, ms) {
  const [retardado, setRetardado] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setRetardado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);

  return retardado;
}