import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import {
  listarProyectosRecomendados,
  listarProyectos,
} from '@/features/project-match';
import { listarApuntes } from '@/features/materials';
import { listarProductos } from '@/features/marketplace/api/marketplace.api';
import { listarObras } from '@/features/creative-space/api/creative.api';
import {
  CATEGORIA_POR_ID,
  textoPrecio,
  rutas as rutasMarketplace,
} from '@/features/marketplace/utils/catalogo';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import { rutas as rutasCreativo } from '@/features/creative-space/utils/espacios';
import {
  getInitials,
  avatarColor,
  ModalidadChip,
  EstadoChip,
} from '@/shared/lib/matchHelpers';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { navSections } from '@/shared/config/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// INICIO 
// ─────────────────────────────────────────────────────────────────────────────


const MODULOS_IMPLEMENTADOS = [
  '/match-proyectos',
  '/repositorio-materiales',
  '/espacio-creativo',
  '/marketplace',
];

const ACCESOS = [
  {
    to: '/match-proyectos',
    icon: 'ti-puzzle',
    titulo: 'Match de proyectos',
    texto: 'Encuentra equipo',
    color: 'text-pink-400',
    fondo: 'bg-pink-500/10 border-pink-500/25',
  },
  {
    to: '/repositorio-materiales',
    icon: 'ti-books',
    titulo: 'Materiales',
    texto: 'Apuntes por ramo',
    color: 'text-blue-400',
    fondo: 'bg-blue-400/10 border-blue-400/25',
  },
  {
    to: '/espacio-creativo',
    icon: 'ti-palette',
    titulo: 'Espacio creativo',
    texto: 'Muestra tu arte',
    color: 'text-violet-400',
    fondo: 'bg-violet-400/10 border-violet-400/25',
  },
  {
    to: '/marketplace',
    icon: 'ti-shopping-bag',
    titulo: 'Marketplace',
    texto: 'Compra y vende',
    color: 'text-amber-400',
    fondo: 'bg-amber-400/10 border-amber-400/25',
  },
];

const ACCIONES = [
  {
    to: '/match-proyectos?tab=mis',
    icon: 'ti-plus',
    label: 'Publicar proyecto',
  },
  { to: '/repositorio-materiales', icon: 'ti-upload', label: 'Subir apunte' },
  { to: rutasCreativo.nueva(), icon: 'ti-brush', label: 'Crear obra' },
  { to: rutasMarketplace.nuevo, icon: 'ti-tag', label: 'Vender algo' },
];

function fechaHoy() {
  const f = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return f.charAt(0).toUpperCase() + f.slice(1);
}

