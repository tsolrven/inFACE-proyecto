import GuardadosFeed from '@/shared/post/bookmarks/GuardadosFeed';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';
import MaterialCard from '@/features/materials/components/MaterialCard';

const rutaDeApunte = (padre) =>
  padre.tipo_contenido === 'apunte'
    ? `/repositorio-materiales/${padre.id}`
    : null;

const TIPOS = [
  {
    valor: 'apunte',
    label: 'Materiales',
    icono: 'ti-file-text',
    plural: 'materiales',
    singular: 'publicación',
    renderItem: (apunte) => (
      <MaterialCard
        apunte={apunte}
        enGuardados
      />
    ),
  },
  {
    valor: 'comentario',
    padre: 'apunte', // solo los comentarios que están en apuntes
    label: 'Comentarios',
    icono: 'ti-message-circle-2',
    plural: 'comentarios',
    singular: 'comentario',
    renderItem: (comentario) => (
      <SavedCommentCard
        comentario={comentario}
        rutaDe={rutaDeApunte}
      />
    ),
  },
];

export default function MaterialGuardados() {
  return <GuardadosFeed tipos={TIPOS} />;
}
