import { BADGES_SELECCIONABLES } from '../../utils/fileMeta';

// selector tipo "chips" para que el usuario marque manualmente uno o varios
// badges que representan el contenido del apunte. Es una decisión del
// usuario, no se infiere del archivo real: solo controla el badge principal
// que se muestra arriba del post (MaterialCard / MaterialDetailModal), no
// afecta el ícono de cada archivo individual en la lista de adjuntos.
export default function BadgeSelector({ value = [], onChange, disabled }) {
  function toggle(badgeValue) {
    if (disabled) return;
    const yaEsta = value.includes(badgeValue);
    onChange(
      yaEsta
        ? value.filter((v) => v !== badgeValue)
        : [...value, badgeValue],
    );
  }

  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-1.5'>
        <span className='text-[11.5px] font-semibold text-neutral-500'>
          Badges del material (opcional)
        </span>
        <InfoTooltip texto='Marca los logos que mejor representan este material. Se muestran arriba del post; no reemplazan el ícono de cada archivo adjunto.' />
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {BADGES_SELECCIONABLES.map((badge) => {
          const activo = value.includes(badge.value);
          return (
            <button
              key={badge.value}
              type='button'
              aria-pressed={activo}
              disabled={disabled}
              onClick={() => toggle(badge.value)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors disabled:opacity-50 ${
                activo
                  ? 'border-transparent'
                  : 'border-white/[0.07] text-neutral-500 hover:border-white/[0.18] hover:text-neutral-200'
              }`}
              style={
                activo
                  ? { background: badge.bg, color: badge.color }
                  : undefined
              }
            >
              <i className={`ti ${badge.icon} text-[13px]`} />
              {badge.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ícono de información (ⓘ) con tooltip nativo, para cuando el tipo de
// archivo del usuario no está en las extensiones permitidas
export function InfoTooltip({ texto }) {
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
