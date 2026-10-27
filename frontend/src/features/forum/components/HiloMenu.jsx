import { useState } from 'react';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useEliminarHilo } from '@/features/forum/hooks/useHilos';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';
import EditarHiloModal from '@/features/forum/components/EditarHiloModal';

/**
 * Menú ⋯ de un hilo: guardar, editar, eliminar y reportar.
 * "Editar" solo aparece para el autor (lo decide usePostMenuItems).
 */
export default function HiloMenu({
  hilo,
  className,
  triggerClassName,
  onEliminado,
}) {
  const guardarMut = useGuardar('hilo');
  const eliminarMut = useEliminarHilo();

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);
  const [editando, setEditando] = useState(false);

  const items = usePostMenuItems({
    autorId: hilo.autor?.id,
    guardado: hilo.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: hilo.id, guardar: !hilo.esta_guardado }),
    onEditar: () => setEditando(true),
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    iconSize: 14,
  });

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

      {editando && (
        <EditarHiloModal
          hiloId={hilo.id}
          onClose={() => setEditando(false)}
          onGuardado={() => setEditando(false)}
        />
      )}
    </div>
  );
}
