import { useEffect, useRef } from 'react';

// Devuelve un ref: al ponerlo en un elemento al final de la lista, carga la
// página siguiente cuando ese elemento se acerca a la pantalla.
export function useCentinela({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return ref;
}
