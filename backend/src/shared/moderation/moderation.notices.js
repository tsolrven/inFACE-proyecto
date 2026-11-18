import { recortar } from '../content/extracto.js';

// Tipo de notificación (Notificacion.tipo es texto libre): el ícono está en
// frontend/src/shared/notifications/NotificationBell.jsx
const TIPO_AVISO_ELIMINACION = 'contenido_eliminado_moderacion';

// Cómo se nombra cada tipo de contenido en el aviso ("tu …")
const NOMBRE_TIPO = {
  apunte: 'material',
  hilo: 'hilo',
  anuncio: 'anuncio',
  comentario: 'comentario',
  obra: 'obra',
  producto: 'producto',
  proyecto: 'proyecto',
};

// Aviso al autor cuando el staff elimina su contenido. Se crea con `tx`, dentro
// de la misma transacción del borrado: si el borrado se revierte, el aviso
// también. El texto es fijo a propósito: la respuesta del moderador está
// escrita para quienes reportaron y no se le muestra al autor.
async function avisarEliminacionAlAutor(tx, { autor_id, tipo_contenido, texto }) {
  if (!autor_id) return;

  const nombre = NOMBRE_TIPO[tipo_contenido] ?? 'contenido';
  const extracto = recortar(texto ?? '', 80).texto;

  await tx.notificacion.create({
    data: {
      usuario_id: autor_id,
      tipo: TIPO_AVISO_ELIMINACION,
      titulo: `Un administrador eliminó tu ${nombre}`,
      mensaje: `${extracto ? `«${extracto}». ` : ''}Se eliminó por incumplir las normas de la plataforma.`,
      enlace: '/reglas',
    },
  });
}

export { avisarEliminacionAlAutor, TIPO_AVISO_ELIMINACION };