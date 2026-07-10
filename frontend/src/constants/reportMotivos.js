// Catálogo de motivos de reporte. Se usa en <ReportModal /> y debe calzar
// con MOTIVOS_REPORTE en backend/validations/reporte.validation.js.
//
// requiereObjetivo: el motivo necesita un paso extra ("Next") antes de poder
//                    enviar (ej. acoso: ¿hacia quién es?).
// requiereDetalle:  el campo de texto libre pasa a ser obligatorio.
export const MOTIVOS_REPORTE = [
  {
    value: 'spam',
    label: 'Spam',
    descripcion:
      'Contenido publicitario, repetitivo o que no aporta valor académico.',
  },
  {
    value: 'acoso',
    label: 'Acoso',
    descripcion:
      'Ataques, intimidación o humillación dirigidos a otra persona.',
    requiereObjetivo: true,
  },
  {
    value: 'odio',
    label: 'Discurso de odio',
    descripcion:
      'Promueve discriminación u odio por identidad, género, origen u otra característica.',
  },
  {
    value: 'contenido_inapropiado',
    label: 'Contenido inapropiado',
    descripcion:
      'Contenido sexual, violento o fuera de lugar en un espacio académico.',
  },
  {
    value: 'plagio',
    label: 'Plagio',
    descripcion: 'Material copiado o presentado como propio sin serlo.',
  },
  {
    value: 'informacion_falsa',
    label: 'Información falsa',
    descripcion:
      'Contenido académico incorrecto o engañoso presentado como válido.',
  },
  {
    value: 'fuera_de_lugar',
    label: 'Fuera de lugar',
    descripcion:
      'No corresponde al ramo/curso o no tiene relación con el contenido académico.',
  },
  {
    value: 'otro',
    label: 'Otro',
    descripcion: 'Otra razón que no está en esta lista.',
    requiereDetalle: true,
  },
];

export function obtenerMotivo(value) {
  return MOTIVOS_REPORTE.find((m) => m.value === value) ?? null;
}
