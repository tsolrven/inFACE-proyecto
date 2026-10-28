// Ayudantes para actualizar, en todas las copias a la vez, un contenido del caché
// (feed, detalle, guardados, árbol de comentarios).
//
// Formas de datos que reconoce:
//   - detalle:          { id, ... }
//   - lista paginada:   { pages: [{ items, meta }] }   (useInfiniteQuery)
//   - árbol/array:      [{ id, respuestas: [...] }]    (comentarios)

function mapearItem(item, id, fn) {
  const base = item.id === id ? fn(item) : item;
  if (!base.respuestas?.length) return base;
  return {
    ...base,
    respuestas: base.respuestas.map((r) => mapearItem(r, id, fn)),
  };
}

function aplicar(data, id, fn) {
  if (!data) return data;
  if (Array.isArray(data)) return data.map((i) => mapearItem(i, id, fn));
  if (data.pages) {
    return {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        items: p.items.map((i) => mapearItem(i, id, fn)),
      })),
    };
  }
  if (data.id) return mapearItem(data, id, fn);
  return data;
}

const clavesDe = (tipo) => [[tipo], ['guardados', tipo]];

// Copia de seguridad para poder deshacer una actualización optimista.
export function instantanea(qc, tipo) {
  return clavesDe(tipo).flatMap((queryKey) => qc.getQueriesData({ queryKey }));
}

export function restaurar(qc, snapshot) {
  snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
}

// patch puede ser un objeto o una función (item) => objeto
export function parchearContenido(qc, tipo, id, patch) {
  const fn = (item) => ({
    ...item,
    ...(typeof patch === 'function' ? patch(item) : patch),
  });
  clavesDe(tipo).forEach((queryKey) => {
    qc.setQueriesData({ queryKey }, (data) => aplicar(data, id, fn));
  });
}

// Busca el contenido en cualquier copia (para leer su estado actual).
export function buscarContenido(qc, tipo, id) {
  let encontrado = null;
  const visitar = (item) => {
    if (encontrado) return;
    if (item.id === id) {
      encontrado = item;
      return;
    }
    item.respuestas?.forEach(visitar);
  };
  for (const [, data] of instantanea(qc, tipo)) {
    if (!data) continue;
    if (Array.isArray(data)) data.forEach(visitar);
    else if (data.pages) data.pages.forEach((p) => p.items.forEach(visitar));
    else if (data.id) visitar(data);
  }
  return encontrado;
}

function sinItem(data, id) {
  if (!data?.pages) return data;
  const estaba = data.pages.some((p) => p.items.some((i) => i.id === id));
  if (!estaba) return data;
  return {
    ...data,
    pages: data.pages.map((p) => ({
      ...p,
      items: p.items.filter((i) => i.id !== id),
      meta: p.meta && { ...p.meta, total: Math.max(0, p.meta.total - 1) },
    })),
  };
}

// Saca un contenido de todas las listas (al eliminarlo).
export function quitarContenido(qc, tipo, id) {
  clavesDe(tipo).forEach((queryKey) => {
    qc.setQueriesData({ queryKey }, (data) => sinItem(data, id));
  });
}

// Lo saca solo de la lista de guardados (al dejar de guardarlo).
export function quitarDeGuardados(qc, tipo, id) {
  qc.setQueriesData({ queryKey: ['guardados', tipo] }, (data) =>
    sinItem(data, id),
  );
}
