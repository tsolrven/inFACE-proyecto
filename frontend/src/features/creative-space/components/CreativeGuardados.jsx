import GuardadosFeed from '@/shared/post/bookmarks/GuardadosFeed';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';
import { rutas } from '@/features/creative-space/utils/espacios';
import ObraCard from '@/features/creative-space/components/ObraCard';

const rutaDeObra = (padre) =>
  padre.tipo_contenido === 'obra' ? rutas.obra(padre.id) : null;

const TIPOS = [
  {
    valor: 'obra',
    label: 'Obras',
    icono: 'ti-palette',
    plural: 'obras',
    singular: 'obra',
    renderItem: (obra) => (
      <ObraCard
        obra={obra}
        enGuardados
      />
    ),
  },
  {
    valor: 'comentario',
    padre: 'obra',
    label: 'Comentarios',
    icono: 'ti-message',
    plural: 'comentarios',
    singular: 'comentario',
    renderItem: (comentario) => (
      <SavedCommentCard
        comentario={comentario}
        rutaDe={rutaDeObra}
      />
    ),
  },
];

export default function CreativeGuardados() {
  return <GuardadosFeed tipos={TIPOS} />;
}
