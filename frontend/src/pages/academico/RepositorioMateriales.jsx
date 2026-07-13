import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import RightPanel from '../../components/rightPanel/RightPanel';
import RpCard from '../../components/rightPanel/RpCard';
import RpRules from '../../components/rightPanel/RpRules';
import PageBanner from '../../components/banner/PageBanner';
import MaterialFeed from '../../components/repositorioMateriales/MaterialFeed';
import GuardadosFeed from '../../components/repositorioMateriales/GuardadosFeed';
import UploadModal from '../../components/repositorioMateriales/UploadModal';
import { useAuthStore } from '../../stores/authStore';
import { useRepositorioStore } from '../../stores/repositorioStore';
import {
  listarTopColaboradores,
  listarHashtagsPopulares,
} from '../../services/repositorioMateriales/estadisticas.service';
import armadilloRepositorio from '../../assets/armadillo-repositorio-materiales.png';

const COLORES_COLABORADOR = [
  'bg-amber-400/10 text-amber-400',
  'bg-blue-400/10 text-blue-400',
  'bg-emerald-400/10 text-emerald-400',
  'bg-violet-400/10 text-violet-400',
  'bg-rose-400/10 text-rose-400',
];

function inicialesDe(nombreUsuario) {
  return (nombreUsuario || '??').slice(0, 2).toUpperCase();
}

function formatearPuntos(puntos) {
  return puntos >= 1000
    ? `${(puntos / 1000).toFixed(1)}k pts`
    : `${puntos} pts`;
}

const rules = [
  'Sube solo materiales propios o con autorización del autor original.',
  'No subas respuestas completas de pruebas o tareas evaluadas.',
  'Etiqueta correctamente el ramo y los tags para facilitar la búsqueda.',
  'Reporta materiales con errores graves para que la comunidad pueda corregirlos.',
  'El repositorio es un bien común: cuídalo y contribuye activamente.',
];

