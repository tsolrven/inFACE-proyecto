import { useEffect, useRef, useState } from 'react';

/**
 * Devuelve [ref, visible]. `visible` pasa a true cuando el elemento está por
 * entrar al viewport (con `margen` de anticipación) y se queda en true.
 * Sirve para no descargar contenido pesado de elementos que nadie ha visto.
 */
export default function useEnPantalla(margen = '300px') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: margen },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [visible, margen]);

  return [ref, visible];
}
