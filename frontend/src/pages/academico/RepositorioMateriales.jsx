import RightPanel from '../../components/rightPanel/RightPanel';
import RpCard from '../../components/rightPanel/RpCard';
import RpStats from '../../components/rightPanel/RpStats';
import RpRules from '../../components/rightPanel/RpRules';
import PageBanner from '../../components/banner/PageBanner';
import MaterialFeed from '../../components/repositorioMateriales/MaterialFeed';
import UploadModal from '../../components/repositorioMateriales/UploadModal';
import { useAuthStore } from '../../stores/authStore';
import { useState } from 'react';

const stats = [
  { num: '487', label: 'materiales' },
  { num: '314', label: 'archivos PDF' },
  { num: '89', label: 'repositorios' },
  { num: '84%', label: 'aprobación' },
];

const collaborators = [
  {
    initials: 'VR',
    username: 'u/tutora_valentina',
    pts: '1.8k pts',
    color: 'bg-amber-400/10 text-amber-400',
  },
  {
    initials: 'FM',
    username: 'u/felipe_morales',
    pts: '742 pts',
    color: 'bg-blue-400/10 text-blue-400',
  },
  {
    initials: 'CL',
    username: 'u/camila_lagos',
    pts: '489 pts',
    color: 'bg-emerald-400/10 text-emerald-400',
  },
  {
    initials: 'RM',
    username: 'u/rodrigo_mm',
    pts: '198 pts',
    color: 'bg-violet-400/10 text-violet-400',
  },
];

const tags = [
  '#certamen',
  '#C++',
  '#Java',
  '#SQL',
  '#arboles',
  '#derivadas',
  '#procesos',
  '#normalizacion',
  '#plantilla',
  '#UML',
];

const rules = [
  'Sube solo materiales propios o con autorización del autor original.',
  'No subas respuestas completas de pruebas o tareas evaluadas.',
  'Elige bien el ramo y usa tags relevantes para que tu material sea fácil de encontrar.',
  'Reporta contenido plagiado, falso, ofensivo o fuera de lugar — no solo material con errores.',
  'Mantén un trato respetuoso en los comentarios y no manipules los votos.',
];

export default function RepositorioMateriales() {
  const usuario = useAuthStore((s) => s.usuario);
  const carreraId = usuario?.carrera_id ?? null;
  const carreraNombre = usuario?.carreras?.[0]?.nombre ?? 'tu carrera';
  const [uploadAbierto, setUploadAbierto] = useState(false);

  return (
    <div className='flex flex-1 overflow-hidden h-full'>
      <div className='flex flex-col flex-1 overflow-hidden'>
        <PageBanner
          icon='ti-books'
          iconColor='text-blue-400'
          iconBg='bg-blue-400/10 border-blue-400/30'
          gradient='linear-gradient(135deg, rgba(96,165,250,0.07) 0%, rgba(129,140,248,0.05) 100%)'
          title='Repositorio de materiales'
          subtitle={`${carreraNombre} · Materiales compartidos por la comunidad`}
          searchPlaceholder='Buscar en el repositorio...'
          breadcrumb={[
            { label: 'Inicio', to: '/' },
            { label: 'Académico' },
            { label: 'Repositorio de materiales' },
          ]}
        />

        <MaterialFeed
          carreraId={carreraId}
          onAbrirSubida={() => setUploadAbierto(true)}
        />
      </div>

      <RightPanel>
        <RpCard
          title='Acerca del repositorio'
          icon='ti-info-circle'
        >
          <p className='text-[12px] text-neutral-400 leading-relaxed mb-2.5'>
            Espacio colaborativo para compartir y descubrir apuntes y material
            de estudio de los ramos de{' '}
            <span className='font-semibold text-neutral-200'>
              {carreraNombre}
            </span>
            . Vota y comenta lo que te sirva. El repositorio es un bien común:
            cuídalo y contribuye activamente.
          </p>
          <RpStats items={stats} />
        </RpCard>

        <RpCard
          title='Top colaboradores'
          icon='ti-star'
        >
          <div className='flex flex-col'>
            {collaborators.map(({ initials, username, pts, color }) => (
              <div
                key={username}
                className='flex items-center gap-2 py-1.5'
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${color}`}
                >
                  {initials}
                </div>
                <span className='flex-1 text-[12px] text-neutral-400'>
                  {username}
                </span>
                <span className='text-[11px] font-semibold text-pink-500'>
                  {pts}
                </span>
              </div>
            ))}
          </div>
        </RpCard>

        <RpCard
          title='Tags populares'
          icon='ti-hash'
        >
          <div className='flex flex-wrap gap-1.5'>
            {tags.map((tag) => (
              <span
                key={tag}
                className='cursor-pointer rounded-full border border-transparent bg-[#2A2A32] px-2.5 py-0.5 text-[11px] text-neutral-500 transition-colors hover:border-white/[0.07] hover:bg-white/[0.06] hover:text-neutral-100'
              >
                {tag}
              </span>
            ))}
          </div>
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
