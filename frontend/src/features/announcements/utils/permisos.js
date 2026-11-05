import { ROLES, esStaff } from '@/shared/auth/roles';

const ROLES_ANUNCIANTES = [ROLES.CEE, ROLES.TUTOR];

// Debe coincidir con puedePublicarAnuncioEn (backend, shared/auth/permissions.js):
// solo CEE y tutor, y solo en su propia carrera. El superadmin no publica.
export function puedeCrearAnuncio(usuario, carreraId) {
  return (
    !!usuario &&
    ROLES_ANUNCIANTES.includes(usuario.rol) &&
    !!carreraId &&
    usuario.carrera_id === carreraId
  );
}

// Debe coincidir con puedeEditarAnuncio (backend, announcements.service.js):
// el autor, mientras siga pudiendo publicar en la carrera del anuncio.
export function puedeEditarAnuncio(usuario, anuncio) {
  return (
    puedeCrearAnuncio(usuario, anuncio.carrera?.id) &&
    usuario.id === anuncio.autor?.id
  );
}

// Debe coincidir con puedeEliminarAnuncio (backend): el superadmin
// (moderación) o quien puede editar.
export function puedeEliminarAnuncio(usuario, anuncio) {
  return esStaff(usuario?.rol) || puedeEditarAnuncio(usuario, anuncio);
}
