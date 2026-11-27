import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageBanner from '@/shared/components/layout/PageBanner';
import RightPanel from '@/shared/components/layout/RightPanel';
import RpCard from '@/shared/components/layout/RpCard';
import Pestanas from '@/shared/components/ui/Pestanas';
import { MaterialFeed, UploadModal } from '@/features/materials';
import { ForumFeed } from '@/features/forum';
import { AnnouncementsFeed } from '@/features/announcements';
import MaterialGuardados from '@/features/materials/components/MaterialGuardados';
import ForumGuardados from '@/features/forum/components/ForumGuardados';
import AnnouncementsGuardados from '@/features/announcements/components/AnnouncementsGuardados';
import FiltrosAnunciosCard from '@/features/announcements/components/FiltrosAnunciosCard';
import FiltrosForoCard from '@/features/forum/components/FiltrosForoCard';
import FiltrosMaterialesCard from '@/features/materials/components/FiltrosMaterialesCard';
import TopColaboradoresCard from '@/shared/statistics/TopColaboradoresCard';
import TagsPopularesCard from '@/shared/statistics/TagsPopularesCard';
import { listarCarreras } from '@/shared/api/catalog.api';
import { useAuthStore } from '@/shared/auth/authStore';
import { puedeEscribir, esDocenteBase } from '@/shared/auth/roles';
import { mensajeDeError } from '@/shared/lib/errores';
import { useBusqueda } from '@/shared/hooks/useBusqueda';
import { BUSQUEDA_MAX } from '@/shared/lib/busqueda';

const PESTANAS = [
  { id: 'foro', label: 'Foro', icono: 'ti-message-circle-2' },
  { id: 'materiales', label: 'Materiales', icono: 'ti-books' },
  { id: 'anuncios', label: 'Anuncios', icono: 'ti-speakerphone' },
];
const PESTANA_INICIAL = 'foro';

// segunda fila: Publicaciones / Guardados, con el color de cada módulo
const VISTAS = [
  { id: 'publicaciones', label: 'Publicaciones', icono: 'ti-layout-grid' },
  { id: 'guardados', label: 'Guardados', icono: 'ti-bookmark' },
];
const ACENTO_MODULO = {
  foro: 'border-emerald-400',
  materiales: 'border-blue-400',
  anuncios: 'border-amber-400',
};

// panel derecho: las estadísticas siguen a la pestaña activa
// (anuncios no tiene top colaboradores: publican solo CEE y tutores)
const ESTADISTICAS_PESTANA = {
  foro: { tipo: 'hilo', etiqueta: 'Foro', conTop: true },
  materiales: { tipo: 'apunte', etiqueta: 'Materiales', conTop: true },
  anuncios: { tipo: 'anuncio', etiqueta: 'Anuncios', conTop: false },
};

function Estado({ children }) {
  return (
    <div className='flex h-full flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-[13px] text-neutral-500'>
      {children}
    </div>
  );
}

