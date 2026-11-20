//! normalización de texto para búsquedas en el cliente: minúsculas y sin
//! tildes, pero conserva la ñ (en NFD es n + U+0303, que no se quita)

export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, '');
}

// palabras de una búsqueda, ya normalizadas ('   ' → [])
export function palabrasDeBusqueda(consulta) {
  return normalizar(consulta).split(/\s+/).filter(Boolean);
}

// true si el texto (ya normalizado) contiene todas las palabras
export function contieneTodas(textoNormalizado, palabras) {
  return palabras.every((p) => textoNormalizado.includes(p));
}

// Divide `texto` en segmentos [{ texto, resaltado }] marcando la primera
// aparición de cada palabra. Compara sin tildes, pero devuelve el texto
// original (con sus tildes).
export function segmentosResaltados(texto, palabras) {
  // se normaliza carácter por carácter, guardando a qué posición del
  // original corresponde cada carácter normalizado (la ñ ocupa dos)
  let normal = '';
  const origen = [];
  for (let i = 0; i < texto.length; i++) {
    const n = normalizar(texto[i]);
    normal += n;
    for (let k = 0; k < n.length; k++) origen.push(i);
  }

  const marcado = new Array(texto.length).fill(false);
  for (const p of palabras) {
    const inicio = normal.indexOf(p);
    if (inicio === -1) continue;
    for (let i = origen[inicio]; i <= origen[inicio + p.length - 1]; i++) {
      marcado[i] = true;
    }
  }

  const segmentos = [];
  for (let i = 0; i < texto.length; i++) {
    const ultimo = segmentos[segmentos.length - 1];
    if (ultimo && ultimo.resaltado === marcado[i]) ultimo.texto += texto[i];
    else segmentos.push({ texto: texto[i], resaltado: marcado[i] });
  }
  return segmentos;
}