import { ETIQUETA_TIPO, nombreDeUsuario } from '@/shared/moderation/reportUi';
import {
  ETIQUETA_SANCION,
  formatearFechaSancion,
} from '@/shared/moderation/sancionUi';

// `quien` es la frase que antecede al nombre del administrador.
export const TIPOS_HISTORIAL = {
  sancion_aplicada: {
    chip: 'Sanciones',
    titulo: 'Sanción aplicada',
    quien: 'Sanción aplicada por',
    icono: 'ti-gavel',
  },
  sancion_revocada: {
    chip: 'Revocaciones',
    titulo: 'Sanción revocada',
    quien: 'Sanción revocada por',
    icono: 'ti-circle-check',
  },
  reportes_cerrados: {
    chip: 'Reportes',
    titulo: 'Reportes cerrados',
    quien: 'Decisión tomada por',
    icono: 'ti-flag',
  },
  contenido_eliminado: {
    chip: 'Contenido',
    titulo: 'Contenido eliminado',
    quien: 'Eliminado por',
    icono: 'ti-trash',
  },
  comentario_eliminado: {
    chip: 'Comentarios',
    titulo: 'Comentario eliminado',
    quien: 'Eliminado por',
    icono: 'ti-message-circle-2',
  },
  flair_eliminado: {
    chip: 'Flairs',
    titulo: 'Flair eliminado',
    quien: 'Eliminado por',
    icono: 'ti-tag',
  },
};

const RESULTADO = {
  resuelto: 'resueltos',
  descartado: 'descartados',
  contenido_eliminado: 'con el contenido eliminado',
};

function entreComillas(texto) {
  return texto ? ` «${texto}»` : '';
}

// Texto principal de una acción (a quién o a qué afectó).
export function describirAccion(accion) {
  const d = accion.detalle ?? {};
  const afectado = nombreDeUsuario(accion.afectado);
  const tipoContenido = ETIQUETA_TIPO[accion.entidad_tipo] ?? accion.entidad_tipo;

  switch (accion.tipo) {
    case 'sancion_aplicada': {
      const etiqueta = ETIQUETA_SANCION[d.tipo_sancion] ?? d.tipo_sancion;
      const termino = d.hasta
        ? ` · hasta ${formatearFechaSancion(d.hasta)}`
        : d.tipo_sancion === 'advertencia'
          ? ''
          : ' · permanente';
      return `${etiqueta} a ${afectado}${termino}`;
    }
    case 'sancion_revocada':
      return `Se revocó una sanción de ${afectado}`;
    case 'reportes_cerrados': {
      const n = d.cantidad ?? 0;
      return `${n} reporte${n === 1 ? '' : 's'} de ${tipoContenido} ${RESULTADO[d.resultado] ?? d.resultado ?? ''}`.trim();
    }
    case 'contenido_eliminado':
      return `${tipoContenido} de ${afectado}:${entreComillas(d.titulo)}`;
    case 'comentario_eliminado':
      return `Comentario de ${afectado}:${entreComillas(d.extracto)}`;
    case 'flair_eliminado':
      return `Flair${entreComillas(d.nombre)}`;
    default:
      return accion.tipo;
  }
}