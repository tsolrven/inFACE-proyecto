export const ROLES = {
  ESTUDIANTE: 'estudiante',
  TUTOR: 'tutor',
  CEE: 'cee',
  SUPERADMIN: 'superadmin',
};

const ROLES_STAFF = [ROLES.SUPERADMIN];

export function esStaff(rol) {
  return ROLES_STAFF.includes(rol);
}

// El superadmin solo elimina: no crea ni edita. Debe coincidir con
// puedeEscribirContenido del backend (shared/auth/permissions.js).
export function puedeEscribir(usuario) {
  return !!usuario && !esStaff(usuario.rol);
}

export function puedeEditar(usuario, autorId) {
  return puedeEscribir(usuario) && usuario.id === autorId;
}

export function puedeEliminar(usuario, autorId) {
  return !!usuario && (usuario.id === autorId || esStaff(usuario.rol));
}
