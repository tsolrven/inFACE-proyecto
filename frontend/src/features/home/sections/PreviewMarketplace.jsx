import { Link } from 'react-router-dom';
import { listarProductos } from '@/features/marketplace/api/marketplace.api';
import {
  CATEGORIA_POR_ID,
  textoPrecio,
  rutas as rutasMarketplace,
} from '@/features/marketplace/utils/catalogo';
import {
  SeccionError,
  SeccionHeader,
  SeccionVacia,
  SkeletonCard,
} from '@/features/home/components/SeccionInicio';
import { useVistaPrevia } from '@/features/home/hooks/useVistaPrevia';

async function cargarProductos() {
  const { productos } = await listarProductos({ limite: 4 });
  return productos.slice(0, 4);
}

export default function PreviewMarketplace() {
  const {
    items: productos,
    cargando,
    error,
  } = useVistaPrevia(['productos'], cargarProductos);

  return (
    <section>
      <SeccionHeader
        icon='ti-shopping-bag'
        iconColor='text-amber-400'
        iconBg='bg-amber-400/10 border-amber-400/25'
        title='Marketplace'
        subtitle='Lo último que publicaron otros estudiantes'
        to={rutasMarketplace.inicio}
      />

      {cargando ? (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <SeccionError />
      ) : productos.length === 0 ? (
        <SeccionVacia
          icon='ti-shopping-bag'
          mensaje='Aún no hay publicaciones. ¡Sé el primero en vender algo!'
        />
      ) : (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {productos.map((p) => (
            <MiniProductoCard
              key={p.id}
              producto={p}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniProductoCard({ producto: p }) {
  const categoria = CATEGORIA_POR_ID[p.categoria];

  return (
    <Link
      to={rutasMarketplace.producto(p.id)}
      className='group flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:-translate-y-0.5 hover:border-amber-400/30'
    >
      <div className='flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10'>
        <i
          className={`ti ${categoria?.icono ?? 'ti-shopping-bag'} text-[17px] text-amber-400`}
        />
      </div>
      <h3 className='line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-100 group-hover:text-amber-300'>
        {p.titulo}
      </h3>
      <div className='mt-auto flex items-end justify-between gap-2'>
        <span className='text-[14px] font-bold text-amber-300'>
          {textoPrecio(p)}
        </span>
        <span className='truncate text-[10.5px] text-neutral-600'>
          u/{p.vendedor?.nombre_usuario}
        </span>
      </div>
    </Link>
  );
}