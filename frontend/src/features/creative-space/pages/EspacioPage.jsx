import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PageBanner from '@/shared/components/layout/PageBanner';
import BotonVolver from '@/features/creative-space/components/BotonVolver';
import CreativeFeed from '@/features/creative-space/components/CreativeFeed';
import { useCreativeFiltrosStore } from '@/features/creative-space/store/creativeFiltrosStore';
import {
  ESPACIO_POR_ID,
  rutas,
} from '@/features/creative-space/utils/espacios';

export default function EspacioPage() {
  const { espacio: id } = useParams();
  const espacio = ESPACIO_POR_ID[id];
  const resetFiltros = useCreativeFiltrosStore((s) => s.resetFiltros);
  const setFiltro = useCreativeFiltrosStore((s) => s.setFiltro);
  const busqueda = useCreativeFiltrosStore((s) => s.filtros.busqueda);

  useEffect(() => {
    resetFiltros();
  }, [id, resetFiltros]);

  if (!espacio)
    return (
      <Navigate
        to={rutas.inicio}
        replace
      />
    );

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <PageBanner
        icon={espacio.icono}
        iconColor=''
        iconBg=''
        gradient={`linear-gradient(135deg, ${espacio.color}14 0%, rgba(167,139,250,0.04) 100%)`}
        title={espacio.label}
        subtitle={espacio.descripcion}
        searchPlaceholder={`Buscar en ${espacio.label}...`}
        searchValue={busqueda}
        onSearchChange={(v) => setFiltro('busqueda', v)}
        breadcrumb={[
          { label: 'Inicio', to: '/' },
          { label: 'Espacio creativo', to: rutas.inicio },
          { label: espacio.label },
        ]}
      />
      <div className='flex-shrink-0 border-b border-white/[0.05] px-3 py-1.5'>
        <BotonVolver texto='Volver al inicio del espacio creativo' />
      </div>
      <CreativeFeed
        key={espacio.id}
        textoCrear={espacio.botonCrear}
        tipos={espacio.tipos}
        tiposFiltro={espacio.tipos}
        crearTipos={espacio.crear}
        espacioId={espacio.id}
        album={espacio.id === 'artes-visuales'}
        portadas={espacio.id === 'escritura'}
        musica={espacio.id === 'musica'}
      />
    </div>
  );
}