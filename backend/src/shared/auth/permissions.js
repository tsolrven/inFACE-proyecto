import { cargoVigente } from './cargos.js';

// Única fuente de verdad de los roles base de la plataforma. Los cargos de
// CEE y tutor ya no son roles: viven en AsignacionRol (ver cargos.js).
const ROLES = Object.freeze({
  ESTUDIANTE: 'estudiante',
  SUPERADMIN: 'superadmin',
});

// Moderan: eliminan contenido ajeno, gestionan reportes y sanciones. Además
// crean y editan su propio contenido como cualquier estudiante.
const ROLES_STAFF = [ROLES.SUPERADMIN];

function esStaff(rol) {
  return ROLES_STAFF.includes(rol);
}

// Quién puede publicar anuncios y crear/editar flairs en la carrera
// `carrera_id`: quien tenga un cargo vigente (CEE o tutor) en esa carrera,
// sea cual sea su rol base. `usuario` es req.usuario (con `cargos`).
function puedePublicarAnuncioEn(usuario, carrera_id) {
  if (!carrera_id) return false;
  return !!cargoVigente(usuario, { carrera_id });
}

export { ROLES, ROLES_STAFF, esStaff, puedePublicarAnuncioEn };