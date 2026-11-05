// Tipos y límites de las sanciones. Única fuente de verdad.
const TIPOS_SANCION = Object.freeze({
  ADVERTENCIA: 'advertencia',
  RESTRICCION: 'restriccion',
  SUSPENSION: 'suspension',
});

// Los que tienen efecto sobre la cuenta (la advertencia solo se registra).
const TIPOS_CON_EFECTO = Object.freeze([
  TIPOS_SANCION.RESTRICCION,
  TIPOS_SANCION.SUSPENSION,
]);

const MOTIVO_MIN = 5;
const MOTIVO_MAX = 500;
const DIAS_MIN = 1;
const DIAS_MAX = 365;
const MS_DIA = 24 * 60 * 60 * 1000;

export {
  TIPOS_SANCION,
  TIPOS_CON_EFECTO,
  MOTIVO_MIN,
  MOTIVO_MAX,
  DIAS_MIN,
  DIAS_MAX,
  MS_DIA,
};