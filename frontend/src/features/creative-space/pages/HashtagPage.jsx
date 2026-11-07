import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageBanner from '@/shared/components/layout/PageBanner';
import BotonVolver from '@/features/creative-space/components/BotonVolver';
import CreativeFeed from '@/features/creative-space/components/CreativeFeed';
import { useCreativeFiltrosStore } from '@/features/creative-space/store/creativeFiltrosStore';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function HashtagPage() {
  const { nombre } = useParams();
  const resetFiltros = useCreativeFiltrosStore((s) => s.resetFiltros);
  const setFiltro = useCreativeFiltrosStore((s) => s.setFiltro);
  const busqueda = useCreativeFiltrosStore((s) => s.filtros.busqueda);

  useEffect(() => {
    resetFiltros();
  }, [nombre, resetFiltros]);

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <PageBanner
        icon='ti-hash'
        iconColor='text-blue-400'
        iconBg='bg-blue-400/10 border-blue-400/30'
        gradient='linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(167,139,250,0.04) 100%)'
        title={`#${nombre}`}
        subtitle='Obras del espacio creativo con este hashtag'
        searchPlaceholder='Buscar en el espacio creativo...'
        searchValue={busqueda}
        onSearchChange={(v) => setFiltro('busqueda', v)}
        breadcrumb={[
          { label: 'Inicio', to: '/' },
          { label: 'Espacio creativo', to: rutas.inicio },
          { label: `#${nombre}` },
        ]}
      />
      <div className='flex-shrink-0 border-b border-white/[0.05] px-3 py-1.5'>
        <BotonVolver texto='Volver' />
      </div>
      <CreativeFeed
        key={nombre}
        hashtagFijo={nombre}
        textoCrear='Compartir mi arte'
        crearTipos={[]}
      />
    </div>
  );
}