export default function CharCounter({ value, max }) {
  const largo = value.length;
  const color =
    largo >= max
      ? 'text-red-400'
      : largo >= max * 0.9
        ? 'text-amber-400'
        : 'text-neutral-600';
  return (
    <span className={`text-[10.5px] tabular-nums ${color}`}>
      {largo}/{max}
    </span>
  );
}
