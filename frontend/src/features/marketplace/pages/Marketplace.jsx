import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RightPanel from '@/shared/components/layout/RightPanel';
import RpCard from '@/shared/components/layout/RpCard';
import RpRules from '@/shared/components/layout/RpRules';
import PageBanner from '@/shared/components/layout/PageBanner';
import Pestanas from '@/shared/components/ui/Pestanas';
import Button from '@/shared/components/ui/Button';
import FiltrosProductos from '@/features/marketplace/components/FiltrosProductos';
import MarketplaceFeed from '@/features/marketplace/components/MarketplaceFeed';
import MarketplaceGuardados from '@/features/marketplace/components/MarketplaceGuardados';
import {
  FILTROS_INICIALES,
  rutas,
} from '@/features/marketplace/utils/catalogo';

const VISTAS = [
  { id: 'explorar', label: 'Explorar', icono: 'ti-compass' },
  { id: 'mios', label: 'Mis productos', icono: 'ti-user' },
  { id: 'guardados', label: 'Guardados', icono: 'ti-bookmark' },
];

const consejos = [
  'Encuéntrate en un lugar público y con gente, como la universidad.',
  'Revisa el producto antes de pagar.',
  'Desconfía de precios demasiado bajos o de quien te pide pagar antes de verlo.',
  'Nunca compartas claves ni códigos que te lleguen por mensaje.',
  'Marca como vendido lo que ya no esté disponible.',
  'Reporta publicaciones sospechosas.',
];

function InfoMarketplace() {
  return (
    <>
      <RpCard
        title='Acerca del Marketplace'
        icon='ti-info-circle'
      >
        <p className='text-[12px] leading-relaxed text-neutral-400'>
          Compra y vende entre estudiantes: libros, tecnología, muebles y más.
          Pregunta en la publicación y coordina la entrega con el vendedor.
        </p>
      </RpCard>
      <RpCard
        title='Compra y vende seguro'
        icon='ti-shield-check'
        iconColor='text-emerald-400'
      >
        <RpRules items={consejos} />
      </RpCard>
    </>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [vista, setVista] = useState('explorar');
  const [verInfo, setVerInfo] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  const cambiar = (campo, valor) =>
    setFiltros((f) => ({ ...f, [campo]: valor }));
  const limpiar = () => setFiltros(FILTROS_INICIALES);

  function cambiarVista(nueva) {
    setVista(nueva);
    setFiltros({
      ...FILTROS_INICIALES,
      estado: nueva === 'mios' ? '' : FILTROS_INICIALES.estado,
    });
  }

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <PageBanner
          icon='ti-shopping-bag'
          iconColor='text-amber-400'
          iconBg='bg-amber-400/10 border-amber-400/30'
          gradient='linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(244,114,182,0.05) 100%)'
          title='Marketplace'
          subtitle='Compra y vende entre estudiantes'
          searchPlaceholder='Buscar productos...'
          searchValue={filtros.busqueda}
          onSearchChange={(v) => {
            if (vista === 'guardados') setVista('explorar');
            cambiar('busqueda', v);
          }}
          breadcrumb={[{ label: 'Inicio', to: '/' }, { label: 'Marketplace' }]}
        />

        <div className='flex-1 overflow-y-auto'>
          <div className='overflow-x-auto [&>div]:min-w-max [&_button]:whitespace-nowrap'>
            <Pestanas
              pestanas={VISTAS}
              activa={vista}
              onCambiar={cambiarVista}
              acento='border-amber-400'
            />
          </div>

          {vista === 'guardados' ? (
            <MarketplaceGuardados />
          ) : (
            <div className='mx-auto w-full max-w-[1100px] p-3 sm:p-4'>
              <div className='mb-3 flex flex-wrap items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setVerInfo((v) => !v)}
                  aria-expanded={verInfo}
                  className='flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-[#1E1E24] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 hover:border-white/[0.2] lg:hidden'
                >
                  <i className='ti ti-info-circle' /> Info y consejos
                </button>
                <Button
                  variant='primary'
                  icon='ti-plus'
                  onClick={() => navigate(rutas.nuevo)}
                >
                  Publicar producto
                </Button>
              </div>
              {verInfo && (
                <div className='mb-3 flex flex-col gap-3 lg:hidden'>
                  <InfoMarketplace />
                </div>
              )}

              <FiltrosProductos
                filtros={filtros}
                onCambiar={cambiar}
                onLimpiar={
                  vista === 'mios'
                    ? () => setFiltros({ ...FILTROS_INICIALES, estado: '' })
                    : limpiar
                }
              />
              <MarketplaceFeed
                key={vista}
                filtros={filtros}
                soloMios={vista === 'mios'}
              />
            </div>
          )}
        </div>
      </div>

      <RightPanel>
        <InfoMarketplace />
      </RightPanel>
    </div>
  );
}