export default function Inicio() {
  const usuario = useAuthStore((s) => s.usuario);

  const nombreCompleto = usuario?.nombre_completo || '';
  const nombre = nombreCompleto.split(' ')[0] || usuario?.nombre_usuario || '';
  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const modulosProximamente = navSections
    .flatMap((s) => s.items)
    .filter((item) => !MODULOS_IMPLEMENTADOS.includes(item.path));

  return (
    <div className='mx-auto flex max-w-[1100px] flex-col gap-9 px-4 py-6 sm:px-6 md:px-8 md:py-8'>
      <Hero
        saludo={saludo}
        nombre={nombre}
      />

      <PreviewMatchProyectos />
      <PreviewRepositorioMateriales />
      <PreviewMarketplace />
      <PreviewEspacioCreativo />

      {modulosProximamente.length > 0 && (
        <ProximamentePanel modulos={modulosProximamente} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO 
// ─────────────────────────────────────────────────────────────────────────────

function Hero({ saludo, nombre }) {
  return (
    <section
      className='relative overflow-hidden rounded-3xl border border-white/[0.07] p-5 sm:p-7'
      style={{
        background:
          'radial-gradient(120% 140% at 0% 0%, rgba(244,114,182,0.16) 0%, rgba(167,139,250,0.08) 38%, rgba(23,23,27,0) 70%), #17171B',
      }}
    >
      <div className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-[11.5px] font-semibold uppercase tracking-wider text-pink-400/80'>
              {fechaHoy()}
            </p>
            <h1 className='mt-1 text-[24px] font-bold leading-tight text-neutral-50 sm:text-[30px]'>
              {saludo}
              {nombre ? `, ${nombre}` : ''}
            </h1>
            <p className='mt-1.5 max-w-[520px] text-[13px] leading-relaxed text-neutral-400'>
              Esto es lo que está pasando en InFACE ahora mismo. Entra a un
              módulo o publica algo nuevo.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2.5 lg:grid-cols-4'>
          {ACCESOS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className='group flex flex-col items-start gap-2 rounded-2xl border border-white/[0.07] bg-black/25 p-3 sm:flex-row sm:items-center sm:gap-3 transition hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-black/35'
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${a.fondo}`}
              >
                <i className={`ti ${a.icon} text-[19px] ${a.color}`} />
              </div>
              <div className='min-w-0 max-w-full'>
                <div className='flex flex-wrap items-center gap-x-1.5'>
                  <span className='truncate text-[13px] font-bold text-neutral-100'>
                    {a.titulo}
                  </span>
                  {a.beta && (
                    <span className='rounded border border-pink-500/30 bg-pink-500/15 px-1 py-px text-[8.5px] font-bold uppercase text-pink-400'>
                      Beta
                    </span>
                  )}
                </div>
                <div className='truncate text-[11.5px] text-neutral-500'>
                  {a.texto}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <span className='mr-1 text-[11.5px] font-semibold text-neutral-500'>
            Atajos
          </span>
          {ACCIONES.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className='flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 transition hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-300'
            >
              <i className={`ti ${a.icon} text-[13px]`} />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CABECERA DE SECCIÓN 
// ─────────────────────────────────────────────────────────────────────────────

function SeccionHeader({ icon, iconColor, iconBg, title, subtitle, to, beta }) {
  return (
    <div className='mb-4 flex items-center gap-3'>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${iconBg}`}
      >
        <i className={`ti ${icon} text-[20px] ${iconColor}`} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <h2 className='text-[16px] font-bold text-neutral-100'>{title}</h2>
          {beta && (
            <span className='rounded border border-pink-500/30 bg-pink-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-pink-400'>
              Beta
            </span>
          )}
        </div>
        {subtitle && <p className='text-[12px] text-neutral-500'>{subtitle}</p>}
      </div>
      <Link
        to={to}
        className='flex flex-shrink-0 items-center gap-1 rounded-full border border-white/[0.08] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 transition hover:border-pink-500/40 hover:text-pink-300'
      >
        Ver todo <i className='ti ti-arrow-right text-[13px]' />
      </Link>
    </div>
  );
}

function SeccionVacia({ icon, mensaje }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-[#1E1E24]/60 px-5 py-9 text-center'>
      <i className={`ti ${icon} mb-2 text-4xl text-neutral-700`} />
      <p className='text-[12.5px] text-neutral-500'>{mensaje}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className='animate-pulse rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4'>
      <div className='mb-3 h-3.5 w-2/3 rounded bg-white/[0.06]' />
      <div className='mb-2 h-2.5 w-1/3 rounded bg-white/[0.05]' />
      <div className='h-2.5 w-full rounded bg-white/[0.05]' />
    </div>
  );
}

function useVistaPrevia(cargar) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const datos = await cargar();
        if (activo) setItems(datos);
      } catch {
        if (activo) setItems([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return { items, cargando };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW: MATCH DE PROYECTOS
// ─────────────────────────────────────────────────────────────────────────────

function PreviewMatchProyectos() {
  const { items: proyectos, cargando } = useVistaPrevia(async () => {
    const recomendados = await listarProyectosRecomendados({ limite: 3 });
    if (recomendados.datos.length > 0) return recomendados.datos.slice(0, 3);
    const { datos } = await listarProyectos({ estado: 'abierto', limite: 3 });
    return datos.slice(0, 3);
  });

  return (
    <section>
      <SeccionHeader
        icon='ti-puzzle'
        iconColor='text-pink-400'
        iconBg='bg-pink-500/10 border-pink-500/25'
        title='Match de proyectos'
        subtitle='Equipos y proyectos afines a tus intereses'
        to='/match-proyectos'
      />

      {cargando && (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!cargando && proyectos.length === 0 && (
        <SeccionVacia
          icon='ti-puzzle-off'
          mensaje='Todavía no hay proyectos abiertos para mostrar.'
        />
      )}

      {!cargando && proyectos.length > 0 && (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {proyectos.map((p) => (
            <MiniProyectoCard
              key={p.id}
              proyecto={p}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniProyectoCard({ proyecto: p }) {
  const av = avatarColor(p.creador?.id);
  const pct = p.porcentaje_match;
  const cupos = p.maximo_integrantes
    ? p.maximo_integrantes - p.total_integrantes
    : null;

  return (
    <Link
      to={`/match-proyectos?proyecto=${p.id}`}
      className='group flex flex-col gap-2.5 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:-translate-y-0.5 hover:border-pink-500/30'
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex flex-wrap gap-1.5'>
          <ModalidadChip modalidad={p.modalidad} />
          <EstadoChip estado={p.estado} />
        </div>
        {typeof pct === 'number' && (
          <span className='flex-shrink-0 rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-bold text-pink-400'>
            {pct}%
          </span>
        )}
      </div>

      <h3 className='line-clamp-2 text-[13.5px] font-bold leading-snug text-neutral-100 group-hover:text-pink-300'>
        {p.titulo}
      </h3>

      <p className='line-clamp-2 flex-1 text-[12px] leading-relaxed text-neutral-500'>
        {p.descripcion}
      </p>

      <div className='flex items-center justify-between border-t border-white/[0.06] pt-2.5'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${av.bg} ${av.text}`}
          >
            {getInitials(p.creador?.nombre_usuario)}
          </div>
          <span className='truncate text-[11px] text-neutral-500'>
            u/{p.creador?.nombre_usuario}
          </span>
        </div>
        {p.maximo_integrantes != null && (
          <span className='flex-shrink-0 text-[11px] text-neutral-600'>
            {cupos > 0 ? cupos : 0}/{p.maximo_integrantes} cupos
          </span>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW: REPOSITORIO DE MATERIALES
// ─────────────────────────────────────────────────────────────────────────────

function PreviewRepositorioMateriales() {
  const [apuntes, setApuntes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { apuntes: datos } = await listarApuntes({
          limite: 3,
          orden: 'recientes',
        });
        if (activo) setApuntes(datos);
      } catch {
        if (activo) setApuntes([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <section>
      <SeccionHeader
        icon='ti-books'
        iconColor='text-blue-400'
        iconBg='bg-blue-400/10 border-blue-400/25'
        title='Repositorio de materiales'
        subtitle='Lo último que compartió la comunidad'
        to='/repositorio-materiales'
      />

      {cargando && (
        <div className='flex flex-col gap-2.5'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!cargando && apuntes.length === 0 && (
        <SeccionVacia
          icon='ti-mood-empty'
          mensaje='Aún no hay materiales publicados.'
        />
      )}

      {!cargando && apuntes.length > 0 && (
        <div className='flex flex-col gap-2.5'>
          {apuntes.map((a) => (
            <MiniApunteCard
              key={a.id}
              apunte={a}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniApunteCard({ apunte: a }) {
  const ramoColor = colorPorRamo(a.ramo?.id);

  return (
    <Link
      to={`/repositorio-materiales/${a.id}`}
      className='flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-4 py-3 transition hover:border-white/[0.14]'
    >
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex flex-wrap items-center gap-1.5'>
          <span
            className='rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
            style={{ background: `${ramoColor}22`, color: ramoColor }}
          >
            {a.ramo?.nombre}
          </span>
          <span className='text-[11px] text-neutral-600'>
            u/{a.autor?.nombre_usuario} · {formatearTiempoRelativo(a.creado_en)}
          </span>
        </div>
        <h3 className='truncate text-[13px] font-semibold text-neutral-100'>
          {a.titulo}
        </h3>
      </div>

      <div className='flex flex-shrink-0 items-center gap-3 text-[11.5px] text-neutral-500'>
        <span className='flex items-center gap-1'>
          <i className='ti ti-arrow-big-up text-[13px]' /> {a.votos_neto ?? 0}
        </span>
        <span className='flex items-center gap-1'>
          <i className='ti ti-message-circle-2 text-[13px]' />{' '}
          {a.comentarios_count ?? 0}
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW: MARKETPLACE
// ─────────────────────────────────────────────────────────────────────────────

function PreviewMarketplace() {
  const { items: productos, cargando } = useVistaPrevia(async () => {
    const { productos } = await listarProductos({ limite: 4 });
    return productos.slice(0, 4);
  });

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

      {cargando && (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!cargando && productos.length === 0 && (
        <SeccionVacia
          icon='ti-shopping-bag'
          mensaje='Aún no hay publicaciones. ¡Sé el primero en vender algo!'
        />
      )}

      {!cargando && productos.length > 0 && (
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

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW: ESPACIO CREATIVO
// ─────────────────────────────────────────────────────────────────────────────

function PreviewEspacioCreativo() {
  const { items: obras, cargando } = useVistaPrevia(async () => {
    const { obras } = await listarObras({ limite: 4 });
    return obras.slice(0, 4);
  });

  return (
    <section>
      <SeccionHeader
        icon='ti-palette'
        iconColor='text-violet-400'
        iconBg='bg-violet-400/10 border-violet-400/25'
        title='Espacio creativo'
        subtitle='Música, escritura y artes de la comunidad'
        to={rutasCreativo.inicio}
      />

      {cargando && (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!cargando && obras.length === 0 && (
        <SeccionVacia
          icon='ti-palette'
          mensaje='Aún no hay obras. ¡Comparte la primera!'
        />
      )}

      {!cargando && obras.length > 0 && (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {obras.map((o) => (
            <MiniObraCard
              key={o.id}
              obra={o}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniObraCard({ obra: o }) {
  const tipo = TIPO_POR_ID[o.tipo];
  const color = tipo?.color ?? '#a78bfa';

  return (
    <Link
      to={rutasCreativo.obra(o.id)}
      className='group flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:-translate-y-0.5 hover:border-violet-400/30'
    >
      <div
        className='flex h-9 w-9 items-center justify-center rounded-xl'
        style={{ background: `${color}22`, color }}
      >
        <i className={`ti ${tipo?.icono ?? 'ti-palette'} text-[17px]`} />
      </div>
      <h3 className='line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-100 group-hover:text-violet-300'>
        {o.titulo}
      </h3>
      <div className='mt-auto flex items-center justify-between gap-2 text-[10.5px] text-neutral-600'>
        <span style={{ color }}>{tipo?.label ?? 'Obra'}</span>
        <span className='truncate'>u/{o.autor?.nombre_usuario}</span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRÓXIMAMENTE
// ─────────────────────────────────────────────────────────────────────────────

function ProximamentePanel({ modulos }) {
  return (
    <section>
      <div className='mb-3.5 flex items-center gap-2'>
        <i className='ti ti-hammer text-[16px] text-neutral-500' />
        <h2 className='text-[13.5px] font-bold text-neutral-300'>
          Próximamente
        </h2>
      </div>
      <div className='flex flex-wrap gap-2'>
        {modulos.map((m) => (
          <span
            key={m.path}
            title='Todavía en desarrollo'
            className='flex cursor-default items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#1E1E24] px-3 py-1.5 text-[11.5px] font-medium text-neutral-600'
          >
            <i className={`ti ${m.icon} text-[13px]`} />
            {m.label}
          </span>
        ))}
      </div>
    </section>
  );
}