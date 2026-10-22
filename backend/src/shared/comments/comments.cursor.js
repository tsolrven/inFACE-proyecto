import { BadRequestError } from '../../errors/appError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// El cursor es "el último comentario que viste": sus votos, fecha e id, en base64.
// Es opaco para el cliente: solo lo devuelve tal cual en la siguiente petición.
function codificarCursor({ v, c, id }) {
  return Buffer.from(JSON.stringify({ v, c, id })).toString('base64url');
}
// ────────────────────────────────────────────────────────────────────────────────────────
function decodificarCursor(texto, orden) {
  let datos;
  try {
    datos = JSON.parse(Buffer.from(texto, 'base64url').toString('utf8'));
  } catch {
    throw new BadRequestError('Cursor inválido');
  }

  const fechaValida =
    typeof datos?.c === 'string' && !Number.isNaN(Date.parse(datos.c));
  const idValido = typeof datos?.id === 'string';
  const votosValidos = orden !== 'mejores' || Number.isInteger(datos?.v);

  if (!fechaValida || !idValido || !votosValidos) {
    throw new BadRequestError('Cursor inválido');
  }
  return { v: datos.v, c: datos.c, id: datos.id };
}

export { codificarCursor, decodificarCursor };
