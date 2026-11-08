import { ESTADO_POR_ID } from '@/features/marketplace/utils/catalogo';

export default function EstadoInsignia({ estado, className = '' }) {
  const e = ESTADO_POR_ID[estado];
  if (!e) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${e.clases} ${className}`}
    >
      <i className={`ti ${e.icono} text-[11px]`} /> {e.label}
    </span>
  );
}
