// El orden define el de los filtros de la pantalla de reportes
export const ETIQUETA_TIPO = {
  apunte: 'Apunte',
  hilo: 'Hilo',
  anuncio: 'Anuncio',
  comentario: 'Comentario',
  proyecto: 'Proyecto',
  obra: 'Obra',
  producto: 'Producto',
};

export const ICONO_POR_TIPO = {
  apunte: 'ti-file-text',
  hilo: 'ti-messages',
  anuncio: 'ti-speakerphone',
  comentario: 'ti-message-circle-2',
  proyecto: 'ti-rocket',
  obra: 'ti-palette',
  producto: 'ti-shopping-bag',
};

export const ESTADO_BADGE = {
  pendiente: 'bg-amber-400/10 text-amber-400',
  resuelto: 'bg-emerald-400/10 text-emerald-400',
  descartado: 'bg-neutral-500/10 text-neutral-500',
  contenido_eliminado: 'bg-neutral-500/10 text-neutral-500',
};

export const ESTADO_LABEL_MODERACION = {
  pendiente: 'Pendiente',
  resuelto: 'Resuelto',
  descartado: 'Descartado',
  contenido_eliminado: 'Contenido eliminado',
};

// Quién eliminó el contenido (Reporte.eliminado_por). Sin dato (reporte
// anterior al campo, o cerrado antes de eliminarse) cae en la etiqueta genérica.
export const ETIQUETA_ELIMINADO_POR = {
  autor: 'Eliminado por su autor',
  moderacion: 'Eliminado por moderación',
  arrastre: 'Eliminado junto con su publicación',
};

export function etiquetaEliminacion(eliminadoPor) {
  return ETIQUETA_ELIMINADO_POR[eliminadoPor] ?? 'Contenido eliminado';
}

// Ruta para "ver el contenido" desde la pantalla de reportes.
// modal: true → su detalle existe en modalRoutes y se abre encima de la página
// actual (backgroundLocation). false → es una página completa: se navega a ella
// (obra y producto; el proyecto se abre con ?proyecto=, el enlace de compartir).
const RUTAS_DETALLE = {
  apunte: { ruta: (id) => `/repositorio-materiales/${id}`, modal: true },
  hilo: { ruta: (id) => `/foro-por-ramos/${id}`, modal: true },
  anuncio: { ruta: (id) => `/anuncios-oficiales/${id}`, modal: true },
  obra: { ruta: (id) => `/espacio-creativo/obra/${id}`, modal: false },
  producto: { ruta: (id) => `/marketplace/producto/${id}`, modal: false },
  proyecto: { ruta: (id) => `/match-proyectos?proyecto=${id}`, modal: false },
};

export function rutaDeContenido(tipo, id) {
  return RUTAS_DETALLE[tipo]?.ruta(id) ?? null;
}

export function seAbreComoModal(tipo) {
  return RUTAS_DETALLE[tipo]?.modal === true;
}

export function nombreDeUsuario(usuario) {
  return usuario?.perfil?.nombre_usuario ?? 'Usuario';
}