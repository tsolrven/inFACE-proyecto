// Única fuente de verdad de los roles de la plataforma (ver sección 3.5 de la tesis).
const ROLES = Object.freeze({
  ESTUDIANTE: 'estudiante',
  TUTOR: 'tutor',
  CEE: 'cee',
  SUPERADMIN: 'superadmin',
});

// Moderan: eliminan contenido ajeno, gestionan reportes y sanciones. Además
// crean y editan su propio contenido como cualquier estudiante.
const ROLES_STAFF = [ROLES.SUPERADMIN];

// Pueden publicar anuncios oficiales (módulo 3). El superadmin solo si además
// tiene el cargo de CEE o tutor (pendiente: tabla de asignaciones).
const ROLES_ANUNCIANTES = [ROLES.CEE, ROLES.TUTOR];

function esStaff(rol) {
  return ROLES_STAFF.includes(rol);
}

function puedePublicarAnuncios(rol) {
  return ROLES_ANUNCIANTES.includes(rol);
}

// Quién puede publicar anuncios y crear/editar flairs en la carrera `carrera_id`:
// CEE y tutores, solo en su carrera.
// `usuario` es req.usuario (id, rol, carrera_id).
function puedePublicarAnuncioEn(usuario, carrera_id) {
  if (!puedePublicarAnuncios(usuario?.rol)) return false;
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
