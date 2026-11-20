import ActividadFeed from '@/shared/post/activity/ActividadFeed';
import AnuncioCard from '@/features/announcements/components/AnuncioCard';

const rutaDeAnuncio = (padre) =>
  padre.tipo_contenido === 'anuncio'
    ? `/anuncios-oficiales/${padre.id}`
    : null;

const PUBLICACIONES = {
  label: 'Anuncios',
  icono: 'ti-speakerphone',
  vacio: 'Aún no hay anuncios publicados.',
};

// Actividad del perfil en anuncios (props: ver ActividadFeed)
export default function AnnouncementsActividad(props) {
  return (
    <ActividadFeed
      {...props}
      tipo='anuncio'
      publicaciones={PUBLICACIONES}
      renderPublicacion={(anuncio) => <AnuncioCard anuncio={anuncio} />}
      rutaDeComentario={rutaDeAnuncio}
    />
  );
}