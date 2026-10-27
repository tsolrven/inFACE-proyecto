import { useState } from 'react';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useEliminarHilo } from '@/features/forum/hooks/useHilos';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';

/**
 * Menú ⋯ de un hilo: guardar, editar, eliminar y reportar.
 * Si no se pasa onEditar, la opción "Editar" no aparece (se activa en F3).
 */
export default function HiloMenu({
  hilo,
  className,
  triggerClassName,
  onEditar,
  onEliminado,
}) {
  const guardarMut = useGuardar('hilo');
  const eliminarMut = useEliminarHilo();

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);

  const items = usePostMenuItems({
    autorId: hilo.autor?.id,
    guardado: hilo.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: hilo.id, guardar: !hilo.esta_guardado }),
    onEditar,
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    iconSize: 14,
  }).map((item) =>
    item.key === 'editar' && !onEditar ? { ...item, hidden: true } : item,
  );

  async function handleEliminar() {
    setErrorEliminar(null);
    try {
      await eliminarMut.mutateAsync(hilo.id);
      setConfirmandoEliminar(false);
      onEliminado?.();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el hilo.');
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <PostActionsMenu
        items={items}
        label='Más acciones del hilo'
        triggerClassName={triggerClassName}
      />

      {confirmandoEliminar && (
        <ConfirmDialog
          open
          title='Eliminar hilo'
          message={
            errorEliminar ||
            'Esta acción no se puede deshacer. Se eliminarán también sus imágenes, comentarios y votos.'
          }
          confirmLabel='Eliminar'
          danger
          loading={eliminarMut.isPending}
          onConfirm={handleEliminar}
          onCancel={() => {
            setConfirmandoEliminar(false);
            setErrorEliminar(null);
          }}
        />
      )}

      {reportando && (
        <ReportModal
          open
          onClose={() => setReportando(false)}
          tipoContenido='hilo'
          contenidoId={hilo.id}
        />
      )}
    </div>
  );
}
