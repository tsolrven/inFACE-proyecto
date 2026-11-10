import { ValidationError } from '../../errors/appError.js';

// Rol base según el dominio del correo (los moderadores se definen aparte,
// en moderadoras.constants.js).
function determinarRolPorCorreo(correo) {
  if (correo.endsWith('@alumnos.ubiobio.cl')) {
    return 'estudiante';
  }
  if (correo.endsWith('@ubiobio.cl')) {
    return 'docente';
  }
  throw new ValidationError('Dominio de correo no permitido');
}

export { determinarRolPorCorreo };