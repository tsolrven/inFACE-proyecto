import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pestanas from '@/shared/components/ui/Pestanas';
import FilaReporteUsuario from '@/features/admin/components/FilaReporteUsuario';
import ReportesContenidoModal from '@/features/admin/components/ReportesContenidoModal';
import { useReportesDeUsuario } from '@/features/admin/hooks/useUsuarios';
import { mensajeDeError } from '@/shared/lib/errores';

const PESTANAS = [
  { id: 'recibidos', label: 'Recibidos', icono: 'ti-inbox' },
  { id: 'realizados', label: 'Realizados', icono: 'ti-send' },
  { id: 'eliminados', label: 'Eliminados', icono: 'ti-trash' },
];

const TEXTOS = {
  recibidos: {
    descripcion:
      'Contenidos de este usuario que fueron reportados, agrupados por contenido.',
    vacio: 'Este usuario no ha recibido reportes.',
  },
  realizados: {
    descripcion: 'Reportes que hizo este usuario.',
    vacio: 'Este usuario no ha hecho reportes.',
  },
  eliminados: {
    descripcion:
      'Solo incluye contenidos eliminados por moderación que tuvieron reportes.',
    vacio: 'No hay contenidos eliminados por moderación con reportes.',
  },
};

function claveDe(item, lista) {
  return lista === 'realizados'
    ? item.id
    : `${item.tipo_contenido}:${item.contenido_id}`;
}

export default function ReportesUsuarioLista({ usuarioId }) {
  const qc = useQueryClient();
  const [lista, setLista] = useState('recibidos');
  const [abierto, setAbierto] = useState(null);
  const { data, isPending, isError, error, refetch } = useReportesDeUsuario(
    usuarioId,
    lista,
  );

  function cerrarDetalle() {
    setAbierto(null);
    // el modal permite cerrar reportes o eliminar contenido: los contadores y
    // las listas de la ficha deben reflejarlo
    qc.invalidateQueries({ queryKey: ['usuario'] });
  }

  return (
    <section className='mb-6'>
      <h2 className='mb-1 text-[13px] font-semibold text-neutral-300'>
        Detalle de reportes
      </h2>

      <Pestanas
        pestanas={PESTANAS}
        activa={lista}
        onCambiar={setLista}
      />
      <p className='mb-3 mt-2.5 text-[11.5px] text-neutral-500'>
        {TEXTOS[lista].descripcion}
      </p>

      {isPending && (
        <div className='flex items-center justify-center py-10 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {isError && (
        <div className='flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>
            {mensajeDeError(error, 'No se pudieron cargar los reportes.')}
          </span>
          <button
            type='button'
            onClick={() => refetch()}
            className='flex-shrink-0 font-semibold underline-offset-2 hover:underline'
          >
            Reintentar
          </button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className='rounded-xl border border-white/[0.06] bg-[#111114] px-4 py-8 text-center text-[12.5px] text-neutral-500'>
          {TEXTOS[lista].vacio}
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className='flex flex-col gap-2.5'>
          {data.items.map((item) => (
            <FilaReporteUsuario
              key={claveDe(item, lista)}
              item={item}
              lista={lista}
              onAbrir={() =>
                setAbierto({
                  tipo: item.tipo_contenido,
                  id: item.contenido_id,
                })
              }
            />
          ))}
          {data.hay_mas && (
            <p className='text-center text-[11.5px] text-neutral-500'>
              Mostrando los últimos {data.limite}. Hay más registros que no se
              listan.
            </p>
          )}
        </div>
      )}

      {abierto && (
        <ReportesContenidoModal
          tipo={abierto.tipo}
          id={abierto.id}
          onClose={cerrarDetalle}
        />
      )}
    </section>
  );
}