// Comunidad de una carrera: reutiliza los feeds de foro, materiales y anuncios
// filtrados por carrera. Recibe el código de la carrera (el mismo del seed).
export default function ComunidadCarrera({ codigo }) {
  const usuario = useAuthStore((s) => s.usuario);
  const [params, setParams] = useSearchParams();
  const [uploadAbierto, setUploadAbierto] = useState(false);

  // se conserva al cambiar de pestaña (Foro / Materiales / Anuncios); al ir a
  // otra comunidad se reinicia solo, porque cada comunidad es otra página.
  // Debe ir antes de los return tempranos (reglas de los hooks).
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const busqueda = useBusqueda(textoBusqueda);

  // se conserva al cambiar de pestaña: si revisas lo guardado en Foro,
  // al pasar a Materiales sigues en sus guardados
  const [vista, setVista] = useState('publicaciones');

  const {
    data: carreras,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['carreras'],
    queryFn: () => listarCarreras(),
    staleTime: 10 * 60 * 1000,
  });

  // una pestaña desconocida (?pestana=xyz) cae en Foro
  const pedida = params.get('pestana');
  const pestana = PESTANAS.some((p) => p.id === pedida)
    ? pedida
    : PESTANA_INICIAL;

  function cambiarPestana(id) {
    setParams(id === PESTANA_INICIAL ? {} : { pestana: id }, {
      replace: true,
    });
  }

  if (isPending) {
    return (
      <Estado>
        <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
      </Estado>
    );
  }

  if (isError) {
    return (
      <Estado>
        <p>{mensajeDeError(error, 'No se pudo cargar la comunidad.')}</p>
        <button
          type='button'
          onClick={() => refetch()}
          className='font-semibold text-neutral-300 underline-offset-2 hover:underline'
        >
          Reintentar
        </button>
      </Estado>
    );
  }

  const carrera = carreras.find((c) => c.codigo === codigo);
  if (!carrera) {
    return <Estado>No encontramos esta carrera.</Estado>;
  }

  // publicar en foro y materiales: en la propia carrera, o en todas si es
  // docente (reglas del backend). Leer, comentar y votar en otras sí.
  // Los anuncios tienen su propia regla (cargo CEE o tutor).
  const esPropia = usuario?.carrera_id === carrera.id;
  const esDocente = esDocenteBase(usuario); // también el superadmin docente
  const puedePublicar = (esPropia || esDocente) && puedeEscribir(usuario);

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <PageBanner
          icon='ti-building'
          title={carrera.nombre}
          subtitle='Comunidad · Foro, materiales y anuncios de la carrera'
          searchPlaceholder={
            vista === 'publicaciones'
              ? 'Buscar en la comunidad...'
              : 'Buscar en tus guardados...'
          }
          searchValue={textoBusqueda}
          onSearchChange={setTextoBusqueda}
          searchMaxLength={BUSQUEDA_MAX}
          breadcrumb={[
            { label: 'Inicio', to: '/' },
            { label: 'Comunidades' },
            { label: carrera.nombre },
          ]}
        />

        <Pestanas
          pestanas={PESTANAS}
          activa={pestana}
          onCambiar={cambiarPestana}
        />

        <Pestanas
          pestanas={VISTAS}
          activa={vista}
          onCambiar={setVista}
          acento={ACENTO_MODULO[pestana]}
        />

        {vista === 'publicaciones' && pestana === 'foro' && (
          <ForumFeed
            carreraId={carrera.id}
            busqueda={busqueda}
            permitirCrear={puedePublicar}
          />
        )}
        {vista === 'publicaciones' && pestana === 'materiales' && (
          <MaterialFeed
            carreraId={carrera.id}
            busqueda={busqueda}
            onAbrirSubida={
              puedePublicar ? () => setUploadAbierto(true) : undefined
            }
          />
        )}
        {vista === 'publicaciones' && pestana === 'anuncios' && (
          <AnnouncementsFeed
            carreraId={carrera.id}
            busqueda={busqueda}
          />
        )}

        {vista === 'guardados' && pestana === 'foro' && (
          <ForumGuardados
            busqueda={busqueda}
            carreraId={carrera.id}
          />
        )}
        {vista === 'guardados' && pestana === 'materiales' && (
          <MaterialGuardados
            busqueda={busqueda}
            carreraId={carrera.id}
          />
        )}
        {vista === 'guardados' && pestana === 'anuncios' && (
          <AnnouncementsGuardados
            busqueda={busqueda}
            carreraId={carrera.id}
          />
        )}
      </div>

      <RightPanel>
        <RpCard
          title='Acerca de la comunidad'
          icon='ti-building'
        >
          <p className='text-[12px] leading-relaxed text-neutral-400'>
            Espacio de{' '}
            <span className='font-semibold text-neutral-200'>
              {carrera.nombre}
            </span>
            : conversaciones por ramo, materiales compartidos y comunicados
            oficiales de la carrera.
          </p>
          {esDocente ? (
            <p className='mt-2 text-[12px] leading-relaxed text-neutral-500'>
              Como docente puedes publicar en el foro y el repositorio de todas
              las carreras. Los anuncios oficiales los publican el CEE y los
              tutores.
            </p>
          ) : (
            !esPropia && (
              <p className='mt-2 text-[12px] leading-relaxed text-neutral-500'>
                Esta no es tu carrera: puedes leer, comentar y votar, pero
                publicar solo está disponible en tu propia carrera.
              </p>
            )
          )}
        </RpCard>

        {vista === 'publicaciones' && pestana === 'foro' && (
          <FiltrosForoCard carreraId={carrera.id} />
        )}

        {vista === 'publicaciones' && pestana === 'materiales' && (
          <FiltrosMaterialesCard carreraId={carrera.id} />
        )}

        {vista === 'publicaciones' && pestana === 'anuncios' && (
          <FiltrosAnunciosCard carreraId={carrera.id} />
        )}

        {ESTADISTICAS_PESTANA[pestana].conTop && (
          <TopColaboradoresCard
            tipo={ESTADISTICAS_PESTANA[pestana].tipo}
            carreraId={carrera.id}
            etiquetaModulo={ESTADISTICAS_PESTANA[pestana].etiqueta}
          />
        )}

        <TagsPopularesCard
          tipo={ESTADISTICAS_PESTANA[pestana].tipo}
          carreraId={carrera.id}
          carreraCodigo={carrera.codigo.toLowerCase()}
          etiquetaModulo={ESTADISTICAS_PESTANA[pestana].etiqueta}
        />
      </RightPanel>

      {puedePublicar && (
        <UploadModal
          open={uploadAbierto}
          onClose={() => setUploadAbierto(false)}
          carreraId={carrera.id}
        />
      )}
    </div>
  );
}