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
import { listarCarreras } from '@/shared/api/catalog.api';
import { useAuthStore } from '@/shared/auth/authStore';
import { puedeEscribir } from '@/shared/auth/roles';
import { mensajeDeError } from '@/shared/lib/errores';

const PESTANAS = [
  { id: 'foro', label: 'Foro', icono: 'ti-message-circle-2' },
  { id: 'materiales', label: 'Materiales', icono: 'ti-books' },
  { id: 'anuncios', label: 'Anuncios', icono: 'ti-speakerphone' },
];
const PESTANA_INICIAL = 'foro';

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

  // publicar solo se puede en la propia carrera (reglas del backend); leer,
  // comentar y votar en otras carreras sí
  const esPropia = usuario?.carrera_id === carrera.id;
  const puedePublicar = esPropia && puedeEscribir(usuario);

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <PageBanner
          icon='ti-building'
          title={carrera.nombre}
          subtitle='Comunidad · Foro, materiales y anuncios de la carrera'
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

        {pestana === 'foro' && (
          <ForumFeed
            carreraId={carrera.id}
            permitirCrear={esPropia}
          />
        )}
        {pestana === 'materiales' && (
          <MaterialFeed
            carreraId={carrera.id}
            onAbrirSubida={
              puedePublicar ? () => setUploadAbierto(true) : undefined
            }
          />
        )}
        {pestana === 'anuncios' && <AnnouncementsFeed carreraId={carrera.id} />}
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
          {!esPropia && (
            <p className='mt-2 text-[12px] leading-relaxed text-neutral-500'>
              Esta no es tu carrera: puedes leer, comentar y votar, pero
              publicar solo está disponible en tu propia carrera.
            </p>
          )}
        </RpCard>
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