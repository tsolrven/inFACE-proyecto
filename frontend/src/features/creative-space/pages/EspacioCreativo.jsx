import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RightPanel from '@/shared/components/layout/RightPanel';
import RpCard from '@/shared/components/layout/RpCard';
import RpRules from '@/shared/components/layout/RpRules';
import PageBanner from '@/shared/components/layout/PageBanner';
import Pestanas from '@/shared/components/ui/Pestanas';
import CreativeFeed from '@/features/creative-space/components/CreativeFeed';
import HashtagsPopulares from '@/features/creative-space/components/HashtagsPopulares';
import CreativeGuardados from '@/features/creative-space/components/CreativeGuardados';
import { useCreativeFiltrosStore } from '@/features/creative-space/store/creativeFiltrosStore';
import { ESPACIOS, rutas } from '@/features/creative-space/utils/espacios';

const rules = [
  'Comparte solo obras propias o con permiso de su autor.',
  'Si usas música o imágenes de otras personas, da los créditos.',
  'Sé respetuoso al comentar: critica la obra, no a la persona.',
  'No publiques contenido ofensivo, violento o con derechos ajenos.',
  'Reporta lo que no cumpla las normas.',
];

const VISTAS = [
  { id: 'explorar', label: 'Explorar todo', icono: 'ti-compass' },
  { id: 'temas', label: 'Explorar por tema', icono: 'ti-layout-grid' },
  { id: 'mias', label: 'Mis obras', icono: 'ti-user' },
  { id: 'guardados', label: 'Guardados', icono: 'ti-bookmark' },
];

function InfoEspacio({ conHashtags = false }) {
  return (
    <>
      <RpCard
        title='Acerca del espacio'
        icon='ti-info-circle'
      >
        <p className='text-[12px] leading-relaxed text-neutral-400'>
          Un lugar para mostrar lo que creas. Vota, comenta y guarda tus obras
          favoritas.
        </p>
      </RpCard>
      {conHashtags && (
        <RpCard
          title='Hashtags populares'
          icon='ti-hash'
          iconColor='text-blue-400'
        >
          <HashtagsPopulares />
        </RpCard>
      )}
      <RpCard
        title='Normas'
        icon='ti-clipboard-list'
        iconColor='text-pink-400'
      >
        <RpRules items={rules} />
      </RpCard>
    </>
  );
}

export default function EspacioCreativo() {
  const [vista, setVista] = useState('explorar');
  const [verHashtags, setVerHashtags] = useState(false);
  const [verInfo, setVerInfo] = useState(false);
  const resetFiltros = useCreativeFiltrosStore((s) => s.resetFiltros);

  useEffect(() => {
    resetFiltros();
  }, [vista, resetFiltros]);

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <PageBanner
          icon='ti-palette'
          iconColor='text-pink-400'
          iconBg='bg-pink-400/10 border-pink-400/30'
          gradient='linear-gradient(135deg, rgba(244,114,182,0.07) 0%, rgba(167,139,250,0.05) 100%)'
          title='Espacio creativo'
          subtitle='Elige un espacio para explorar y compartir tu arte'
          searchPlaceholder='Buscar en el espacio creativo...'
          breadcrumb={[
            { label: 'Inicio', to: '/' },
            { label: 'Cultural' },
            { label: 'Espacio creativo' },
          ]}
        />

        <div className='flex-1 overflow-y-auto'>
          <div className='overflow-x-auto [&>div]:min-w-max [&_button]:whitespace-nowrap'>
            <Pestanas
              pestanas={VISTAS}
              activa={vista}
              onCambiar={setVista}
              acento='border-pink-400'
            />
          </div>

          {vista === 'temas' ? (
            <div className='mx-auto grid w-full max-w-[1000px] gap-3 p-4 sm:grid-cols-2'>
              {ESPACIOS.map((e) => (
                <Link
                  key={e.id}
                  to={rutas.espacio(e.id)}
                  className='group relative overflow-hidden rounded-[16px] border border-white/[0.07] p-5 transition-colors hover:border-white/[0.2]'
                  style={{
                    background: `linear-gradient(135deg, ${e.color}1f 0%, #1A1A1F 70%)`,
                  }}
                >
                  <span
                    className='mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-2xl'
                    style={{ background: `${e.color}26`, color: e.color }}
                  >
                    <i className={`ti ${e.icono}`} />
                  </span>
                  <h2 className='text-[17px] font-bold text-neutral-100'>
                    {e.label}
                  </h2>
                  <p className='mt-1 text-[12.5px] leading-snug text-neutral-400'>
                    {e.descripcion}
                  </p>
                  <span
                    className='mt-3 flex items-center gap-1 text-[12px] font-semibold transition-transform group-hover:translate-x-0.5'
                    style={{ color: e.color }}
                  >
                    Entrar <i className='ti ti-arrow-right' />
                  </span>
                </Link>
              ))}
            </div>
          ) : vista === 'guardados' ? (
            <CreativeGuardados />
          ) : (
            <>
              {vista === 'explorar' && (
                <div className='mx-auto flex w-full max-w-[1000px] flex-col items-end px-3 pt-3 sm:px-4'>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => setVerInfo((v) => !v)}
                      aria-expanded={verInfo}
                      className='flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-[#1E1E24] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 hover:border-white/[0.2] lg:hidden'
                    >
                      <i className='ti ti-info-circle' /> Info y normas
                    </button>
                    <button
                      type='button'
                      onClick={() => setVerHashtags((v) => !v)}
                      aria-expanded={verHashtags}
                      className='flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-[#1E1E24] px-3 py-1.5 text-[12px] font-semibold text-blue-300 hover:border-white/[0.2]'
                    >
                      <i className='ti ti-hash' /> Hashtags
                      <i
                        className={`ti ${verHashtags ? 'ti-chevron-up' : 'ti-chevron-down'} text-[12px]`}
                      />
                    </button>
                  </div>
                  {verInfo && (
                    <div className='mt-2 flex w-full flex-col gap-3 lg:hidden'>
                      <InfoEspacio />
                    </div>
                  )}
                  {verHashtags && (
                    <div className='mt-2 w-full rounded-[12px] border border-white/[0.07] bg-[#1E1E24] p-3'>
                      <HashtagsPopulares />
                    </div>
                  )}
                </div>
              )}
              <CreativeFeed
                key={vista}
                soloMias={vista === 'mias'}
                crearTipos={ESPACIOS.flatMap((e) => e.crear)}
                textoCrear='Compartir mi arte'
              />
            </>
          )}
        </div>
      </div>

      <RightPanel>
        <InfoEspacio conHashtags />
      </RightPanel>
    </div>
  );
}