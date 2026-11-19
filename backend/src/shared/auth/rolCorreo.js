import { ValidationError } from '../../errors/appError.js';

// Rol base según el dominio del correo. El superadmin guarda rol = 'superadmin'
// y su rol base se deriva de aquí (rolBase en permissions.js). Los moderadores
// se definen aparte, en modules/identity/moderadoras.constants.js.
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