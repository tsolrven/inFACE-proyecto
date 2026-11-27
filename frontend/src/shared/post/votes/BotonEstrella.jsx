import { useAuthStore } from '@/shared/auth/authStore';
import { puedeEscribir } from '@/shared/auth/roles';

// estrella en SVG: el webfont de Tabler no dibuja ti-star-filled
function Estrella({ rellena }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-[15px] w-[15px]'
      fill={rellena ? 'currentColor' : 'none'}
      stroke='currentColor'
      strokeWidth={rellena ? '0' : '2'}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z' />
    </svg>
  );
}

// "Útil" = el voto positivo (el backend no acepta negativos en materiales).
// Volver a pulsarla quita la estrella (el voto se alterna).
//   miVoto:  'up' | null
//   total:   votos_neto
//   onVotar: (e) => ...
export default function BotonEstrella({ miVoto, total, onVotar }) {
  // cualquier usuario con sesión vota, superadmin incluido (puedeEscribir)
  const puedeVotar = useAuthStore((s) => puedeEscribir(s.usuario));
  const marcada = miVoto === 'up';

  return (
    <button
      type='button'
      disabled={!puedeVotar}
      aria-pressed={marcada}
      aria-label={`Útil: ${total ?? 0}`}
      title={
        !puedeVotar
          ? 'Inicia sesión para votar'
          : marcada
            ? 'Quitar estrella'
            : 'Marcar como útil'
      }
      onClick={onVotar}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${marcada
        ? 'bg-blue-400/15 text-blue-400'
        : 'bg-white/[0.06] text-neutral-400 enabled:hover:text-blue-300'
        }`}
    >
      <Estrella rellena={marcada} />
      {total ?? 0}
    </button>
  );
}