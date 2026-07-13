import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  etiquetaColor,
  EstadoChip,
  ModalidadChip,
  tiempoRelativo,
} from '../helpers/matchHelpers';

const TABS = [
  { id: 'proyectos', label: 'Proyectos', icon: 'ti-puzzle' },
  { id: 'apuntes', label: 'Apuntes', icon: 'ti-file-text' },
  { id: 'respuestas', label: 'Respuestas', icon: 'ti-message-circle-2' },
  { id: 'creativo', label: 'Creativo', icon: 'ti-palette' },
  { id: 'marketplace', label: 'Marketplace', icon: 'ti-shopping-bag' },
];

export default function PerfilTabs({
  proyectosCreados = [],
  proyectosParticipa = [],
  apuntes = [],
  respuestas = [],
  cargando = false,
}) {
  const [tab, setTab] = useState('proyectos');

  const counts = {
    proyectos: proyectosCreados.length + proyectosParticipa.length,
    apuntes: apuntes.length,
    respuestas: respuestas.length,
  };

  return (
    <div className='mt-5'>
      <div className='flex items-center gap-1 overflow-x-auto border-b border-white/[0.07]'>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-[12.5px] font-medium transition ${
              tab === t.id
                ? 'border-pink-500 font-semibold text-pink-500'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <i className={`ti ${t.icon} text-[15px]`} />
            {t.label}
            {counts[t.id] > 0 && (
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                  tab === t.id
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
        {!cargando && tab === 'apuntes' && <ApuntesTab apuntes={apuntes} />}
        {!cargando && tab === 'respuestas' && (
          <ProximamenteTab
            icono='ti-message-circle-2'
            texto='El foro por ramos todavía está en construcción, así que todavía no puedes ver tus respuestas aquí.'
          />
        )}
        {!cargando && tab === 'creativo' && (
          <ProximamenteTab
            icono='ti-palette'
            texto='El módulo cultural (audio, galerías, obras por capítulos) todavía está en construcción.'
          />
        )}
        {!cargando && tab === 'marketplace' && (
          <ProximamenteTab
            icono='ti-shopping-bag'
            texto='El marketplace de InFACE todavía está en construcción.'
          />
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
          className={`-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12.5px] font-medium transition ${
            sub === 'creados'
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
          className={`-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12.5px] font-medium transition ${
            sub === 'participa'
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
                      <span
                        key={et.id}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text} ${c.border}`}
                      >
                        {et.nombre}
                      </span>
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
// APUNTES
// ─────────────────────────────────────────────────────────────────────────────

const ICONO_TIPO_APUNTE = {
  apunte: 'ti-file-text',
  codigo: 'ti-code',
  guia: 'ti-book',
};

function ApuntesTab({ apuntes }) {
  if (apuntes.length === 0) {
    return (
      <EmptyState
        icono='ti-file-text'
        texto='Aún no ha compartido apuntes o códigos en el repositorio.'
      />
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      {apuntes.map((a) => (
        <div
          key={a.id}
          className='flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-4 py-3'
        >
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-pink-500/10'>
            <i
              className={`ti ${ICONO_TIPO_APUNTE[a.tipo] || 'ti-file-text'} text-[17px] text-pink-400`}
            />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-[13px] font-medium text-neutral-100'>
              {a.titulo}
            </div>
            <div className='mt-0.5 text-[11px] text-neutral-500'>
              {a.ramo || 'Sin ramo'} · {tiempoRelativo(a.fecha_creacion)}
            </div>
          </div>
          <div className='flex-shrink-0 text-[11.5px] text-neutral-500'>
            <i className='ti ti-arrow-big-up-lines mr-1 text-[13px]' />
            {a.votos_neto}
          </div>
        </div>
      ))}
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

function ProximamenteTab({ icono, texto }) {
  return (
    <div className='flex flex-col items-center rounded-2xl border border-dashed border-white/[0.1] py-14 text-center'>
      <i className={`ti ${icono} mb-3 text-4xl text-neutral-700`} />
      <div className='mb-1 text-[13px] font-semibold text-neutral-300'>
        Próximamente
      </div>
      <p className='max-w-xs text-[12.5px] leading-relaxed text-neutral-500'>
        {texto}
      </p>
    </div>
  );
}
