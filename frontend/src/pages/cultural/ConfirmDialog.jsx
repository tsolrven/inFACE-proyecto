import { createPortal } from 'react-dom';

// overlay de confirmación reutilizable, para reemplazar los confirm()/alert() nativos del navegador
export default function ConfirmDialog({
    open,
    title = '¿Estás seguro?',
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
    soloConfirmar = false, // true = modo "aviso": solo un botón, para reemplazar alert()
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    return createPortal(
        <div
            className='fixed inset-0 z-[400] flex items-center justify-center bg-black/60 px-4'
            onClick={soloConfirmar ? onConfirm : onCancel}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className='w-full max-w-[380px] rounded-2xl border border-white/10 bg-[#1E1E24] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            >
                <div className='mb-3 flex items-center gap-2.5'>
                    <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${danger ? 'bg-red-500/10 text-red-400' : 'bg-pink-500/10 text-pink-400'
                            }`}
                    >
                        <i className={`ti ${danger ? 'ti-alert-triangle' : 'ti-help-circle'} text-[18px]`} />
                    </div>
                    <h3 className='text-[14.5px] font-bold text-neutral-100'>{title}</h3>
                </div>

                <p className='mb-5 whitespace-pre-line text-[13px] leading-relaxed text-neutral-400'>{message}</p>

                <div className='flex justify-end gap-2'>
                    {!soloConfirmar && (
                        <button
                            onClick={onCancel}
                            className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`rounded-[10px] px-4 py-2 text-[12.5px] font-semibold text-white transition ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
