// TODO: cuando se definan los permisos, pasar esto a una columna/rol en la BD.
const CORREOS_MODERADORAS = [
  'valentina.martinez2302@alumnos.ubiobio.cl',
  'silvana.araya2301@alumnos.ubiobio.cl',
];

function esModeradora(correo) {
  return (
    typeof correo === 'string' &&
    CORREOS_MODERADORAS.includes(correo.trim().toLowerCase())
  );
}

export { CORREOS_MODERADORAS, esModeradora };
