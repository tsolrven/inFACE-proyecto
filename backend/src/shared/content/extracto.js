// Recorta un texto a `max` caracteres. Cuenta caracteres reales, no unidades
// UTF-16 (un emoji no se parte por la mitad).
function recortar(texto, max) {
  const caracteres = [...texto];
  return caracteres.length > max
    ? { texto: caracteres.slice(0, max).join(''), truncado: true }
    : { texto, truncado: false };
}

export { recortar };
