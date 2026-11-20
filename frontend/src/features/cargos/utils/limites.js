// Deben coincidir con el backend: modules/cargos/solicitudes.constants.js y
// la entrada solicitud_rol de shared/content/contentRegistry.js.
export const MENSAJE_MIN = 10;
export const MENSAJE_MAX = 1000;

// Motivo de un rechazo (y, más adelante, de una revocación).
export const MOTIVO_MIN = 10;
export const MOTIVO_MAX = 500;

export const MAX_RESPALDOS = 5;
export const MAX_BYTES_RESPALDO = 20 * 1024 * 1024;
export const EXTENSIONES_RESPALDO = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export const DIAS_RENOVACION = 30;

// Avisos y plazos que hoy solo existen en el backend; los usa la página de
// ayuda. Deben coincidir con:
// - DIAS_AVISO en shared/auth/cargosAvisos.service.js
// - DIAS_CONSERVACION_RESPALDOS en modules/cargos/solicitudes.constants.js
// - DIAS_MINIMOS_VIGENCIA en shared/auth/cargos.js
export const DIAS_AVISO_VENCIMIENTO = 7;
export const DIAS_CONSERVACION_RESPALDOS = 30;
export const DIAS_MINIMOS_VIGENCIA = 60;