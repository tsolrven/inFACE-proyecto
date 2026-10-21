export default function InfoTooltip({ texto }) {
  return (
    <span
      title={texto}
      tabIndex={0}
      className='flex h-[15px] w-[15px] flex-shrink-0 cursor-help items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-neutral-300'
    >
      <i className='ti ti-info-circle text-[13px]' />
    </span>
  );
}
