// Botón "Destacados (n)" que pliega o despliega la fila de destacados. Va a
// la izquierda de la barra del feed (en la vista limpia no hay píldoras de
// filtros, así que nunca coinciden).
export default function BotonDestacados({ total, abierto, onAlternar, idFila }) {
  return (
    <button
      type='button'
      onClick={onAlternar}
      aria-expanded={abierto}
      aria-controls={idFila}
      className='flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] font-bold text-neutral-200 transition-colors hover:bg-white/[0.05]'
    >
      <i className='ti ti-pin text-[14px] text-amber-400' />
      Destacados
      <span className='text-neutral-500'>({total})</span>
      <i
        className={`ti ti-chevron-down text-[13px] text-neutral-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
      />
    </button>
  );
}