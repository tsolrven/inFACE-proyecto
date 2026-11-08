import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { useEliminarProducto } from '@/features/marketplace/hooks/useProductos';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';
import { rutas } from '@/features/marketplace/utils/catalogo';

export default function ProductoMenu({
  producto,
  className,
  triggerClassName,
  onEliminado,
}) {
  const guardarMut = useGuardar('producto');
  const eliminarMut = useEliminarProducto();

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);
  const navigate = useNavigate();

  const items = usePostMenuItems({
    autorId: producto.vendedor?.id,
    guardado: producto.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: producto.id, guardar: !producto.esta_guardado }),
    onEditar: () => navigate(rutas.editar(producto.id)),
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    iconSize: 14,
  });

  async function handleEliminar() {
    setErrorEliminar(null);
    try {
      await eliminarMut.mutateAsync(producto.id);
      setConfirmandoEliminar(false);
      onEliminado?.();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el producto.');
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <PostActionsMenu
        items={items}
        label='Más acciones del producto'
        triggerClassName={triggerClassName}
      />

      {confirmandoEliminar && (
        <ConfirmDialog
          open
          title='Eliminar producto'
          message={
            errorEliminar ||
            'Esta acción no se puede deshacer. Se eliminarán también sus fotos y preguntas.'
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
          tipoContenido='producto'
          contenidoId={producto.id}
        />
      )}
    </div>
  );
}
