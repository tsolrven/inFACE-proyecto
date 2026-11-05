// Estados y respuestas de los reportes. Única fuente de verdad: el texto de la
// respuesta elegida se guarda en Reporte.nota_resolucion y es el que recibe
// por correo quien reportó.
const ESTADOS_REPORTE = Object.freeze({
  PENDIENTE: 'pendiente',
  RESUELTO: 'resuelto',
  DESCARTADO: 'descartado',
  CONTENIDO_ELIMINADO: 'contenido_eliminado',
});

// Estado del correo al reportante (Reporte.notificacion_estado).
// null = el reporte sigue abierto.
// enviando: reclamado por un envío en curso (evita correos duplicados).
const ESTADOS_NOTIFICACION = Object.freeze({
  PENDIENTE: 'pendiente',
  ENVIANDO: 'enviando',
  ENVIADA: 'enviada',
  FALLIDA: 'fallida',
  OMITIDA: 'omitida',
});

// Etiquetas de los motivos para el correo. Deben coincidir con las de
// frontend/src/shared/moderation/reportReasons.js.
const ETIQUETAS_MOTIVO = Object.freeze({
  spam: 'Spam',
  acoso: 'Acoso',
  odio: 'Discurso de odio',
  contenido_inapropiado: 'Contenido inapropiado',
  plagio: 'Plagio',
  informacion_falsa: 'Información falsa',
  fuera_de_lugar: 'Fuera de lugar',
  otro: 'Otro',
});

// Respuestas predeterminadas, indexadas por el estado con que se cierra el reporte.
const RESPUESTAS_PREDETERMINADAS = Object.freeze({
  [ESTADOS_REPORTE.DESCARTADO]:
    'Se revisó el contenido y no se encontraron incumplimientos de las normas.',
  [ESTADOS_REPORTE.CONTENIDO_ELIMINADO]:
    'Se revisó el contenido y se eliminó por incumplir las normas de la plataforma.',
  [ESTADOS_REPORTE.RESUELTO]:
    'Se revisó el reporte y el problema fue solucionado. Gracias por ayudarnos a mantener la comunidad.',
});

export {
  ESTADOS_REPORTE,
  ESTADOS_NOTIFICACION,
  RESPUESTAS_PREDETERMINADAS,
  ETIQUETAS_MOTIVO,
};