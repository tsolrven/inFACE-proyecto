import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageBanner from '@/shared/components/layout/PageBanner';
import { useAuthStore } from '@/shared/auth/authStore';
import { CONTACTO_AYUDA, PESTANAS_AYUDA } from './help/ayudaContenido';

const BUSQUEDA_MIN = 2;
const BUSQUEDA_MAX = 100;

// minúsculas y sin tildes, pero conserva la ñ (en NFD es n + U+0303)
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, '');
}

const PESTANAS = PESTANAS_AYUDA.filter((p) =>
  p.grupos.some((g) => g.preguntas.length > 0),
);

// índice plano: búsqueda y anclas
const INDICE = PESTANAS.flatMap((pestana) =>
  pestana.grupos.flatMap((grupo) =>
    grupo.preguntas.map((p) => ({
      ...p,
      pestanaId: pestana.id,
      ubicacion: `${pestana.label} · ${grupo.titulo}`,
      texto: normalizar([p.pregunta, ...p.respuesta].join(' ')),
    })),
  ),
);

// abre en la pestaña del rol base (el superadmin hereda la suya)
function pestanaPorRol(usuario) {
  const id = { estudiante: 'estudiantes', docente: 'docentes' }[
    usuario?.rol_base
  ];
  return PESTANAS.some((p) => p.id === id) ? id : PESTANAS[0]?.id;
}

function Pregunta({ item, abierta, onToggle, ubicacion }) {
  return (
    <div
      id={item.id}
      className='scroll-mt-4 rounded-[12px] border border-white/[0.06] bg-[#1E1E24]'
    >
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={abierta}
        className='flex w-full items-center gap-3 px-4 py-3 text-left'
      >
        <span className='flex-1'>
          {ubicacion && (
            <span className='mb-0.5 block text-[10.5px] text-neutral-600'>
              {ubicacion}
            </span>
          )}
          <span className='text-[13.5px] font-medium text-neutral-100'>
            {item.pregunta}
          </span>
        </span>
        <i
          className={`ti ti-chevron-down text-[14px] text-neutral-500 transition-transform ${abierta ? 'rotate-180' : ''}`}
        />
      </button>
      {abierta && (
        <div className='space-y-2 px-4 pb-4 text-[13px] leading-relaxed text-neutral-400'>
          {item.respuesta.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
          {item.enlaces?.length > 0 && (
            <div className='flex flex-wrap gap-3 pt-1'>
              {item.enlaces.map((enlace) => (
                <Link
                  key={enlace.to}
                  to={enlace.to}
                  className='inline-flex items-center gap-1 text-[12.5px] text-pink-400 transition-colors hover:text-pink-300'
                >
                  {enlace.label}
                  <i className='ti ti-arrow-right text-[12px]' />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Ayuda() {
  const usuario = useAuthStore((s) => s.usuario);
  const { hash, key } = useLocation();
  const anclaId = decodeURIComponent(hash.slice(1));

  const [pestanaId, setPestanaId] = useState(
    () =>
      INDICE.find((p) => p.id === anclaId)?.pestanaId ?? pestanaPorRol(usuario),
  );
  const [abiertas, setAbiertas] = useState(() => new Set([anclaId]));
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const scrollPendiente = useRef(null);

  // ancla (/ayuda#id): abre su pestaña y la pregunta
  useEffect(() => {
    const destino = INDICE.find((p) => p.id === anclaId);
    if (!destino) return;
    setTextoBusqueda('');
    setPestanaId(destino.pestanaId);
    setAbiertas((prev) => new Set(prev).add(destino.id));
    scrollPendiente.current = destino.id;
  }, [anclaId, key]);

  // el scroll espera a que la pregunta exista en pantalla (cambio de pestaña)
  useEffect(() => {
    if (!scrollPendiente.current) return;
    const el = document.getElementById(scrollPendiente.current);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    scrollPendiente.current = null;
  });

  const termino = textoBusqueda.trim();
  const buscando = termino.length >= BUSQUEDA_MIN;
  const resultados = useMemo(() => {
    if (!buscando) return [];
    const palabras = normalizar(termino).split(/\s+/);
    return INDICE.filter((p) => palabras.every((w) => p.texto.includes(w)));
  }, [buscando, termino]);

  const alternar = (id) =>
    setAbiertas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });

  const pestana = PESTANAS.find((p) => p.id === pestanaId) ?? PESTANAS[0];

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <PageBanner
        icon='ti-help-circle'
        title='Ayuda'
        subtitle='Cómo funciona InFACE, por rol'
        searchPlaceholder='Buscar en la ayuda...'
        searchValue={textoBusqueda}
        onSearchChange={setTextoBusqueda}
        searchMaxLength={BUSQUEDA_MAX}
        breadcrumb={[{ label: 'Inicio', to: '/' }, { label: 'Ayuda' }]}
      />

      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-[760px] px-6 py-6'>
          <div role='tablist' className='mb-5 flex flex-wrap gap-1.5'>
            {PESTANAS.map((p) => {
              const activa = !buscando && p.id === pestana?.id;
              return (
                <button
                  key={p.id}
                  type='button'
                  role='tab'
                  aria-selected={activa}
                  onClick={() => {
                    setTextoBusqueda('');
                    setPestanaId(p.id);
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${activa
                      ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                      : 'border-white/[0.07] text-neutral-500 hover:text-neutral-200'
                    }`}
                >
                  <i className={`ti ${p.icono} text-[14px]`} />
                  {p.label}
                </button>
              );
            })}
          </div>

          {buscando ? (
            <div className='flex flex-col gap-2'>
              <p className='mb-1 text-[12px] text-neutral-500'>
                {resultados.length === 0
                  ? `Sin resultados para «${termino}».`
                  : `${resultados.length} resultado${resultados.length === 1 ? '' : 's'}`}
              </p>
              {resultados.map((item) => (
                <Pregunta
                  key={item.id}
                  item={item}
                  ubicacion={item.ubicacion}
                  abierta={abiertas.has(item.id)}
                  onToggle={() => alternar(item.id)}
                />
              ))}
            </div>
          ) : (
            pestana?.grupos
              .filter((g) => g.preguntas.length > 0)
              .map((grupo) => (
                <section key={grupo.titulo} className='mb-6'>
                  <h2 className='mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-neutral-500'>
                    {grupo.titulo}
                  </h2>
                  <div className='flex flex-col gap-2'>
                    {grupo.preguntas.map((item) => (
                      <Pregunta
                        key={item.id}
                        item={item}
                        abierta={abiertas.has(item.id)}
                        onToggle={() => alternar(item.id)}
                      />
                    ))}
                  </div>
                </section>
              ))
          )}

          <div className='mt-8 rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4'>
            <h2 className='mb-1.5 text-[14px] font-semibold text-neutral-100'>
              ¿No encontraste lo que buscabas?
            </h2>
            <p className='mb-3 text-[13px] leading-relaxed text-neutral-400'>
              Escríbenos a cualquiera de las administradoras. Si quieres
              denunciar una publicación que rompe las{' '}
              <Link to='/reglas' className='text-pink-400 hover:text-pink-300'>
                reglas
              </Link>
              , repórtala desde la misma publicación: así llega directo a
              moderación.
            </p>
            <div className='flex flex-col gap-1.5'>
              {CONTACTO_AYUDA.map((c) => (
                <a
                  key={c.correo}
                  href={`mailto:${c.correo}`}
                  className='flex items-center gap-2 text-[12.5px] text-neutral-300 transition-colors hover:text-pink-400'
                >
                  <i className='ti ti-mail text-[14px] text-neutral-500' />
                  {c.nombre} · {c.correo}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}