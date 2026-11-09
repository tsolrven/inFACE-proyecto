const NOMBRE_USUARIO_REGEX = /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/;
const NOMBRE_USUARIO_MENSAJE =
  'Solo letras, números, guiones bajos y puntos (sin puntos al inicio, al final ni seguidos)';

const NOMBRE_COMPLETO_REGEX = /^[\p{L}]+(?:[ '.-]+[\p{L}]+)*$/u;

export {
  NOMBRE_USUARIO_REGEX,
  NOMBRE_USUARIO_MENSAJE,
  NOMBRE_COMPLETO_REGEX,
};
