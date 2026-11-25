import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { useBusquedaRamos, useRamosCarrera } from '@/shared/hooks/useRamos';
import NombreResaltado from '@/shared/components/NombreResaltado';

const TEXTO_MAX = 100;

/**
 * Selector de ramo para formularios: un campo con el ramo elegido que, al
 * abrirse, muestra un buscador y la lista agrupada por año y semestre.
 * La lista va dentro del flujo (no flota): el panel de Modal tiene
 * overflow-hidden y un desplegable absoluto quedaría cortado.
 * - nombreActual: nombre a mostrar si `value` aún no está en la lista
 *   (mientras cargan los ramos, o un ramo de otra carrera al editar)
 */
export default function SelectorRamo({
  carreraId,
  value,
  onChange,
  nombreActual = null,
  placeholder = 'Selecciona un ramo...',
}) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const [activo, setActivo] = useState(0);
  const ref = useRef(null);
  const botonRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);
  const idLista = useId();

  const {
    data: ramosPorSemestre,
    isPending,
    isError,
    refetch,
  } = useRamosCarrera(carreraId);
  const { indice, palabras, buscando, resultados } = useBusquedaRamos(
    ramosPorSemestre,
    texto,
  );

  const seleccionado = useMemo(
    () => indice.find((r) => r.ramo.id === value)?.ramo ?? null,
    [indice, value],
  );

  // sin búsqueda se ven todos; con búsqueda, solo las coincidencias. `i` es la
  // posición en la lista plana, la que recorre el teclado
  const visibles = buscando ? resultados : indice;
  const grupos = useMemo(() => {
    const porUbicacion = new Map();
    visibles.forEach((r, i) => {
      if (!porUbicacion.has(r.ubicacion)) porUbicacion.set(r.ubicacion, []);
      porUbicacion.get(r.ubicacion).push({ ...r, i });
    });
    return [...porUbicacion];
  }, [visibles]);

  function abrir() {
    // el teclado parte desde el ramo ya elegido
    setActivo(Math.max(0, indice.findIndex((r) => r.ramo.id === value)));
    setOpen(true);
  }

  function cerrar() {
    setOpen(false);
    setTexto('');
    setActivo(0);
  }

  function elegir(ramo) {
    onChange(ramo.id);
    cerrar();
    botonRef.current?.focus();
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setTexto('');
        setActivo(0);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listaRef.current
      ?.querySelector(`[data-indice="${activo}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo, open]);

  // ↑ ↓ recorren, Enter elige (sin enviar el formulario), Esc limpia el texto
  // y un segundo Esc cierra la lista (sin cerrar el modal)
  function onTeclas(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (texto) {
        setTexto('');
        setActivo(0);
      } else {
        cerrar();
        botonRef.current?.focus();
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const r = visibles[activo] ?? visibles[0];
      if (r) elegir(r.ramo);
      return;
    }
    if (visibles.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivo((i) => (i + 1) % visibles.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo((i) => (i - 1 + visibles.length) % visibles.length);
    }
  }

  const etiqueta = seleccionado?.nombre ?? (value ? nombreActual : null);
  const idActivo = visibles[activo]
    ? `${idLista}-${visibles[activo].ramo.id}`
    : undefined;

  return (
    <div ref={ref}>
      <button
        ref={botonRef}
        type='button'
        onClick={() => (open ? cerrar() : abrir())}
        aria-haspopup='listbox'
        aria-expanded={open}
        className={`${inputClasses} flex items-center gap-2 text-left`}
      >
        {seleccionado && (
          <span
            className='h-2 w-2 flex-shrink-0 rounded-full'
            style={{ background: colorPorRamo(seleccionado.id) }}
          />
        )}
        <span
          className={`min-w-0 flex-1 truncate ${etiqueta ? '' : 'text-neutral-600'}`}
        >
          {etiqueta ?? placeholder}
        </span>
        <i
          className={`ti ti-chevron-down text-xs text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='mt-1.5 overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#17171B]'>
          <div className='border-b border-white/[0.07] p-2'>
            <div className='flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 transition-colors focus-within:border-pink-500/40'>
              <i className='ti ti-search text-[13px] text-neutral-600' />
              <input
                ref={inputRef}
                type='text'
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setActivo(0);
                }}
                onKeyDown={onTeclas}
                maxLength={TEXTO_MAX}
                placeholder='Buscar ramo...'
                autoComplete='off'
                role='combobox'
                aria-label='Buscar ramo'
                aria-expanded
                aria-controls={idLista}
                aria-autocomplete='list'
                aria-activedescendant={idActivo}
                className='h-[30px] min-w-0 flex-1 bg-transparent text-[12.5px] text-neutral-100 placeholder-neutral-600 outline-none'
              />
              {texto && (
                <button
                  type='button'
                  onClick={() => {
                    setTexto('');
                    setActivo(0);
                    inputRef.current?.focus();
                  }}
                  aria-label='Limpiar búsqueda'
                  className='text-neutral-600 transition-colors hover:text-neutral-300'
                >
                  <i className='ti ti-x text-[12px]' />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listaRef}
            id={idLista}
            role='listbox'
            className='max-h-[240px] overflow-y-auto py-1'
          >
            {isPending && carreraId ? (
              <p className='px-3.5 py-3 text-[12px] text-neutral-500'>
                Cargando ramos...
              </p>
            ) : isError ? (
              <p className='flex items-center gap-2 px-3.5 py-3 text-[12px] text-red-400'>
                No se pudieron cargar los ramos.
                <button
                  type='button'
                  onClick={() => refetch()}
                  className='font-medium text-blue-400 hover:underline'
                >
                  Reintentar
                </button>
              </p>
            ) : visibles.length === 0 ? (
              <p className='px-3.5 py-3 text-[12px] text-neutral-500'>
                {buscando
                  ? `Sin ramos para «${texto.trim()}».`
                  : 'No hay ramos disponibles.'}
              </p>
            ) : (
              grupos.map(([ubicacion, items]) => (
                <div
                  key={ubicacion}
                  role='group'
                  aria-label={ubicacion}
                >
                  <p className='px-3.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-600'>
                    {ubicacion}
                  </p>
                  {items.map(({ ramo, i }) => (
                    <button
                      key={ramo.id}
                      id={`${idLista}-${ramo.id}`}
                      data-indice={i}
                      type='button'
                      role='option'
                      aria-selected={ramo.id === value}
                      onMouseEnter={() => setActivo(i)}
                      onClick={() => elegir(ramo)}
                      className={`flex w-full items-center gap-2 px-3.5 py-1.5 text-left text-[12.5px] transition-colors ${i === activo ? 'bg-white/[0.06]' : ''
                        } ${ramo.id === value
                          ? 'font-semibold text-pink-500'
                          : 'text-neutral-400'
                        }`}
                    >
                      <span
                        className='h-2 w-2 flex-shrink-0 rounded-full'
                        style={{ background: colorPorRamo(ramo.id) }}
                      />
                      <span className='min-w-0 flex-1'>
                        <NombreResaltado
                          nombre={ramo.nombre}
                          palabras={palabras}
                        />
                      </span>
                      {ramo.id === value && (
                        <i className='ti ti-check text-[13px]' />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}