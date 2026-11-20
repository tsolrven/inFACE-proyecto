import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  etiquetaColor,
  EstadoChip,
  ModalidadChip,
} from '@/shared/lib/matchHelpers';
import MaterialActividad from '@/features/materials/components/MaterialActividad';
import ForumActividad from '@/features/forum/components/ForumActividad';
import AnnouncementsActividad from '@/features/announcements/components/AnnouncementsActividad';
import ActividadComunidades from '@/features/communities/components/ActividadComunidades';
import ConDescripcion from '@/shared/components/ConDescripcion';
import PerfilCreativo from '@/features/profile/components/PerfilCreativo';
import PerfilMarketplace from '@/features/profile/components/PerfilMarketplace';
import { useTotalObras } from '@/features/creative-space/hooks/useObras';
import { useTotalProductos } from '@/features/marketplace/hooks/useProductos';

const TABS = {
  materiales: { id: 'materiales', label: 'Materiales', icon: 'ti-books' },
  foro: { id: 'foro', label: 'Foro', icon: 'ti-message-circle-2' },
  anuncios: { id: 'anuncios', label: 'Anuncios', icon: 'ti-speakerphone' },
  proyectos: { id: 'proyectos', label: 'Proyectos', icon: 'ti-puzzle' },
  creativo: { id: 'creativo', label: 'Creativo', icon: 'ti-palette' },
  marketplace: { id: 'marketplace', label: 'Marketplace', icon: 'ti-shopping-bag' },
  comunidades: { id: 'comunidades', label: 'Comunidades', icon: 'ti-building' },
};

// Mismo criterio que la barra lateral:
// - con carrera: académicos → culturales → comunidades (solo comentarios)
// - sin «Académico» (docente y superadmin): comunidades (publicaciones y
//   comentarios de las 5 carreras) → culturales
const ORDEN_CON_CARRERA = [
  'materiales',
  'foro',
  'anuncios',
  'proyectos',
  'creativo',
  'marketplace',
  'comunidades',
];
const ORDEN_SIN_ACADEMICO = ['comunidades', 'proyectos', 'creativo', 'marketplace'];

