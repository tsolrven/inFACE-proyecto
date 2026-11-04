import { useState } from 'react';
import { useAuthStore } from '@/shared/auth/authStore';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';
import { useEliminarAnuncio } from '@/features/announcements/hooks/useAnuncios';
import { puedeAdministrarAnuncio } from '@/features/announcements/utils/permisos';

/**
 * Menú ⋯ de un anuncio: guardar, eliminar y reportar.
 * "Eliminar" lo decide puedeAdministrarAnuncio (superadmin, o autor que
 * conserva el permiso de publicar). "Editar" se agrega en M3-7.
 */
export default function AnuncioMenu({
  anuncio,
  className,
  triggerClassName,
  onEliminado,
}) {
  const usuario = useAuthStore((s) => s.usuario);
  const guardarMut = useGuardar('anuncio');
  const eliminarMut = useEliminarAnuncio();

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);

  const puedeAdministrar = puedeAdministrarAnuncio(usuario, anuncio);

  const items = usePostMenuItems({
    autorId: anuncio.autor?.id,
    guardado: anuncio.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: anuncio.id, guardar: !anuncio.esta_guardado }),
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    permitirEditar: false,
    permitirEliminar: puedeAdministrar,
    iconSize: 14,
  });

  async function handleEliminar() {
    setErrorEliminar(null);
    try {
      await eliminarMut.mutateAsync(anuncio.id);
      setConfirmandoEliminar(false);
      onEliminado?.();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el anuncio.');
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <PostActionsMenu
        items={items}
        label='Más acciones del anuncio'
        triggerClassName={triggerClassName}
      />

      {confirmandoEliminar && (
        <ConfirmDialog
          open
          title='Eliminar anuncio'
          message={
            errorEliminar ||
            'Esta acción no se puede deshacer. Se eliminarán también sus archivos, comentarios, votos y guardados.'
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
          tipoContenido='anuncio'
          contenidoId={anuncio.id}
        />
      )}
    </div>
  );
}
