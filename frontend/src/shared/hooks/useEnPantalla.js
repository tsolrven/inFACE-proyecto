import { useEffect, useState } from 'react';

// true desde que el elemento entra (o está por entrar) en pantalla. Se usa
// para no generar miniaturas ni dibujar páginas que nadie está mirando.
export function useEnPantalla(ref, { margen = '200px' } = {}) {
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisto(true);
          observador.disconnect();
        }
      },
      { rootMargin: margen },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref, visto, margen]);

  return visto;
}