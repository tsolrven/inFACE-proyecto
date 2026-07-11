//! BOTÓN GENÉRICO, SE USA EN CUALQUIER MÓDULO

const VARIANTS = {
  primary:
    'bg-pink-500 text-white hover:bg-[#D43E56] border border-pink-500',
  secondary:
    'bg-transparent text-neutral-300 border border-white/[0.07] hover:border-white/[0.18] hover:text-neutral-100',
  ghost:
    'bg-transparent text-neutral-500 border border-transparent hover:text-neutral-100 hover:bg-white/[0.04]',
  danger:
    'bg-transparent text-red-500 border border-transparent hover:bg-red-500/[0.08]',
};

const SIZES = {
  sm: 'h-[30px] px-2.5 text-[12px] gap-1.5',
  md: 'h-[34px] px-3.5 text-[12.5px] gap-1.5',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type='button'
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-[10px] font-medium font-inherit transition-all disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <i className='ti ti-loader-2 animate-spin text-base' />
      ) : (
        icon && <i className={`ti ${icon} text-base`} />
      )}
      {children}
    </button>
  );
}
