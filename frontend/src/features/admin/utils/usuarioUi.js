// Límites de la búsqueda. La fuente de verdad es el backend
// (modules/admin/usuarios.validation.js): mantener ambos iguales.
export const BUSQUEDA_MIN = 2;
export const BUSQUEDA_MAX = 50;

export const ROL_LABEL = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  tutor: 'Tutor',
  cee: 'CEE',
  superadmin: 'Superadmin',
};

// "Superadmin · Docente": el superadmin hereda los permisos de su rol base
export function etiquetaRol({ rol, rol_base }) {
  const base = ROL_LABEL[rol] ?? rol;
  return rol === 'superadmin' && rol_base
    ? `${base} · ${ROL_LABEL[rol_base] ?? rol_base}`
    : base;
}

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