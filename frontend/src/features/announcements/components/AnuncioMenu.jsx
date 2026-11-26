import { useState } from 'react';
import { useAuthStore } from '@/shared/auth/authStore';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';
import EditarAnuncioModal from '@/features/announcements/components/EditarAnuncioModal';
import { useEliminarAnuncio } from '@/features/announcements/hooks/useAnuncios';
import {
  puedeEditarAnuncio,
  puedeEliminarAnuncio,
  puedeFijarAnuncio,
} from '@/features/announcements/utils/permisos';
import { useFijarAnuncio } from '@/features/announcements/hooks/useAnuncios';
import { mostrarToast } from '@/shared/stores/toastStore';

/**
 * Menú ⋯ de un anuncio: guardar, editar, eliminar y reportar.
 * "Editar" lo decide puedeEditarAnuncio (solo el autor que conserva el permiso
 * de publicar). "Eliminar" lo decide puedeEliminarAnuncio (además, el superadmin).
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
  const fijarMut = useFijarAnuncio();
  const fijado = !!anuncio.fijado_en;

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);
  const [editando, setEditando] = useState(false);
  const puedeEliminar = puedeEliminarAnuncio(usuario, anuncio);
  const puedeEditar = puedeEditarAnuncio(usuario, anuncio);

  const itemsBase = usePostMenuItems({
    autorId: anuncio.autor?.id,
    guardado: anuncio.esta_guardado,
    onGuardar: () =>
      guardarMut.mutate({ id: anuncio.id, guardar: !anuncio.esta_guardado }),
    onEditar: () => setEditando(true),
    onEliminar: () => setConfirmandoEliminar(true),
    onReportar: () => setReportando(true),
    permitirEditar: puedeEditar,
    permitirEliminar: puedeEliminar,
    iconSize: 14,
  });


  // fijar/desfijar va primero: es la acción propia del tablón
  const items = [
    {
      key: 'fijar',
      label: fijado ? 'Quitar de destacado' : 'Fijar como destacado',
      icon: (
        <i
          className={`ti ${fijado ? 'ti-pinned-off' : 'ti-pin'}`}
          style={{ fontSize: 14 }}
        />
      ),
      onClick: () =>
        fijarMut.mutate(
          { id: anuncio.id, fijado: !fijado },
          {
            onSuccess: () =>
              mostrarToast(
                fijado ? 'Anuncio quitado de destacado' : 'Anuncio destacado',
              ),
            onError: (err) =>
              mostrarToast(err.message || 'No se pudo cambiar el destacado'),
          },
        ),
      hidden: !puedeFijarAnuncio(usuario, anuncio),
    },
    ...itemsBase,
  ];
  
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

      {editando && (
        <EditarAnuncioModal
          anuncioId={anuncio.id}
          onClose={() => setEditando(false)}
          onGuardado={() => setEditando(false)}
        />
      )}
    </div>
  );
}
