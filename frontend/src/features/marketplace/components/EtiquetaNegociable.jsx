export default function EtiquetaNegociable({ className = '' }) {
  return (
    <span
      title='El vendedor acepta ofertas'
      className={`inline-flex items-center gap-1 rounded-md border border-blue-400/50 bg-blue-400/10 px-1.5 py-0.5 text-[10.5px] font-bold leading-none text-blue-300 ${className}`}
    >
      <i className='ti ti-discount-2 text-[11px]' />
      Negociable
    </span>
  );
}
