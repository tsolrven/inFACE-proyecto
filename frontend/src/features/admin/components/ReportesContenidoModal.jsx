import { useLocation, useNavigate } from 'react-router-dom';
import Modal, { ModalHeader, ModalBody } from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import PanelCierre from '@/features/admin/components/PanelCierre';
import ReporteItem from '@/features/admin/components/ReporteItem';
import AutorPanel from '@/features/admin/components/AutorPanel';
import { useReportesDeContenido } from '@/features/admin/hooks/useModeracion';
import {
  ETIQUETA_TIPO,
  ICONO_POR_TIPO,
  rutaDeContenido,
} from '@/shared/moderation/reportUi';

export default function ReportesContenidoModal({ tipo, id, onClose }) {
  const navigate = useNavigate();
  // dentro de la página, esta es la ubicación de /reportes (la de fondo)
  const location = useLocation();
  const { data, isPending, isError, error, refetch } = useReportesDeContenido(
    tipo,
    id,
  );

  const contenido = data?.contenido;
  const pendientes =
    data?.reportes.filter((r) => r.estado === 'pendiente') ?? [];

  // un comentario se abre en la publicación a la que pertenece
  const destino =
    tipo === 'comentario'
      ? contenido?.padre
      : contenido?.existe
        ? { tipo, id }
        : null;
  const ruta = destino ? rutaDeContenido(destino.tipo, destino.id) : null;

  function verContenido() {
    // el modal de detalle se abre encima de /reportes y este modal queda debajo
    navigate(ruta, { state: { backgroundLocation: location } });
  }

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth='680px'
    >
      <ModalHeader
        title={`Reportes · ${ETIQUETA_TIPO[tipo] ?? tipo}`}
        onClose={onClose}
      />
      <ModalBody className='flex flex-col gap-5'>
        {isPending && (
          <div className='flex items-center justify-center py-12'>
            <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
          </div>
        )}

        {isError && !data && (
          <div className='flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
            <span>{error?.message || 'No se pudo cargar el detalle.'}</span>
            <button
              type='button'
              onClick={() => refetch()}
              className='flex-shrink-0 font-semibold underline-offset-2 hover:underline'
            >
              Reintentar
            </button>
          </div>
        )}

        {data && (
          <>
            <section className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'>
              <div className='mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
                <i className={`ti ${ICONO_POR_TIPO[tipo] ?? 'ti-flag'}`} />
                {ETIQUETA_TIPO[tipo] ?? tipo}
                {!contenido.existe && (
                  <span className='rounded-full bg-neutral-500/10 px-2 py-0.5 text-[10.5px] normal-case tracking-normal'>
                    Contenido eliminado
                  </span>
                )}
              </div>
              <p className='whitespace-pre-line text-[13px] leading-relaxed text-neutral-100'>
                {contenido.titulo || (
                  <span className='italic text-neutral-600'>
                    Sin vista previa disponible
                  </span>
                )}
              </p>
              {ruta && (
                <div className='mt-2.5 flex justify-end'>
                  <Button
                    size='sm'
                    icon='ti-external-link'
                    onClick={verContenido}
                  >
                    {tipo === 'comentario'
                      ? 'Ver en su publicación'
                      : 'Ver contenido'}
                  </Button>
                </div>
              )}
            </section>

            <AutorPanel
              autor={contenido.autor}
              referencia={{ tipo, id }}
            />

            <section>
              <h3 className='mb-2.5 text-[13px] font-bold text-neutral-100'>
                Reportes ({data.reportes.length})
              </h3>
              <div className='flex flex-col gap-2.5'>
                {data.reportes.map((reporte) => (
                  <ReporteItem
                    key={reporte.id}
                    reporte={reporte}
                  />
                ))}
              </div>
            </section>

            {pendientes.length > 0 && (
              <PanelCierre
                tipo={tipo}
                id={id}
                titulo={contenido.titulo}
                existe={contenido.existe}
                pendientes={pendientes.length}
                onCerrado={onClose}
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
}