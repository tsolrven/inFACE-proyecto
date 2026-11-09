export const separarParrafos = (contenido = '') =>
  contenido
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const DIALOGO = /^\{\{([^}]{1,80})\}\}\s*([\s\S]*)$/;
const ACOTACION = /^[*_]*\([\s\S]*\)[*_]*$/;

export function clasificarBloque(bloque) {
  const d = DIALOGO.exec(bloque);
  if (d) return { tipo: 'dialogo', personaje: d[1].trim(), texto: d[2].trim() };
  if (ACOTACION.test(bloque)) return { tipo: 'acotacion', texto: bloque };
  return { tipo: 'narracion', texto: bloque };
}

export function renombrarEnCapitulo(contenido, viejo, nuevo) {
  if (!viejo || viejo === nuevo) return contenido;
  return contenido.split(`{{${viejo}}}`).join(`{{${nuevo}}}`);
}
