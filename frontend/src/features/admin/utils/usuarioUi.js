// Límites de la búsqueda. La fuente de verdad es el backend
// (modules/admin/usuarios.validation.js): mantener ambos iguales.
export const BUSQUEDA_MIN = 3;
export const BUSQUEDA_MAX = 50;

export const ROL_LABEL = {
  estudiante: 'Estudiante',
  tutor: 'Tutor',
  cee: 'CEE',
  superadmin: 'Superadmin',
};

// 'activa' no lleva insignia: es el estado normal.
export const ESTADO_CUENTA_LABEL = {
  inactiva: 'Inactiva',
  eliminacion_programada: 'Eliminación programada',
  anonimizada: 'Cuenta anonimizada',
};

export const ESTADO_CUENTA_BADGE = {
  inactiva: 'bg-neutral-500/10 text-neutral-500',
  eliminacion_programada: 'bg-amber-400/10 text-amber-400',
  anonimizada: 'bg-neutral-500/10 text-neutral-500',
};