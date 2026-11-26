import { useLayoutEffect, useRef, useState } from 'react';

// Dos columnas tipo masonry: cada elemento nuevo va a la columna más baja y
// después ya no se mueve (aunque cambie de alto o lleguen más páginas), para
// que nada salte mientras se lee. Si la lista cambia entera (filtros,
// búsqueda), se remonta con `key` y reparte desde cero.
export default function ColumnasMasonry({ items, renderItem }) {
  const [asignacion, setAsignacion] = useState(() => new Map()); // id → 0 | 1
  const nodos = useRef(new Map()); // id → elemento, para medir

  // Los nuevos se dibujan primero en la columna izquierda; antes de pintar se
  // miden y se reparten. El usuario no alcanza a ver ese primer acomodo.
  useLayoutEffect(() => {
    const nuevos = items.filter((it) => !asignacion.has(it.id));
    if (nuevos.length === 0) return;

    const alto = (id) => nodos.current.get(id)?.offsetHeight ?? 0;
    const alturas = [0, 0];
    for (const it of items) {
      const col = asignacion.get(it.id);
      if (col !== undefined) alturas[col] += alto(it.id);
    }

    const siguiente = new Map(asignacion);
    for (const it of nuevos) {
      // en empate, a la izquierda: así el más reciente queda arriba a la izquierda
      const col = alturas[1] < alturas[0] ? 1 : 0;
      siguiente.set(it.id, col);
      alturas[col] += alto(it.id);
    }
    setAsignacion(siguiente);
  }, [items, asignacion]);

  const columnas = [[], []];
  for (const it of items) columnas[asignacion.get(it.id) ?? 0].push(it);

  return (
    <div className='grid grid-cols-2 items-start gap-x-3'>
      {columnas.map((lista, i) => (
        <div
          key={i}
          className='min-w-0'
        >
          {lista.map((it) => (
            <div
              key={it.id}
              ref={(el) => {
                if (el) nodos.current.set(it.id, el);
                else nodos.current.delete(it.id);
              }}
              // flow-root: el alto medido incluye el margen inferior de la tarjeta
              className='flow-root'
            >
              {renderItem(it)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}