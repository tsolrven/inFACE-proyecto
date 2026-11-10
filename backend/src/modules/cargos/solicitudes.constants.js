// Solicitudes de cargo (CEE o tutor). Los límites del mensaje deben coincidir
// con frontend/features/cargos (cuando exista el formulario).
const ESTADOS_SOLICITUD = Object.freeze({
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  CANCELADA: 'cancelada',
});

const MENSAJE_MIN = 10;
const MENSAJE_MAX = 1000;

// Motivo de un rechazo (y, más adelante, de una revocación de cargo).
const MOTIVO_MIN = 10;
const MOTIVO_MAX = 500;

// Con un cargo vigente del mismo tipo y carrera, solo se puede solicitar de
// nuevo (renovación) si vence en este número de días o menos.
const DIAS_RENOVACION = 30;

export {
  ESTADOS_SOLICITUD,
  MENSAJE_MIN,
  MENSAJE_MAX,
  MOTIVO_MIN,
  MOTIVO_MAX,
  DIAS_RENOVACION,
};