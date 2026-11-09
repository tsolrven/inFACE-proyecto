import { useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BotonVolver from '@/features/creative-space/components/BotonVolver';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import ShareButton from '@/shared/post/share/ShareButton';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useAuthStore } from '@/shared/auth/authStore';
import { mostrarToast } from '@/shared/stores/toastStore';
import EtiquetaNegociable from '@/features/marketplace/components/EtiquetaNegociable';
import AutorDestacadoProvider from '@/shared/post/comments/AutorDestacadoProvider';
import BotonesContacto from '@/features/marketplace/components/BotonesContacto';
import EstadoInsignia from '@/features/marketplace/components/EstadoInsignia';
import FotosProducto from '@/features/marketplace/components/FotosProducto';
import GuardarProductoButton from '@/features/marketplace/components/GuardarProductoButton';
import ProductoMenu from '@/features/marketplace/components/ProductoMenu';
import {
  useCambiarEstado,
  useProducto,
} from '@/features/marketplace/hooks/useProductos';
import {
  CATEGORIA_POR_ID,
  CONDICION_POR_ID,
  ESTADOS,
  MODALIDAD_POR_ID,
  esServicio,
  textoPrecio,
  rutas,
} from '@/features/marketplace/utils/catalogo';

function Dato({ icono, children }) {
  return (
    <span className='flex items-center gap-1.5 text-[12.5px] text-neutral-400'>
      <i className={`ti ${icono} text-[14px] text-neutral-500`} />
      {children}
    </span>
  );
}

