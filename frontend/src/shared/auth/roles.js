export const ROLES = {
  ESTUDIANTE: 'estudiante',
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

// Cargo vigente (CEE o tutor) del usuario en una carrera. `usuario.cargos`
// viene del login y de /auth/me: [{ tipo, carrera_id, hasta }]. El backend
// es la autoridad; esto solo decide qué botones se muestran.
export function tieneCargoEn(usuario, carreraId) {
  return (
    !!carreraId && (usuario?.cargos ?? []).some((c) => c.carrera_id === carreraId)
  );
}