import { useState } from 'react';
import { useAuthStore } from '@/shared/auth/authStore';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useEliminarApunte } from '@/features/materials/hooks/useApuntes';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import EditApunteModal from '@/features/materials/components/EditApunteModal';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';

/**
 * Menú ⋯ de un material con todo lo que dispara: guardar, editar, eliminar y
 * reportar (los diálogos solo existen mientras están abiertos).
 * onEliminado: se llama tras eliminar (el detalle lo usa para cerrarse).
 */
export default function ApunteMenu({
  apunte,
  className,
  triggerClassName,
  onEliminado,
}) {
  const usuario = useAuthStore((s) => s.usuario);
  const guardarMut = useGuardar('apunte');
  const eliminarMut = useEliminarApunte();

  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);

  const items = usePostMenuItems({
    autorId: apunte.autor?.id,
    guardado: apunte.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: apunte.id, guardar: !apunte.esta_guardado }),
    onEditar: () => setEditando(true),
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    iconSize: 14,
  });

  async function handleEliminar() {
    setErrorEliminar(null);
    try {
      await eliminarMut.mutateAsync(apunte.id);
      setConfirmandoEliminar(false);
      onEliminado?.();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el material.');
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <PostActionsMenu
        items={items}
        label='Más acciones del material'
        triggerClassName={triggerClassName}
      />

      {editando && (
        <EditApunteModal
          open
          onClose={() => setEditando(false)}
          apunte={apunte}
          carreraId={usuario?.carrera_id}
        />
      )}

      {confirmandoEliminar && (
        <ConfirmDialog
          open
          title='Eliminar material'
          message={
            errorEliminar ||
            'Esta acción no se puede deshacer. Se eliminarán también sus archivos, comentarios y votos.'
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
          tipoContenido='apunte'
          contenidoId={apunte.id}
        />
      )}
    </div>
  );
}
