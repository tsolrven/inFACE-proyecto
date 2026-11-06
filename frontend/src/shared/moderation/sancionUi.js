export const TIPOS_SANCION = {
  ADVERTENCIA: 'advertencia',
  RESTRICCION: 'restriccion',
  SUSPENSION: 'suspension',
};

export const ETIQUETA_SANCION = {
  advertencia: 'Advertencia',
  restriccion: 'Restricción temporal',
  suspension: 'Suspensión',
};

export const ICONO_SANCION = {
  advertencia: 'ti-alert-triangle',
  restriccion: 'ti-lock',
  suspension: 'ti-ban',
};

export const TIPO_SANCION_BADGE = {
  advertencia: 'bg-amber-400/10 text-amber-400',
  restriccion: 'bg-orange-400/10 text-orange-400',
  suspension: 'bg-red-400/10 text-red-400',
};

// Estados que calcula el backend (sanctions.service.js → estadoDeSancion)
export const ESTADO_SANCION_LABEL = {
  vigente: 'Vigente',
  registrada: 'Registrada',
  vencida: 'Vencida',
  revocada: 'Revocada',
};

export const ESTADO_SANCION_BADGE = {
  vigente: 'bg-red-400/10 text-red-400',
  registrada: 'bg-amber-400/10 text-amber-400',
  vencida: 'bg-neutral-500/10 text-neutral-500',
  revocada: 'bg-neutral-500/10 text-neutral-500',
};

// Límites que valida el backend (sanctions.constants.js)
export const MOTIVO_SANCION_MIN = 5;
export const MOTIVO_SANCION_MAX = 500;
export const DIAS_SANCION_MIN = 1;
export const DIAS_SANCION_MAX = 365;

export function formatearFechaSancion(fecha) {
  return new Date(fecha).toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// «Hasta …» / «Permanente» / null (la advertencia no tiene término).
export function descripcionTermino(sancion) {
  if (sancion.tipo === TIPOS_SANCION.ADVERTENCIA) return null;
  return sancion.hasta
    ? `Hasta ${formatearFechaSancion(sancion.hasta)}`
    : 'Permanente';
}

// Resumen del historial (viene de la más reciente a la más antigua):
// sanción vigente de cada tipo con efecto y cantidad total.
export function resumirSanciones(sanciones = []) {
  const vigente = (tipo) =>
    sanciones.find((s) => s.tipo === tipo && s.estado === 'vigente') ?? null;
  return {
    total: sanciones.length,
    restriccion: vigente(TIPOS_SANCION.RESTRICCION),
    suspension: vigente(TIPOS_SANCION.SUSPENSION),
  };
}