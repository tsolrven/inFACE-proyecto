import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const PREFIJO = 'inface:inicio:';

// la última pestaña elegida se recuerda por navegador; sin almacenamiento
// (modo privado, bloqueado) se parte en la primera
function leerPestana(clave, ids) {
  try {
    const guardada = localStorage.getItem(PREFIJO + clave);
    return ids.includes(guardada) ? guardada : ids[0];
  } catch {
    return ids[0];
  }
}

function guardarPestana(clave, id) {
  try {
    localStorage.setItem(PREFIJO + clave, id);
  } catch {
    // sin almacenamiento: no se recuerda, y no pasa nada
  }
}

/**
 * Panel con pestañas: muestra una sección a la vez.
 * pestanas: [{ id, label, icon, contador?, to?, contenido }]
 * - contador: número junto a la etiqueta (solo si es mayor que 0)
 * - to: destino de "Ver todo" para esa pestaña (opcional)
 */
export default function PanelPestanas({
  titulo,
  icono,
  claveMemoria,
  pestanas,
}) {
  const [activaId, setActivaId] = useState(() =>
    leerPestana(
      claveMemoria,
      pestanas.map((p) => p.id),
    ),
  );
  const botonesRef = useRef({});
  const base = useId();
  const activa = pestanas.find((p) => p.id === activaId) ?? pestanas[0];

  function elegir(id) {
    setActivaId(id);
    guardarPestana(claveMemoria, id);
  }

  // ← → recorren, Inicio/Fin van a los extremos (patrón ARIA de pestañas)
  function onTeclas(e, i) {
    const n = pestanas.length;
    let j;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    else return;
    e.preventDefault();
    elegir(pestanas[j].id);
    botonesRef.current[pestanas[j].id]?.focus();
  }

  return (
    <section className='rounded-3xl border border-white/[0.07] bg-[#17171B] p-4 sm:p-5'>
      <div className='mb-4 flex flex-wrap items-center gap-x-4 gap-y-3'>
        <h2 className='flex items-center gap-2 text-[15px] font-bold text-neutral-100'>
          <i className={`ti ${icono} text-[18px] text-pink-400`} />
          {titulo}
        </h2>

        <div
          role='tablist'
          aria-label={titulo}
          className='flex min-w-0 flex-1 gap-1 overflow-x-auto'
        >
          {pestanas.map((p, i) => {
            const seleccionada = p.id === activa.id;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  botonesRef.current[p.id] = el;
                }}
                id={`${base}-tab-${p.id}`}
                type='button'
                role='tab'
                aria-selected={seleccionada}
                aria-controls={`${base}-panel`}
                tabIndex={seleccionada ? 0 : -1}
                onClick={() => elegir(p.id)}
                onKeyDown={(e) => onTeclas(e, i)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${seleccionada
                    ? 'bg-white/[0.08] text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-200'
                  }`}
              >
                <i className={`ti ${p.icon} text-[14px]`} />
                {p.label}
                {p.contador > 0 && (
                  <span className='rounded-full bg-pink-500/15 px-1.5 text-[10.5px] font-bold text-pink-400'>
                    {p.contador > 99 ? '99+' : p.contador}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activa.to && (
          <Link
            to={activa.to}
            className='flex flex-shrink-0 items-center gap-1 rounded-full border border-white/[0.08] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 transition hover:border-pink-500/40 hover:text-pink-300'
          >
            Ver todo <i className='ti ti-arrow-right text-[13px]' />
          </Link>
        )}
      </div>

      <div
        id={`${base}-panel`}
        role='tabpanel'
        aria-labelledby={`${base}-tab-${activa.id}`}
        className='min-h-[240px]'
      >
        {activa.contenido}
      </div>
    </section>
  );
}