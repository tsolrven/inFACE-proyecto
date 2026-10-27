import RightPanel from '@/shared/components/layout/RightPanel';
import RpCard from '@/shared/components/layout/RpCard';
import RpRules from '@/shared/components/layout/RpRules';
import PageBanner from '@/shared/components/layout/PageBanner';
import ForumFeed from '@/features/forum/components/ForumFeed';
import { useAuthStore } from '@/shared/auth/authStore';

const rules = [
  'Publica solo en ramos de tu carrera; puedes leer, comentar y votar en las demás.',
  'Escribe un título claro: otros lo buscarán antes de preguntar.',
  'Marca como resuelta la respuesta que te sirvió.',
  'No compartas respuestas de pruebas o tareas evaluadas.',
  'Respeta a la comunidad: reporta, no respondas con ataques.',
];

export default function ForumPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const carreraId = usuario?.carrera_id ?? null;
  const carreraNombre = usuario?.carreras?.[0]?.nombre ?? 'tu carrera';

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <PageBanner
          icon='ti-message-circle-2'
          iconColor='text-emerald-400'
          iconBg='bg-emerald-400/10 border-emerald-400/30'
          gradient='linear-gradient(135deg, rgba(52,211,153,0.07) 0%, rgba(96,165,250,0.05) 100%)'
          title='Foro por ramos'
          subtitle={`${carreraNombre} · Preguntas y conversaciones por ramo`}
          searchPlaceholder='Buscar en el foro...'
          breadcrumb={[
            { label: 'Inicio', to: '/' },
            { label: 'Académico' },
            { label: 'Foro por ramos' },
          ]}
        />

        <ForumFeed carreraId={carreraId} />
      </div>

      <RightPanel>
        <RpCard
          title='Acerca del foro'
          icon='ti-info-circle'
        >
          <p className='text-[12px] leading-relaxed text-neutral-400'>
            Espacio para resolver dudas y conversar sobre los ramos de{' '}
            <span className='font-semibold text-neutral-200'>
              {carreraNombre}
            </span>
            . Solo estudiantes con correo institucional.
          </p>
        </RpCard>

        <RpCard
          title='Normas del foro'
          icon='ti-clipboard-list'
          iconColor='text-emerald-400'
        >
          <RpRules items={rules} />
        </RpCard>
      </RightPanel>
    </div>
  );
}
