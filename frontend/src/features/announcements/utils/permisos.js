import { ROLES, esStaff } from '@/shared/auth/roles';

// Debe coincidir con puedeAdministrarAnuncio y puedePublicarAnuncioEn del backend
// (announcements.service.js y shared/auth/permissions.js): el superadmin siempre;
// el autor, mientras siga siendo CEE o tutor de la carrera del anuncio.
export function puedeAdministrarAnuncio(usuario, anuncio) {
  if (!usuario) return false;
  if (esStaff(usuario.rol)) return true;

  const puedePublicar =
    [ROLES.CEE, ROLES.TUTOR].includes(usuario.rol) &&
    usuario.carrera_id === anuncio.carrera?.id;

  return puedePublicar && usuario.id === anuncio.autor?.id;
}
