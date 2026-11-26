import { useAuthStore } from '@/shared/auth/authStore';
import { puedeEscribir } from '@/shared/auth/roles';
import { useVotar } from '@/shared/post/votes/useVotar';

// "Enterado" = el voto positivo del anuncio (el backend no acepta negativos).
// Volver a pulsarlo quita la confirmación (el voto se alterna).
export default function BotonEnterado({ anuncio }) {
  const votarMut = useVotar('anuncio');
  // el superadmin no vota (VotePill sigue la misma regla)
  const puedeConfirmar = useAuthStore((s) => puedeEscribir(s.usuario));
  const enterado = anuncio.mi_voto === 'up';
  const total = anuncio.votos_neto ?? 0;

  return (
    <button
      type='button'
      disabled={!puedeConfirmar}
      aria-pressed={enterado}
      title={enterado ? 'Quitar confirmación' : 'Confirma que leíste este anuncio'}
      onClick={(e) => {
        e.stopPropagation();
        votarMut.mutate({ id: anuncio.id, tipo: 'up' });
      }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${enterado
          ? 'bg-amber-400 text-neutral-900'
          : 'bg-white/[0.06] text-neutral-400 enabled:hover:bg-amber-400/15 enabled:hover:text-amber-300'
        }`}
    >
      <i
        className='ti ti-thumb-up text-[14px]'
      />
      Enterado{total > 0 ? ` · ${total}` : ''}
    </button>
  );
}