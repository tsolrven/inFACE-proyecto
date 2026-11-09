import { useNavigate } from 'react-router-dom';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function BotonVolver({
  fallback = rutas.inicio,
  texto = 'Volver',
  className = '',
}) {
  const navigate = useNavigate();
  function volver() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }
  return (
    <button
      type='button'
      onClick={volver}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100 ${className}`}
    >
      <i className='ti ti-arrow-left text-sm' /> {texto}
    </button>
  );
}
