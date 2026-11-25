// Props de BotonCompartir para un apunte (tarjeta y detalle)
export function compartirApunte(apunte) {
  return {
    path: `/repositorio-materiales/${apunte.id}`,
    titulo: apunte.titulo,
    vistaPrevia: {
      icono: 'ti-books',
      color: '#60A5FA',
      etiqueta: 'Repositorio de materiales',
      subtitulo: `${apunte.ramo?.nombre ?? ''} · u/${apunte.autor?.nombre_usuario ?? ''}`,
    },
  };
}