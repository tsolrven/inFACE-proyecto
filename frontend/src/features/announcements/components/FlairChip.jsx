import { clasesFlair } from '@/features/announcements/utils/flairColors';

export default function FlairChip({ flair }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${clasesFlair(flair.color)}`}
    >
      {flair.nombre}
    </span>
  );
}
