import GuardadosFeed from '@/shared/post/bookmarks/GuardadosFeed';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';
import ProductoCard from '@/features/marketplace/components/ProductoCard';
import { rutas } from '@/features/marketplace/utils/catalogo';

const rutaDeProducto = (padre) =>
  padre.tipo_contenido === 'producto' ? rutas.producto(padre.id) : null;

const TIPOS = [
  {
    valor: 'producto',
    label: 'Productos',
    icono: 'ti-shopping-bag',
    plural: 'productos',
    singular: 'producto',
    renderItem: (producto) => (
      <ProductoCard
        producto={producto}
        enGuardados
      />
    ),
  },
  {
    valor: 'comentario',
    padre: 'producto',
    label: 'Preguntas',
    icono: 'ti-message',
    plural: 'preguntas',
    singular: 'pregunta',
    renderItem: (comentario) => (
      <SavedCommentCard
        comentario={comentario}
        rutaDe={rutaDeProducto}
      />
    ),
  },
];

export default function MarketplaceGuardados() {
  return <GuardadosFeed tipos={TIPOS} />;
}
