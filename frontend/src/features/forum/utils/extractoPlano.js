// Convierte el extracto de markdown (recortado por el backend) en texto plano
// SOLO para la vista previa de la lista. Se muestra como texto, nunca como HTML.
export function extractoPlano(markdown = '', truncado = false) {
  const texto = markdown
    .replace(/```[^\n]*\n?/g, '') // marcas de bloque de código
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // títulos
    .replace(/^\s{0,3}([-*_])(\s*\1){2,}\s*$/gm, '') // líneas horizontales
    .replace(/^\s*>\s?/gm, '') // citas
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '') // viñetas y listas numeradas
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // enlaces: queda el texto
    .replace(/(\*\*|__|~~|\*|`)/g, '') // negrita, tachado, cursiva, código
    .replace(/\s+/g, ' ')
    .trim();
  return truncado && texto ? `${texto}…` : texto;
}
