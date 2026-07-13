export default function ModalShell({ title, subtitle, onClose, children, maxWidth = 'max-w-[500px]' }) {
    return (
        <div
            className='fixed inset-0 z-[400] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm'
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidth} rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_20px_60px_rgba(0,0,0,0.55)]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4'>
                    <div>
                        <h2 className='text-[15px] font-bold text-neutral-100'>{title}</h2>
                        {subtitle && <p className='mt-0.5 text-[12px] text-neutral-500'>{subtitle}</p>}
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-100'
                    >
                        <i className='ti ti-x text-base' />
                    </button>
                </div>
                <div className='px-5 py-4'>{children}</div>
            </div>
        </div>
    );
}