import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RightPanel from '@/shared/components/layout/RightPanel';
import RpCard from '@/shared/components/layout/RpCard';
import RpRules from '@/shared/components/layout/RpRules';
import PageBanner from '@/shared/components/layout/PageBanner';
import Pestanas from '@/shared/components/ui/Pestanas';
import MaterialFeed from '@/features/materials/components/MaterialFeed';
import MaterialGuardados from '@/features/materials/components/MaterialGuardados';
import UploadModal from '@/features/materials/components/UploadModal';
import { useAuthStore } from '@/shared/auth/authStore';
import TopColaboradoresCard from '@/shared/statistics/TopColaboradoresCard';
import TagsPopularesCard from '@/shared/statistics/TagsPopularesCard';
import { puedeEscribir } from '@/shared/auth/roles';
import { useBusqueda } from '@/shared/hooks/useBusqueda';
import { BUSQUEDA_MAX } from '@/shared/lib/busqueda';

const rules = [
  'Sube solo materiales propios o con autorización del autor original.',
  'No subas respuestas completas de pruebas o tareas evaluadas.',
  'Etiqueta correctamente el ramo y los tags para facilitar la búsqueda.',
  'Reporta materiales con errores graves para que la comunidad pueda corregirlos.',
  'El repositorio es un bien común: cuídalo y contribuye activamente.',
];

const VISTAS = [
  { id: 'publicaciones', label: 'Publicaciones', icono: 'ti-layout-grid' },
  { id: 'guardados', label: 'Guardados', icono: 'ti-bookmark' },
];

export default function RepositorioMateriales() {
  const usuario = useAuthStore((s) => s.usuario);
  const [searchParams, setSearchParams] = useSearchParams();
  const carreraId = usuario?.carrera_id ?? null;
  const carreraNombre = usuario?.carreras?.[0]?.nombre ?? 'tu carrera';
  const [uploadAbierto, setUploadAbierto] = useState(
    () => searchParams.get('subir') === '1' && puedeEscribir(usuario),
  );
  const [vista, setVista] = useState('publicaciones');

  // un solo texto para ambas pestañas: se conserva al cambiar entre
  // Publicaciones y Guardados (ver useBusqueda: debounce y borrado inmediato)
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const busqueda = useBusqueda(textoBusqueda);

  useEffect(() => {
    if (searchParams.get('subir') !== '1') return;
    const params = new URLSearchParams(searchParams);
    params.delete('subir');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const banner = {
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
          searchPlaceholder={
            vista === 'publicaciones'
              ? 'Buscar en el repositorio...'
              : 'Buscar en tus guardados...'
          }
          searchValue={textoBusqueda}
          onSearchChange={setTextoBusqueda}
          searchMaxLength={BUSQUEDA_MAX}
          breadcrumb={banner.breadcrumb}
        />

        <Pestanas
          pestanas={VISTAS}
          activa={vista}
          onCambiar={setVista}
          acento='border-blue-400'
        />

        {vista === 'publicaciones' ? (
          <MaterialFeed
            carreraId={carreraId}
            busqueda={busqueda}
            onAbrirSubida={
              puedeEscribir(usuario) ? () => setUploadAbierto(true) : undefined
            }
          />
        ) : (
            <MaterialGuardados
              busqueda={busqueda}
              carreraId={carreraId}
            />
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
        </RpCard>

        <TopColaboradoresCard
          tipo='apunte'
          carreraId={carreraId}
        />

        <TagsPopularesCard
          tipo='apunte'
          carreraId={carreraId}
        />

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
