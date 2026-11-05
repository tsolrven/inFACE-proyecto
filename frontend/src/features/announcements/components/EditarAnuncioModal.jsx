import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import AnuncioFormModal from '@/features/announcements/components/AnuncioFormModal';
import { useAnuncio } from '@/features/announcements/hooks/useAnuncios';

// Carga el anuncio COMPLETO y recién entonces muestra el formulario. En la lista
// el contenido viene recortado (contenido_truncado): editar sobre ese dato y
// guardar borraría el resto del texto.
export default function EditarAnuncioModal({ anuncioId, onClose, onGuardado }) {
  const { data: anuncio, isPlaceholderData, error } = useAnuncio(anuncioId);

  if (anuncio && !isPlaceholderData) {
    return (
      <AnuncioFormModal
        anuncio={anuncio}
        onClose={onClose}
        onGuardado={onGuardado}
      />
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth='680px'
    >
      <ModalHeader onClose={onClose}>
        <span className='text-[15px] font-semibold text-neutral-100'>
          Editar anuncio
        </span>
      </ModalHeader>
      {error ? (
        <div className='p-8 text-center text-sm text-red-400'>
          {error.message}
        </div>
      ) : (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}
    </Modal>
  );
}
