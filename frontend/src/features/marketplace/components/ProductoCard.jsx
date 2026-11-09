import { Link, useNavigate } from 'react-router-dom';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import EtiquetaNegociable from '@/features/marketplace/components/EtiquetaNegociable';
import EstadoInsignia from '@/features/marketplace/components/EstadoInsignia';
import GuardarProductoButton from '@/features/marketplace/components/GuardarProductoButton';
import QuitarGuardadoButton from '@/shared/post/bookmarks/QuitarGuardadoButton';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  CATEGORIA_POR_ID,
  CONDICION_POR_ID,
  MODALIDAD_POR_ID,
  esServicio,
  textoPrecio,
  rutas,
} from '@/features/marketplace/utils/catalogo';

export default function ProductoCard({ producto, enGuardados = false }) {
  const navigate = useNavigate();
  const foto = (producto.archivos ?? []).find((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const categoria = CATEGORIA_POR_ID[producto.categoria];
  const vendido = producto.estado === 'vendido';

  if (enGuardados) {
    return (
      <article
        onClick={() => navigate(rutas.producto(producto.id))}
        className='relative mb-2 flex cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.12]'
      >
        <ImagenObra
          archivoId={foto?.id}
          icono='ti-photo'
          alt={producto.titulo}
          className={`m-3 aspect-square w-[88px] flex-shrink-0 self-start rounded-[8px] border border-white/[0.07] bg-[#17171B] sm:w-[104px] ${vendido ? 'opacity-50' : ''}`}
        />
        <div className='min-w-0 flex-1 p-3 pl-0'>
          <div className='mb-1 flex items-center gap-1.5 pr-8'>
            <EstadoInsignia estado={producto.estado} />
            {categoria && (
              <span className='truncate text-[11px] text-neutral-600'>
                {categoria.label}
              </span>
            )}
          </div>
          <h3 className='line-clamp-2 text-[13.5px] font-semibold leading-snug text-neutral-100'>
            {producto.titulo}
          </h3>
          <p className='mt-1 text-[15px] font-bold text-neutral-100'>
            {textoPrecio(producto)}
          </p>
          <p className='mt-0.5 text-[11px] text-neutral-600'>
            u/{producto.vendedor?.nombre_usuario} ·{' '}
            {formatearTiempoRelativo(producto.creado_en)}
          </p>
        </div>
        <QuitarGuardadoButton
          tipo='producto'
          id={producto.id}
          className='absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/[0.08]'
        />
      </article>
    );
  }

  return (
    <article
      onClick={() => navigate(rutas.producto(producto.id))}
      className='group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.14]'
    >
      <div className='relative'>
        <ImagenObra
          archivoId={foto?.id}
          icono='ti-photo'
          alt={producto.titulo}
          className={`aspect-square w-full bg-[#17171B] ${vendido ? 'opacity-50' : ''}`}
          imgClassName='h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]'
        />
        <div className='absolute right-2 top-2'>
          <GuardarProductoButton
            producto={producto}
            variante='icono'
          />
        </div>
        {producto.estado !== 'disponible' && (
          <EstadoInsignia
            estado={producto.estado}
            className='absolute left-2 top-2 backdrop-blur'
          />
        )}
      </div>

      <div className='flex flex-1 flex-col gap-1 p-3'>
        <p className='text-[16px] font-bold leading-tight text-neutral-100'>
          {textoPrecio(producto)}
        </p>
        {((producto.negociable && producto.precio > 0) ||
          producto.entrega_domicilio) && (
          <div className='flex flex-wrap gap-1'>
            {producto.negociable && producto.precio > 0 && (
              <EtiquetaNegociable />
            )}
            {producto.entrega_domicilio && (
              <span
                title={
                  esServicio(producto.categoria)
                    ? 'Va a domicilio'
                    : 'Entrega a domicilio'
                }
                className='inline-flex items-center gap-1 rounded-md border border-violet-400/40 bg-violet-400/10 px-1.5 py-0.5 text-[10.5px] font-bold leading-none text-violet-300'
              >
                <i className='ti ti-truck-delivery text-[11px]' />A domicilio
              </span>
            )}
          </div>
        )}
        <h3 className='line-clamp-2 text-[13px] leading-snug text-neutral-300'>
          {producto.titulo}
        </h3>
        <div className='mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1 text-[11px] text-neutral-600'>
          {categoria && (
            <span className='flex items-center gap-1'>
              <i className={`ti ${categoria.icono} text-[12px]`} />
              {categoria.label}
            </span>
          )}
          <span>
            ·{' '}
            {esServicio(producto.categoria)
              ? (MODALIDAD_POR_ID[producto.modalidad]?.label ?? 'Servicio')
              : CONDICION_POR_ID[producto.condicion]?.label}
          </span>
        </div>
        <div className='flex items-center justify-between gap-2 text-[11px] text-neutral-600'>
          <Link
            to={`/perfil/usuario/${producto.vendedor?.nombre_usuario}`}
            onClick={(e) => e.stopPropagation()}
            className='truncate font-semibold text-neutral-500 hover:text-neutral-200 hover:underline'
          >
            u/{producto.vendedor?.nombre_usuario}
          </Link>
          <span className='flex-shrink-0'>
            {formatearTiempoRelativo(producto.creado_en)}
          </span>
        </div>
      </div>
    </article>
  );
}
