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

// Cualquier usuario autenticado crea, edita lo propio, vota y comenta. El
// superadmin también: además modera (ver esStaff).
export function puedeEscribir(usuario) {
  return !!usuario;
}

export function puedeEditar(usuario, autorId) {
  return puedeEscribir(usuario) && usuario.id === autorId;
}

export function puedeEliminar(usuario, autorId) {
  return !!usuario && (usuario.id === autorId || esStaff(usuario.rol));
}
