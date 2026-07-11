import Modal, { ModalHeader } from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      maxWidth='400px'
    >
      <ModalHeader onClose={onCancel}>
        <span className='text-[15px] font-semibold text-neutral-100'>
          {title}
        </span>
      </ModalHeader>
      <div className='flex flex-col gap-4 p-5'>
        <p className='text-[13px] text-neutral-400'>{message}</p>
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