export default function ProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const preguntasRef = useRef(null);
  const usuario = useAuthStore((s) => s.usuario);

  const { data: producto, isPending, error } = useProducto(id);
  const estadoMut = useCambiarEstado();
  const esVendedor = !!producto && producto.vendedor?.id === usuario?.id;

  function volver() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(rutas.inicio, { replace: true });
  }

  function cambiarEstado(estado) {
    estadoMut.mutate(
      { id, estado },
      { onError: (e) => mostrarToast(e.message || 'No se pudo cambiar') },
    );
  }

  const categoria = producto ? CATEGORIA_POR_ID[producto.categoria] : null;

  return (
    <div className='flex-1 overflow-y-auto p-0 sm:p-4'>
      <div className='mx-auto w-full max-w-[1000px] overflow-hidden bg-[#1A1A1F] sm:rounded-[14px] sm:border sm:border-white/[0.07]'>
        {isPending && (
          <div className='flex items-center justify-center py-20'>
            <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
          </div>
        )}

        {error && !isPending && (
          <div className='p-4'>
            <BotonVolver />
            <p className='p-6 text-center text-sm text-red-400'>
              {error.message}
            </p>
          </div>
        )}

        {producto && (
          <>
            <div className='flex items-center gap-2 border-b border-white/[0.06] px-4 py-3'>
              <button
                type='button'
                onClick={volver}
                title='Volver'
                className='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
              >
                <i className='ti ti-arrow-left text-base' />
              </button>
              <span className='flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300'>
                <i className='ti ti-shopping-bag text-[11px]' /> Marketplace
              </span>
              <div className='ml-auto'>
                <ProductoMenu
                  producto={producto}
                  triggerClassName='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-base text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
                  onEliminado={volver}
                />
              </div>
            </div>

            <div className='grid gap-5 p-3 sm:p-6 md:grid-cols-[1.15fr_1fr]'>
              <FotosProducto
                archivos={producto.archivos}
                titulo={producto.titulo}
              />

              <div className='flex min-w-0 flex-col gap-3'>
                <div className='flex flex-wrap items-center gap-1.5'>
                  <EstadoInsignia estado={producto.estado} />
                  {producto.negociable && producto.precio > 0 && (
                    <EtiquetaNegociable />
                  )}
                  {producto.entrega_domicilio && (
                    <span className='inline-flex items-center gap-1 rounded-md border border-violet-400/40 bg-violet-400/10 px-1.5 py-0.5 text-[10.5px] font-bold leading-none text-violet-300'>
                      <i className='ti ti-truck-delivery text-[11px]' />
                      {esServicio(producto.categoria)
                        ? 'Va a domicilio'
                        : 'A domicilio'}
                    </span>
                  )}
                </div>

                <h1 className='break-words text-[20px] font-bold leading-snug text-neutral-100'>
                  {producto.titulo}
                </h1>
                <p className='text-[26px] font-extrabold leading-none text-neutral-50'>
                  {textoPrecio(producto)}
                </p>

                <div className='flex flex-col gap-1.5'>
                  {categoria && (
                    <Dato icono={categoria.icono}>{categoria.label}</Dato>
                  )}
                  {esServicio(producto.categoria) ? (
                    MODALIDAD_POR_ID[producto.modalidad] && (
                      <Dato icono={MODALIDAD_POR_ID[producto.modalidad].icono}>
                        {MODALIDAD_POR_ID[producto.modalidad].label}
                      </Dato>
                    )
                  ) : (
                    <Dato icono='ti-tag'>
                      {CONDICION_POR_ID[producto.condicion]?.label}
                    </Dato>
                  )}
                  {producto.ubicacion && (
                    <Dato icono='ti-map-pin'>
                      <span className='text-neutral-500'>
                        {esServicio(producto.categoria)
                          ? 'Lugar:'
                          : 'Punto de encuentro:'}
                      </span>{' '}
                      {producto.ubicacion}
                    </Dato>
                  )}
                  <Dato icono='ti-clock'>
                    Publicado {formatearTiempoRelativo(producto.creado_en)}
                    {producto.editado_en && ' · editado'}
                  </Dato>
                </div>

                <Link
                  to={`/perfil/usuario/${producto.vendedor?.nombre_usuario}`}
                  className='flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] p-2.5 transition hover:border-white/[0.18]'
                >
                  <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[11px] font-bold text-pink-500'>
                    {producto.vendedor?.nombre_usuario
                      ?.slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-[11px] text-neutral-600'>Vendedor</p>
                    <p className='truncate text-[13px] font-bold text-neutral-200'>
                      u/{producto.vendedor?.nombre_usuario}
                    </p>
                  </div>
                  <i className='ti ti-chevron-right ml-auto text-neutral-600' />
                </Link>

                {esVendedor ? (
                  <>
                    <div className='rounded-[10px] border border-white/[0.07] bg-[#1E1E24] p-3'>
                      <p className='mb-2 text-[11.5px] font-semibold text-neutral-500'>
                        Estado de tu publicación
                      </p>
                      <div className='flex flex-wrap gap-1.5'>
                        {ESTADOS.map((e) => (
                          <button
                            key={e.id}
                            type='button'
                            disabled={estadoMut.isPending}
                            aria-pressed={producto.estado === e.id}
                            onClick={() => cambiarEstado(e.id)}
                            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                              producto.estado === e.id
                                ? `${e.clases} border-white/[0.2]`
                                : 'border-white/[0.07] text-neutral-500 hover:text-neutral-200'
                            }`}
                          >
                            <i className={`ti ${e.icono} text-[13px]`} />{' '}
                            {e.label}
                          </button>
                        ))}
                      </div>
                      <Link
                        to={rutas.editar(producto.id)}
                        className='mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-pink-400 hover:underline'
                      >
                        <i className='ti ti-edit' /> Editar publicación
                      </Link>
                    </div>
                    <div className='rounded-[10px] border border-white/[0.07] bg-[#1E1E24] p-3'>
                      <p className='mb-0.5 text-[11.5px] font-semibold text-neutral-500'>
                        Tu contacto
                      </p>
                      <p className='mb-2 text-[11px] text-neutral-600'>
                        Así lo ven los compradores.
                      </p>
                      <BotonesContacto producto={producto} />
                    </div>
                  </>
                ) : (
                  <div className='rounded-[10px] border border-white/[0.07] bg-[#1E1E24] p-3'>
                    <p className='mb-1.5 text-[11.5px] font-semibold text-neutral-500'>
                      Contactar al vendedor
                    </p>
                    <BotonesContacto producto={producto} />
                    <button
                      type='button'
                      onClick={() =>
                        preguntasRef.current?.scrollIntoView({
                          behavior: 'smooth',
                        })
                      }
                      className='mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-pink-400 hover:underline'
                    >
                      <i className='ti ti-message-circle-2' /> Hacer una
                      pregunta pública
                    </button>
                  </div>
                )}

                <div className='flex flex-wrap items-center gap-2 text-[11.5px] text-neutral-500'>
                  <GuardarProductoButton producto={producto} />
                  <ShareButton
                    path={rutas.producto(producto.id)}
                    titulo={producto.titulo}
                  />
                </div>
              </div>
            </div>

            {producto.descripcion && (
              <div className='border-t border-white/[0.06] px-3 py-4 sm:px-6'>
                <h2 className='mb-2 text-[13px] font-bold text-neutral-300'>
                  Descripción
                </h2>
                <p className='whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-neutral-300'>
                  {producto.descripcion}
                </p>
              </div>
            )}

            <div
              ref={preguntasRef}
              className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-4 sm:p-6'
            >
              <AutorDestacadoProvider
                autorId={producto.vendedor?.id}
                etiqueta='Vendedor'
              >
                <CommentsSection
                  tipoContenido='producto'
                  contenidoId={id}
                  total={producto.comentarios_count ?? 0}
                  titulo='Preguntas al vendedor'
                  placeholder='Pregunta sobre el producto (las preguntas son públicas)...'
                  textoVacio='Todavía no hay preguntas. ¡Sé el primero en preguntar!'
                />
              </AutorDestacadoProvider>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
