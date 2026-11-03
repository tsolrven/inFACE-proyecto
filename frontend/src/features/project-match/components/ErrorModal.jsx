import { createPortal } from 'react-dom';
import useModalBehavior from '@/shared/hooks/useModalBehavior';

export default function ErrorModal({ errores, titulo, onClose }) {
    const lista = (Array.isArray(errores) ? errores : [errores]).filter(Boolean);
    const abierto = lista.length > 0;

    useModalBehavior(abierto, onClose);

    if (!abierto) return null;

    const varios = lista.length > 1;

    return createPortal(
        <div
            className='fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]'
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role='alertdialog'
                aria-modal='true'
                className='w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            >
                <div className='h-1 bg-gradient-to-r from-red-500 to-pink-500' />
                <div className='p-5'>
                    <div className='mb-3 flex items-center gap-3'>
                        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400'>
                            <i className='ti ti-alert-triangle text-[20px]' />
                        </div>
                        <h3 className='text-[14.5px] font-bold text-neutral-100'>
                            {titulo || (varios ? 'Revisa lo siguiente' : 'Ocurrió un error')}
                        </h3>
                    </div>

                    {varios ? (
                        <ul className='mb-5 flex max-h-[50vh] flex-col gap-2 overflow-y-auto'>
                            {lista.map((texto, i) => (
                                <li
                                    key={i}
                                    className='flex items-start gap-2 text-[13px] leading-relaxed text-neutral-300'
                                >
                                    <i className='ti ti-point-filled mt-[3px] flex-shrink-0 text-[14px] text-red-400' />
                                    <span>{texto}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className='mb-5 text-[13px] leading-relaxed text-neutral-300'>
                            {lista[0]}
                        </p>
                    )}

                    <div className='flex justify-end'>
                        <button
                            type='button'
                            autoFocus
                            onClick={onClose}
                            className='rounded-[10px] bg-pink-500 px-5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}