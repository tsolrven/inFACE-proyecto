import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarCarreras } from '@/shared/api/catalog.api';
import { navSections } from '@/shared/config/navigation';
import { useActividad } from '@/shared/post/activity/useActividad';
import { useCentinela } from '@/shared/hooks/useCentinela';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';
import ForumActividad from '@/features/forum/components/ForumActividad';
import MaterialActividad from '@/features/materials/components/MaterialActividad';
import AnnouncementsActividad from '@/features/announcements/components/AnnouncementsActividad';

// Actividad de una persona por carrera, en el perfil (RF-T-12):
// - con carrera (estudiante, CEE, tutor): las 4 carreras ajenas, SOLO
//   comentarios (en otras carreras no se publica);
// - sin académico (docente y superadmin, como en la barra lateral): las 5
//   carreras, con publicaciones y comentarios de cada módulo.
const MODULOS = [
  {
    tipo: 'hilo',
    label: 'Foro',
    icono: 'ti-message-circle-2',
    ruta: (id) => `/foro-por-ramos/${id}`,
    Actividad: ForumActividad,
  },
  {
    tipo: 'apunte',
    label: 'Materiales',
    icono: 'ti-file-text',
    ruta: (id) => `/repositorio-materiales/${id}`,
    Actividad: MaterialActividad,
  },
  {
    tipo: 'anuncio',
    label: 'Anuncios',
    icono: 'ti-speakerphone',
    ruta: (id) => `/anuncios-oficiales/${id}`,
    Actividad: AnnouncementsActividad,
  },
];

// Nombre corto de cada carrera: el mismo de la barra lateral (por código)
const NOMBRE_CORTO = Object.fromEntries(
  (navSections.find((s) => s.title === 'Comunidades')?.items ?? []).map(
    (i) => [i.path.split('/').pop(), i.label],
  ),
);

function boton(activo) {
  return `flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${activo
      ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
      : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
    }`;
}

function SelectorModulo({ tipo, onCambiar }) {
  return (
    <div className='mb-3 flex gap-1'>
      {MODULOS.map((m) => (
        <button
          key={m.tipo}
          type='button'
          onClick={() => onCambiar(m.tipo)}
          className={boton(tipo === m.tipo)}
        >
          <i className={`ti ${m.icono} text-sm`} /> {m.label}
        </button>
      ))}
    </div>
  );
}

// Docente y superadmin: el módulo elegido, con «Publicaciones | Comentarios»
// (el mismo componente de actividad de cada módulo, filtrado por la carrera)
function ActividadDeCarrera({ usuarioId, carreraId }) {
  const [tipo, setTipo] = useState(MODULOS[0].tipo);
  const { Actividad } = MODULOS.find((m) => m.tipo === tipo);

  return (
    <div>
      <SelectorModulo
        tipo={tipo}
        onCambiar={setTipo}
      />
      {/* key: al cambiar de módulo vuelve a «Publicaciones» */}
      <Actividad
        key={tipo}
        usuarioId={usuarioId}
        carreraId={carreraId}
      />
    </div>
  );
}

// Estudiante: solo sus comentarios en el módulo elegido de la carrera ajena
function ComentariosDeCarrera({ usuarioId, carreraId }) {
  const [tipo, setTipo] = useState(MODULOS[0].tipo);
  const modulo = MODULOS.find((m) => m.tipo === tipo);

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useActividad({ usuarioId, tipo, lista: 'comentarios', carreraId });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div>
      <SelectorModulo
        tipo={tipo}
        onCambiar={setTipo}
      />

      {error && (
        <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error.message}
        </div>
      )}

      {isPending && (
        <div className='flex items-center justify-center py-14 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!isPending && !error && items.length === 0 && (
        <div className='flex flex-col items-center py-14 text-center'>
          <i className='ti ti-message mb-3 text-4xl text-neutral-700' />
          <p className='max-w-xs text-[12.5px] leading-relaxed text-neutral-500'>
            Aún no hay comentarios en {modulo.label.toLowerCase()} de esta
            carrera.
          </p>
        </div>
      )}

      {items.map((comentario) => (
        <Fragment key={comentario.id}>
          <SavedCommentCard
            comentario={comentario}
            rutaDe={(padre) =>
              padre.tipo_contenido === tipo ? modulo.ruta(padre.id) : null
            }
          />
        </Fragment>
      ))}

      <div
        ref={centinelaRef}
        className='h-1'
      />

      {isFetchingNextPage && (
        <div className='flex items-center justify-center py-4 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-xl' />
        </div>
      )}
    </div>
  );
}

export default function ActividadComunidades({
  usuarioId,
  carreraPropiaId = null,
  sinAcademico = false,
}) {
  // misma clave que la página de hashtag: comparten el caché del catálogo
  const {
    data: carreras = [],
    isPending,
    isError,
  } = useQuery({ queryKey: ['carreras'], queryFn: () => listarCarreras() });

  const visibles = sinAcademico
    ? carreras
    : carreras.filter((c) => c.id !== carreraPropiaId);
  const [elegida, setElegida] = useState(null);
  const actual = visibles.find((c) => c.id === elegida) ?? visibles[0];

  if (isPending) {
    return (
      <div className='flex items-center justify-center py-14 text-neutral-600'>
        <i className='ti ti-loader-2 animate-spin text-2xl' />
      </div>
    );
  }
  if (isError || !actual) {
    return (
      <p className='py-14 text-center text-[12.5px] text-neutral-500'>
        No se pudieron cargar las comunidades.
      </p>
    );
  }

  const Contenido = sinAcademico ? ActividadDeCarrera : ComentariosDeCarrera;

  return (
    <div>
      <div className='mb-4 flex gap-1 overflow-x-auto border-b border-white/[0.07]'>
        {visibles.map((c) => (
          <button
            key={c.id}
            type='button'
            onClick={() => setElegida(c.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2 text-[12.5px] font-medium transition ${actual.id === c.id
                ? 'border-pink-500 text-pink-500'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
          >
            {NOMBRE_CORTO[c.codigo.toLowerCase()] ?? c.nombre}
          </button>
        ))}
      </div>

      {/* key: al cambiar de carrera, el selector de módulo vuelve a Foro */}
      <Contenido
        key={actual.id}
        usuarioId={usuarioId}
        carreraId={actual.id}
      />
    </div>
  );
}