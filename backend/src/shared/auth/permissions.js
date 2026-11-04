// Única fuente de verdad de los roles de la plataforma (ver sección 3.5 de la tesis).
const ROLES = Object.freeze({
  ESTUDIANTE: 'estudiante',
  TUTOR: 'tutor',
  CEE: 'cee',
  SUPERADMIN: 'superadmin',
});

// Pueden moderar contenido ajeno (editar/eliminar apuntes, archivos y comentarios de otros).
const ROLES_STAFF = [ROLES.SUPERADMIN];

// Pueden publicar anuncios oficiales (módulo 3).
const ROLES_ANUNCIANTES = [ROLES.CEE, ROLES.TUTOR, ROLES.SUPERADMIN];

function esStaff(rol) {
  return ROLES_STAFF.includes(rol);
}

function puedePublicarAnuncios(rol) {
  return ROLES_ANUNCIANTES.includes(rol);
}

// Quién puede publicar (y administrar flairs) en la carrera `carrera_id`.
// El superadmin en cualquiera; CEE y tutores solo en su carrera.
// `usuario` es req.usuario (id, rol, carrera_id).
function puedePublicarAnuncioEn(usuario, carrera_id) {
  if (!puedePublicarAnuncios(usuario?.rol)) return false;
  if (esStaff(usuario.rol)) return true;
  return !!carrera_id && usuario.carrera_id === carrera_id;
}

export {
  ROLES,
  ROLES_STAFF,
  ROLES_ANUNCIANTES,
  esStaff,
  puedePublicarAnuncios,
  puedePublicarAnuncioEn,
};
