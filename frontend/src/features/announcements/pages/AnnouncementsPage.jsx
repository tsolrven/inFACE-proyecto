import { useState } from 'react';
import { useAuthStore } from '@/shared/auth/authStore';
import RightPanel from '@/shared/components/layout/RightPanel';
import RpCard from '@/shared/components/layout/RpCard';
import RpRules from '@/shared/components/layout/RpRules';
import PageBanner from '@/shared/components/layout/PageBanner';
import Pestanas from '@/shared/components/ui/Pestanas';
import AnnouncementsFeed from '@/features/announcements/components/AnnouncementsFeed';
import AnnouncementsGuardados from '@/features/announcements/components/AnnouncementsGuardados';

const rules = [
  'Los anuncios oficiales los publican el CEE y los tutores de cada carrera.',
  'Aquí ves los anuncios de tu carrera; los de otras carreras están en su comunidad.',
  'Puedes comentar y votar en los anuncios de cualquier carrera.',
  'Revisa los PDF e imágenes adjuntos: a veces traen la información completa.',
  'Si ves un anuncio que incumple las normas, repórtalo.',
];

const VISTAS = [
  { id: 'publicaciones', label: 'Publicaciones', icono: 'ti-layout-grid' },
  { id: 'guardados', label: 'Guardados', icono: 'ti-bookmark' },
];

export default function AnunciosOficiales() {
  const usuario = useAuthStore((s) => s.usuario);
  const carreraId = usuario?.carrera_id ?? null;
  const carreraNombre = usuario?.carreras?.[0]?.nombre ?? 'tu carrera';
  const [vista, setVista] = useState('publicaciones');

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <PageBanner
          icon='ti-speakerphone'
          iconColor='text-amber-400'
          iconBg='bg-amber-400/10 border-amber-400/30'
          gradient='linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(251,146,60,0.05) 100%)'
          title='Anuncios oficiales'
          subtitle={`${carreraNombre} · Comunicados del CEE y los tutores`}
          searchPlaceholder='Buscar anuncios...'
          breadcrumb={[
            { label: 'Inicio', to: '/' },
            { label: 'Académico' },
            { label: 'Anuncios oficiales' },
          ]}
        />

        <Pestanas
          pestanas={VISTAS}
          activa={vista}
          onCambiar={setVista}
          acento='border-amber-400'
        />

        {vista === 'publicaciones' ? (
          <AnnouncementsFeed carreraId={carreraId} />
        ) : (
          <AnnouncementsGuardados />
        )}
      </div>

      <RightPanel>
        <RpCard
          title='Acerca de los anuncios'
          icon='ti-info-circle'
        >
          <p className='text-[12px] leading-relaxed text-neutral-400'>
            Comunicados oficiales de cada carrera: fechas, avisos y documentos
            publicados por el CEE y los tutores.
          </p>
        </RpCard>

        <RpCard
          title='Normas de los anuncios'
          icon='ti-clipboard-list'
          iconColor='text-amber-400'
        >
          <RpRules items={rules} />
        </RpCard>
      </RightPanel>
    </div>
  );
}