export default function PerfilTabs({
  proyectosCreados = [],
  proyectosParticipa = [],
  cargando = false,
  usuarioId = null,
  esPropio = false,
  // actividad académica (RF-T-12)
  rol = null,
  rolBase = null,
  carreraId = null,
}) {
  const sinAcademico = rol === 'superadmin' || rolBase === 'docente';
  const tabs = (sinAcademico ? ORDEN_SIN_ACADEMICO : ORDEN_CON_CARRERA).map(
    (id) => TABS[id],
  );

  // la pestaña inicial es la primera del orden que corresponde
  const [tabElegida, setTab] = useState(null);
  const tab = tabElegida ?? tabs[0].id;

  const { data: totalObras = 0 } = useTotalObras(usuarioId);
  const { data: totalProductos = 0 } = useTotalProductos(usuarioId);

  // con carrera: la actividad de los tres módulos es la de su carrera
  const actividad = { usuarioId, carreraId };

  // las pestañas académicas no llevan contador: cada lista carga al abrirse
  const counts = {
    proyectos: proyectosCreados.length + proyectosParticipa.length,
    creativo: totalObras,
    marketplace: totalProductos,
  };

  return (
    <div className='mt-5'>
      <div className='flex items-center gap-1 overflow-x-auto border-b border-white/[0.07]'>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-[12.5px] font-medium transition ${tab === t.id
              ? 'border-pink-500 font-semibold text-pink-500'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
          >
            <i className={`ti ${t.icon} text-[15px]`} />
            {t.label}
            {counts[t.id] > 0 && (
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-bold ${tab === t.id
                  ? 'bg-pink-500/15 text-pink-400'
                  : 'bg-white/[0.06] text-neutral-500'
                  }`}
              >
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className='py-5'>
        {cargando && (
          <p className='py-10 text-center text-[13px] text-neutral-500'>
            Cargando…
          </p>
        )}

        {!cargando && tab === 'proyectos' && (
          <ProyectosTab
            creados={proyectosCreados}
            participa={proyectosParticipa}
          />
        )}
        {!cargando && tab === 'materiales' && usuarioId && (
          <MaterialActividad {...actividad} />
        )}
        {!cargando && tab === 'foro' && usuarioId && (
          <ForumActividad {...actividad} />
        )}
        {!cargando && tab === 'anuncios' && usuarioId && (
          <AnnouncementsActividad {...actividad} />
        )}
        {!cargando && tab === 'comunidades' && usuarioId && (
          <ActividadComunidades
            usuarioId={usuarioId}
            carreraPropiaId={carreraId}
            sinAcademico={sinAcademico}
            marcarPropia={esPropio}
          />
        )}
        {!cargando && tab === 'creativo' && usuarioId && (
          <PerfilCreativo usuarioId={usuarioId} esPropio={esPropio} />
        )}
        {!cargando && tab === 'marketplace' && usuarioId && (
          <PerfilMarketplace usuarioId={usuarioId} esPropio={esPropio} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROYECTOS (creados / en los que participa)
// ─────────────────────────────────────────────────────────────────────────────

function ProyectosTab({ creados, participa }) {
  const navigate = useNavigate();
  const [sub, setSub] = useState('creados');
  const lista = sub === 'creados' ? creados : participa;

  return (
    <div>
      <div className='mb-4 flex gap-1 border-b border-white/[0.07]'>
        <button
          onClick={() => setSub('creados')}
          className={`-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12.5px] font-medium transition ${sub === 'creados'
            ? 'border-pink-500 text-pink-500'
            : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
        >
          Creados{' '}
          <span className='text-[10.5px] text-neutral-600'>
            ({creados.length})
          </span>
        </button>
        <button
          onClick={() => setSub('participa')}
          className={`-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12.5px] font-medium transition ${sub === 'participa'
            ? 'border-pink-500 text-pink-500'
            : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
        >
          Participa{' '}
          <span className='text-[10.5px] text-neutral-600'>
            ({participa.length})
          </span>
        </button>
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icono='ti-puzzle'
          texto={
            sub === 'creados'
              ? 'Aún no ha creado proyectos.'
              : 'Aún no participa en otros proyectos.'
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {lista.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/match-proyectos?proyecto=${p.id}`)}
              className='cursor-pointer rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:border-white/[0.14]'
            >
              <div className='mb-2 flex flex-wrap items-center gap-1.5'>
                <EstadoChip estado={p.estado} />
                <ModalidadChip modalidad={p.modalidad} />
              </div>
              <div className='text-[13.5px] font-bold text-neutral-100'>
                {p.titulo}
              </div>
              <p className='mt-1 line-clamp-2 text-[12px] leading-relaxed text-neutral-400'>
                {p.descripcion}
              </p>
              {p.etiquetas?.length > 0 && (
                <div className='mt-2.5 flex flex-wrap gap-1.5'>
                  {p.etiquetas.slice(0, 4).map((et) => {
                    const c = etiquetaColor(et.nombre);
                    return (
                      <ConDescripcion
                        key={et.id}
                        nombre={et.nombre}
                        descripcion={et.descripcion}
                      >
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text} ${c.border}`}
                        >
                          {et.nombre}
                        </span>
                      </ConDescripcion>
                    );
                  })}
                </div>
              )}
              <div className='mt-3 flex items-center gap-1.5 border-t border-white/[0.07] pt-2.5 text-[11px] text-neutral-500'>
                <i className='ti ti-users text-[13px]' /> {p.total_integrantes}{' '}
                integrante{p.total_integrantes === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GENÉRICOS
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icono, texto }) {
  return (
    <div className='flex flex-col items-center py-14 text-center'>
      <i className={`ti ${icono} mb-3 text-4xl text-neutral-700`} />
      <p className='max-w-xs text-[12.5px] leading-relaxed text-neutral-500'>
        {texto}
      </p>
    </div>
  );
}