export default function RepositorioMateriales() {
  const usuario = useAuthStore((s) => s.usuario);
  const carreraId = usuario?.carrera_id ?? null;
  const carreraNombre = usuario?.carreras?.[0]?.nombre ?? 'tu carrera';
  const [uploadAbierto, setUploadAbierto] = useState(false);
  const [vista, setVista] = useState('publicaciones');

  const [colaboradores, setColaboradores] = useState([]);
  const [tagsPopulares, setTagsPopulares] = useState([]);

  const { hashtag } = useParams();
  const setFiltro = useRepositorioStore((s) => s.setFiltro);

  useEffect(() => {
    setFiltro('hashtag', hashtag ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashtag]);

  useEffect(() => {
    if (!carreraId) return;
    listarTopColaboradores()
      .then(setColaboradores)
      .catch(() => setColaboradores([]));
    listarHashtagsPopulares()
      .then(setTagsPopulares)
      .catch(() => setTagsPopulares([]));
  }, [carreraId]);

  const banner = hashtag
    ? {
        title: `#${hashtag}`,
        subtitle: `Publicaciones con #${hashtag} en ${carreraNombre}`,
        breadcrumb: [
          { label: 'Inicio', to: '/' },
          { label: 'Académico' },
          { label: 'Repositorio de materiales', to: '/repositorio-materiales' },
          { label: `#${hashtag}` },
        ],
      }
    : {
        title: 'Repositorio de materiales',
        subtitle: `${carreraNombre} · Materiales compartidos por la comunidad`,
        breadcrumb: [
          { label: 'Inicio', to: '/' },
          { label: 'Académico' },
          { label: 'Repositorio de materiales' },
        ],
      };

  return (
    <div className='flex flex-1 overflow-hidden h-full'>
      <div className='flex flex-col flex-1 overflow-hidden'>
        <PageBanner
          icon='ti-books'
          iconColor='text-blue-400'
          iconBg='bg-blue-400/10 border-blue-400/30'
          gradient='linear-gradient(135deg, rgba(96,165,250,0.07) 0%, rgba(129,140,248,0.05) 100%)'
          title={banner.title}
          subtitle={banner.subtitle}
          searchPlaceholder='Buscar en el repositorio...'
          breadcrumb={banner.breadcrumb}
        />

        <MaterialSectionTabs
          vista={vista}
          onCambiar={setVista}
        />

        {vista === 'publicaciones' ? (
          <MaterialFeed
            carreraId={carreraId}
            onAbrirSubida={() => setUploadAbierto(true)}
          />
        ) : (
          <GuardadosFeed />
        )}
      </div>

      <RightPanel>
        <RpCard
          title='Acerca del repositorio'
          icon='ti-info-circle'
        >
          <p className='text-[12px] text-neutral-400 leading-relaxed mb-2.5'>
            Espacio colaborativo para compartir y descubrir materiales de
            estudio de los ramos de{' '}
            <span className='font-semibold text-neutral-200'>
              {carreraNombre}
            </span>
            . Solo estudiantes con correo institucional.
          </p>
          <img
            src={armadilloRepositorio}
            alt='Armadillo mascota del repositorio de materiales'
            className='w-full rounded-[10px]'
          />
        </RpCard>

        <RpCard
          title='Top colaboradores'
          icon='ti-star'
        >
          {colaboradores.length === 0 ? (
            <p className='text-[11.5px] text-neutral-600'>
              Aún no hay colaboradores con votos en tu carrera.
            </p>
          ) : (
            <div className='flex flex-col'>
              {colaboradores.map(
                ({ usuario_id, nombre_usuario, puntos }, i) => (
                  <div
                    key={usuario_id}
                    className='flex items-center gap-2 py-1.5'
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        COLORES_COLABORADOR[i % COLORES_COLABORADOR.length]
                      }`}
                    >
                      {inicialesDe(nombre_usuario)}
                    </div>
                    <span className='flex-1 text-[12px] text-neutral-400'>
                      u/{nombre_usuario}
                    </span>
                    <span className='text-[11px] font-semibold text-pink-500'>
                      {formatearPuntos(puntos)}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </RpCard>

        <RpCard
          title='Tags populares'
          icon='ti-hash'
        >
          {tagsPopulares.length === 0 ? (
            <p className='text-[11.5px] text-neutral-600'>
              Aún no hay tags usados en los últimos 30 días.
            </p>
          ) : (
            <div className='flex flex-wrap gap-1.5'>
              {tagsPopulares.map(({ nombre }) => (
                <Link
                  key={nombre}
                  to={`/repositorio-materiales/tag/${nombre}`}
                  className='cursor-pointer rounded-full border border-transparent bg-[#2A2A32] px-2.5 py-0.5 text-[11px] text-neutral-500 transition-colors hover:border-white/[0.07] hover:bg-white/[0.06] hover:text-neutral-100'
                >
                  #{nombre}
                </Link>
              ))}
            </div>
          )}
        </RpCard>

        <RpCard
          title='Normas del repositorio'
          icon='ti-clipboard-list'
          iconColor='text-blue-400'
        >
          <RpRules items={rules} />
        </RpCard>
      </RightPanel>

      <UploadModal
        open={uploadAbierto}
        onClose={() => setUploadAbierto(false)}
        carreraId={carreraId}
      />
    </div>
  );
}

function MaterialSectionTabs({ vista, onCambiar }) {
  return (
    <div className='flex gap-1 border-b border-white/[0.06] px-4 pt-2'>
      <button
        type='button'
        onClick={() => onCambiar('publicaciones')}
        className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors ${
          vista === 'publicaciones'
            ? 'border-blue-400 text-neutral-100'
            : 'border-transparent text-neutral-500 hover:text-neutral-200'
        }`}
      >
        <i className='ti ti-layout-grid text-[15px]' /> Publicaciones
      </button>
      <button
        type='button'
        onClick={() => onCambiar('guardados')}
        className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors ${
          vista === 'guardados'
            ? 'border-blue-400 text-neutral-100'
            : 'border-transparent text-neutral-500 hover:text-neutral-200'
        }`}
      >
        <i className='ti ti-bookmark text-[15px]' /> Guardados
      </button>
    </div>
  );
}
