export const ETIQUETA_TIPO = {
  apunte: 'Apunte',
  hilo: 'Hilo',
  anuncio: 'Anuncio',
  comentario: 'Comentario',
  proyecto: 'Proyecto',
};

export const ICONO_POR_TIPO = {
  apunte: 'ti-file-text',
  hilo: 'ti-messages',
  anuncio: 'ti-speakerphone',
  comentario: 'ti-message-circle-2',
  proyecto: 'ti-rocket',
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

// Rutas de detalle que se abren como modal sobre la página actual. `proyecto`
// no tiene (es del trabajo de la compañera): sin ruta no hay enlace.
const RUTAS_DETALLE = {
  apunte: '/repositorio-materiales',
  hilo: '/foro-por-ramos',
  anuncio: '/anuncios-oficiales',
};

export function rutaDeContenido(tipo, id) {
  const base = RUTAS_DETALLE[tipo];
  return base ? `${base}/${id}` : null;
}

export function nombreDeUsuario(usuario) {
  return usuario?.perfil?.nombre_usuario ?? 'Usuario';
}