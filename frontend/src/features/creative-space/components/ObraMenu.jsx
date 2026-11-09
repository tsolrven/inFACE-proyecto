import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useEliminarObra } from '@/features/creative-space/hooks/useObras';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function ObraMenu({
  obra,
  className,
  triggerClassName,
  onEliminado,
}) {
  const guardarMut = useGuardar('obra');
  const eliminarMut = useEliminarObra();

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);
  const navigate = useNavigate();

  const items = usePostMenuItems({
    autorId: obra.autor?.id,
    guardado: obra.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: obra.id, guardar: !obra.esta_guardado }),
    onEditar: () => navigate(rutas.editar(obra.id)),
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    iconSize: 14,
  });

  async function handleEliminar() {
    setErrorEliminar(null);
    try {
      await eliminarMut.mutateAsync(obra.id);
      setConfirmandoEliminar(false);
      onEliminado?.();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar la obra.');
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <PostActionsMenu
        items={items}
        label='Más acciones de la obra'
        triggerClassName={triggerClassName}
      />

      {confirmandoEliminar && (
        <ConfirmDialog
          open
          title='Eliminar obra'
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
          tipoContenido='obra'
          contenidoId={obra.id}
        />
      )}
    </div>
  );
}
