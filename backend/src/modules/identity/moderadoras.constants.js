// Cuentas que moderan la plataforma (rol 'superadmin'). La lista es la fuente
// de verdad: quien se registra con uno de estos correos nace como superadmin,
// y al arrancar el servidor se sincroniza (ver moderadores.sync.js).
const CORREOS_MODERADORES = [
  'valentina.martinez2302@alumnos.ubiobio.cl',
  'silvana.araya2301@alumnos.ubiobio.cl',
];

// Solo para desarrollo (cuentas del seed). En producción no cuentan.
const CORREOS_MODERADORES_PRUEBA = ['admin@ubiobio.cl', 'admin2@ubiobio.cl'];

function correosModeradores() {
  return process.env.NODE_ENV === 'production'
    ? CORREOS_MODERADORES
    : [...CORREOS_MODERADORES, ...CORREOS_MODERADORES_PRUEBA];
}

function esModerador(correo) {
  return (
    typeof correo === 'string' &&
    correosModeradores().includes(correo.trim().toLowerCase())
  );
}

export { CORREOS_MODERADORES, correosModeradores, esModerador };