export default function IconoPlay({ pausa = false, className = '' }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      className={`inline-block ${className}`}
      aria-hidden='true'
    >
      {pausa ? (
        <path d='M7 4h3.5v16H7zM13.5 4H17v16h-3.5z' />
      ) : (
        <path d='M8 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L9.5 3.64A1 1 0 0 0 8 4.5z' />
      )}
    </svg>
  );
}
