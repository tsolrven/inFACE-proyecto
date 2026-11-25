// Props de BotonCompartir para un hilo (tarjeta y detalle)
export function compartirHilo(hilo) {
  return {
    path: `/foro-por-ramos/${hilo.id}`,
    titulo: hilo.titulo,
    vistaPrevia: {
      icono: 'ti-messages',
      color: '#34D399',
      etiqueta: 'Foro por ramos',
      subtitulo: `${hilo.ramo?.nombre ?? ''} · u/${hilo.autor?.nombre_usuario ?? ''}`,
    },
  };
}