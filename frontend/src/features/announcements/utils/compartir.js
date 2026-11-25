// Props de BotonCompartir para un anuncio (tarjeta y detalle)
export function compartirAnuncio(anuncio) {
  return {
    path: `/anuncios-oficiales/${anuncio.id}`,
    titulo: anuncio.titulo,
    vistaPrevia: {
      icono: 'ti-speakerphone',
      color: '#FB7185',
      etiqueta: 'Anuncios oficiales',
      subtitulo: `${anuncio.carrera?.nombre ?? ''} · u/${anuncio.autor?.nombre_usuario ?? ''}`,
    },
  };
}