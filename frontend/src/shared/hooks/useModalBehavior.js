import { useEffect, useRef } from 'react';

// pila de modales abiertos: solo el de más arriba responde a Esc, y el scroll
// de la página se desbloquea recién cuando se cierra el último
const pila = [];

function manejarTecla(e) {
  if (e.key !== 'Escape') return;
  const ultimo = pila[pila.length - 1];
  ultimo?.current?.();
}

export default function useModalBehavior(open, onClose) {
  // la ref evita que cambiar la función onClose en cada render reordene la pila
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    pila.push(onCloseRef);
    if (pila.length === 1) {
      document.addEventListener('keydown', manejarTecla);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      const i = pila.lastIndexOf(onCloseRef);
      if (i !== -1) pila.splice(i, 1);
      if (pila.length === 0) {
        document.removeEventListener('keydown', manejarTecla);
        document.body.style.overflow = '';
      }
    };
  }, [open]);
}
