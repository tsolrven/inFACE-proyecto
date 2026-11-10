import { esStaff, tieneCargoEn } from '@/shared/auth/roles';

// Debe coincidir con puedePublicarAnuncioEn (backend, shared/auth/permissions.js):
// cargo vigente (CEE o tutor) en esa carrera, y la carrera destino es siempre
// la principal del usuario. El superadmin solo publica si además tiene cargo.
export function puedeCrearAnuncio(usuario, carreraId) {
  return (
    !!usuario &&
    !!carreraId &&
    usuario.carrera_id === carreraId &&
    tieneCargoEn(usuario, carreraId)
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

// Crear, renombrar y cambiar el color de un flair: igual que publicar
// (cargo en la carrera). Debe coincidir con crearFlair y actualizarFlair
// del backend (flairs.service.js).
export function puedeGestionarFlairs(usuario, carreraId) {
  return puedeCrearAnuncio(usuario, carreraId);
}

// Eliminar un flair: además, el superadmin (moderación).
export function puedeEliminarFlair(usuario, carreraId) {
  return esStaff(usuario?.rol) || puedeGestionarFlairs(usuario, carreraId);
}