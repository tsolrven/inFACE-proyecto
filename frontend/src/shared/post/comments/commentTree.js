// Operaciones sobre el árbol de comentarios guardado en el caché de TanStack
// Query (forma: { pages: [{ items: [raíces con respuestas anidadas], meta }] }).

function mapearPaginas(data, fn) {
  if (!data?.pages) return data;
  return { ...data, pages: data.pages.map((p, i) => fn(p, i)) };
}

function mapearNodos(nodos, fn) {
  return nodos.map((nodo) => {
    const nuevo = fn(nodo);
    if (!nuevo.respuestas?.length) return nuevo;
    return { ...nuevo, respuestas: mapearNodos(nuevo.respuestas, fn) };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Tu comentario nuevo aparece arriba de la lista hasta que se recargue.
export function insertarRaiz(data, nuevo) {
  const hoja = { ...nuevo, respuestas: [] };
  return mapearPaginas(data, (pagina, i) =>
    i === 0 ? { ...pagina, items: [hoja, ...pagina.items] } : pagina,
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function insertarRespuesta(data, padreId, nuevo) {
  const hoja = { ...nuevo, respuestas: [] };
  return mapearPaginas(data, (pagina) => ({
    ...pagina,
    items: mapearNodos(pagina.items, (nodo) =>
      nodo.id === padreId
        ? {
            ...nodo,
            respuestas: [hoja, ...(nodo.respuestas ?? [])],
            respuestas_count: (nodo.respuestas_count ?? 0) + 1,
          }
        : nodo,
    ),
  }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Saca nodos del árbol y descuenta de `respuestas_count` a su padre.
export function quitarNodos(data, ids) {
  const sacar = (nodos) =>
    nodos
      .filter((n) => !ids.has(n.id))
      .map((n) => {
        if (!n.respuestas?.length) return n;
        const respuestas = sacar(n.respuestas);
        const quitadas = n.respuestas.length - respuestas.length;
        return {
          ...n,
          respuestas,
          respuestas_count: Math.max(0, (n.respuestas_count ?? 0) - quitadas),
        };
      });

  return mapearPaginas(data, (pagina) => ({
    ...pagina,
    items: sacar(pagina.items),
  }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// "Ver más respuestas": suma las que llegaron a las que ya estaban y guarda el
// cursor de la siguiente página (null = no quedan más). Si una respuesta ya
// estaba cargada se conserva la que hay, para no perder lo que el usuario ya abrió.
export function fusionarRespuestas(data, padreId, nuevas, cursor) {
  return mapearPaginas(data, (pagina) => ({
    ...pagina,
    items: mapearNodos(pagina.items, (nodo) => {
      if (nodo.id !== padreId) return nodo;
      const existentes = nodo.respuestas ?? [];
      const ids = new Set(existentes.map((r) => r.id));
      return {
        ...nodo,
        respuestas: [...existentes, ...nuevas.filter((r) => !ids.has(r.id))],
        cursor_respuestas: cursor,
      };
    }),
  }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Junta las raíces de todas las páginas sin repetidos (tu comentario recién
// publicado puede volver a aparecer en una página siguiente).
export function aplanarRaices(data) {
  const vistos = new Set();
  const raices = [];
  for (const pagina of data.pages) {
    for (const raiz of pagina.items) {
      if (vistos.has(raiz.id)) continue;
      vistos.add(raiz.id);
      raices.push(raiz);
    }
  }
  return raices;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Busca un comentario en cualquier nivel del árbol.
export function buscarNodo(nodos, id) {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    const dentro = nodo.respuestas?.length
      ? buscarNodo(nodo.respuestas, id)
      : null;
    if (dentro) return dentro;
  }
  return null;
}
