import GuardadosFeed from '@/shared/post/bookmarks/GuardadosFeed';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';
import AnuncioCard from '@/features/announcements/components/AnuncioCard';

const rutaDeAnuncio = (padre) =>
  padre.tipo_contenido === 'anuncio' ? `/anuncios-oficiales/${padre.id}` : null;

const TIPOS = [
  {
    valor: 'anuncio',
    label: 'Anuncios',
    icono: 'ti-speakerphone',
    plural: 'anuncios',
    singular: 'anuncio',
    renderItem: (anuncio) => (
      <AnuncioCard
        anuncio={anuncio}
        enGuardados
      />
    ),
  },
  {
    valor: 'comentario',
    padre: 'anuncio', // solo los comentarios que están en anuncios
    label: 'Comentarios',
    icono: 'ti-message',
    plural: 'comentarios',
    singular: 'comentario',
    renderItem: (comentario) => (
      <SavedCommentCard
        comentario={comentario}
        rutaDe={rutaDeAnuncio}
      />
    ),
  },
];

export default function AnnouncementsGuardados({ busqueda = '' }) {
  return (
    <GuardadosFeed
      tipos={TIPOS}
      busqueda={busqueda}
    />
  );
}
