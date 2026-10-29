import GuardadosFeed from '@/shared/post/bookmarks/GuardadosFeed';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';
import HiloCard from '@/features/forum/components/HiloCard';

const rutaDeHilo = (padre) =>
  padre.tipo_contenido === 'hilo' ? `/foro-por-ramos/${padre.id}` : null;

const TIPOS = [
  {
    valor: 'hilo',
    label: 'Hilos',
    icono: 'ti-message-circle-2',
    plural: 'hilos',
    singular: 'hilo',
    renderItem: (hilo) => <HiloCard hilo={hilo} />,
  },
  {
    valor: 'comentario',
    padre: 'hilo', // solo los comentarios que están en hilos
    label: 'Comentarios',
    icono: 'ti-message',
    plural: 'comentarios',
    singular: 'comentario',
    renderItem: (comentario) => (
      <SavedCommentCard
        comentario={comentario}
        rutaDe={rutaDeHilo}
      />
    ),
  },
];

export default function ForumGuardados() {
  return <GuardadosFeed tipos={TIPOS} />;
}
