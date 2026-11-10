export const ETIQUETA_TIPO = { cee: 'CEE', tutor: 'Tutor' };

export const TIPOS_SOLICITABLES = [
  { valor: 'cee', etiqueta: ETIQUETA_TIPO.cee },
  { valor: 'tutor', etiqueta: ETIQUETA_TIPO.tutor },
];

export const ESTADO_UI = {
  pendiente: {
    etiqueta: 'Pendiente',
    clase: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  aprobada: {
    etiqueta: 'Aprobada',
    clase: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  rechazada: {
    etiqueta: 'Rechazada',
    clase: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  cancelada: {
    etiqueta: 'Cancelada',
    clase: 'bg-white/[0.05] text-neutral-400 border-white/10',
  },
};

// `hasta` llega como fecha sin hora (medianoche UTC): se formatea en UTC para
// que el día no se corra en la zona horaria de Chile.
export function formatearFechaCargo(hasta) {
  return new Date(hasta).toLocaleDateString('es-CL', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Fecha y hora de un instante (creado_en, resuelta_en).
export function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}