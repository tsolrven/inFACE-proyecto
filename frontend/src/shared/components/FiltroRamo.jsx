import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { NUMEROS_ROMANOS, partesSemestre } from '@/shared/lib/ramos';
import { useBusquedaRamos, useRamosCarrera } from '@/shared/hooks/useRamos';
import NombreResaltado from '@/shared/components/NombreResaltado';

const TEXTO_MAX = 100;

function agruparPorAnio(ramosPorSemestre) {
  const anios = {};
  Object.entries(ramosPorSemestre).forEach(([semestre, ramos]) => {
    const { anio, semestreEnAnio } = partesSemestre(semestre);
    if (!anios[anio]) anios[anio] = {};
    anios[anio][semestreEnAnio] = ramos;
  });
  return anios;
}

export default function FiltroRamo({ carreraId, ramoId, onCambiar }) {
  const [open, setOpen] = useState(false);
  const [anioAbierto, setAnioAbierto] = useState(null);
  const [semAbierto, setSemAbierto] = useState(null);
  const [texto, setTexto] = useState('');
  const [activo, setActivo] = useState(0);
  const ref = useRef(null);
  const botonRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);
  const idLista = useId();

  const { data: ramosPorSemestre, isPending } = useRamosCarrera(carreraId);
  const cargando = isPending && !!carreraId;

  const ramosPorAnio = useMemo(
    () => agruparPorAnio(ramosPorSemestre ?? {}),
    [ramosPorSemestre],
  );

  const { indice, palabras, buscando, resultados } = useBusquedaRamos(
    ramosPorSemestre,
    texto,
  );

  const ramoSeleccionado = useMemo(
    () => indice.find((r) => r.ramo.id === ramoId)?.ramo ?? null,
    [indice, ramoId],
  );

  function cerrar() {
    setOpen(false);
    setTexto('');
    setActivo(0);
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

  // al abrir, el foco va al buscador: se puede escribir de inmediato
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // con el teclado, el resultado activo siempre queda a la vista
  useEffect(() => {
    if (!buscando) return;
    listaRef.current
      ?.querySelector(`[data-indice="${activo}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo, buscando]);

  function elegirRamo(ramo) {
    onCambiar(ramo.id);
    cerrar();
  }

  function limpiar() {
    onCambiar(null);
    cerrar();
  }

  function cambiarTexto(valor) {
    setTexto(valor);
    setActivo(0);
  }

  // ↑ ↓ recorren los resultados, Enter elige, Esc limpia el texto y un
  // segundo Esc cierra (y devuelve el foco al botón)
  function onTeclas(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (texto) {
        cambiarTexto('');
      } else {
        cerrar();
        botonRef.current?.focus();
      }
      return;
    }
    if (!buscando || resultados.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivo((i) => (i + 1) % resultados.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo((i) => (i - 1 + resultados.length) % resultados.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      elegirRamo((resultados[activo] ?? resultados[0]).ramo);
    }
  }

  const idActivo =
    buscando && resultados[activo]
      ? `${idLista}-${resultados[activo].ramo.id}`
      : undefined;

  return (
    <div
      className='relative'
      ref={ref}
    >
      <button
        ref={botonRef}
        type='button'
        onClick={() => (open ? cerrar() : setOpen(true))}
        className='flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3 text-[12.5px] font-medium text-neutral-400 transition-colors hover:border-white/[0.18] hover:text-neutral-100'
      >
        {ramoSeleccionado ? (
          <span
            className='h-2 w-2 flex-shrink-0 rounded-full'
            style={{ background: colorPorRamo(ramoSeleccionado.id) }}
          />
        ) : (
          <i className='ti ti-adjustments-horizontal text-sm' />
        )}
        {ramoSeleccionado?.nombre ?? 'Filtrar ramo'}
        <i
          className={`ti ti-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='absolute left-0 top-[calc(100%+6px)] z-[450] max-h-[420px] w-[260px] overflow-y-auto rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
          <div className='sticky top-0 z-[1] border-b border-white/[0.07] bg-[#1E1E24] p-2'>
            <div className='flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 transition-colors focus-within:border-blue-400/35'>
              <i className='ti ti-search text-[13px] text-neutral-600' />
              <input
                ref={inputRef}
                type='text'
                value={texto}
                onChange={(e) => cambiarTexto(e.target.value)}
                onKeyDown={onTeclas}
                maxLength={TEXTO_MAX}
                placeholder='Buscar ramo...'
                autoComplete='off'
                role='combobox'
                aria-label='Buscar ramo'
                aria-expanded={buscando}
                aria-controls={idLista}
                aria-autocomplete='list'
                aria-activedescendant={idActivo}
                className='h-[30px] min-w-0 flex-1 bg-transparent text-[12.5px] text-neutral-100 placeholder-neutral-600 outline-none'
              />
              {texto && (
                <button
                  type='button'
                  onClick={() => {
                    cambiarTexto('');
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

          {ramoId && (
            <button
              type='button'
              onClick={limpiar}
              className='flex w-full items-center gap-2 border-b border-white/[0.07] px-3.5 py-2 text-left text-[12px] text-neutral-500 hover:text-neutral-200'
            >
              <i className='ti ti-x text-sm' /> Quitar filtro
            </button>
          )}

          {cargando && (
            <div className='px-3.5 py-3 text-[12px] text-neutral-500'>
              Cargando ramos...
            </div>
          )}

          {buscando ? (
            <div
              ref={listaRef}
              id={idLista}
              role='listbox'
              className='py-1'
            >
              {resultados.length === 0 ? (
                <p className='px-3.5 py-3 text-[12px] text-neutral-500'>
                  Sin ramos para «{texto.trim()}».
                </p>
              ) : (
                resultados.map(({ ramo, ubicacion }, i) => (
                  <button
                    key={ramo.id}
                    id={`${idLista}-${ramo.id}`}
                    data-indice={i}
                    type='button'
                    role='option'
                    aria-selected={i === activo}
                    onMouseEnter={() => setActivo(i)}
                    onClick={() => elegirRamo(ramo)}
                    className={`flex w-full items-start gap-2 px-3.5 py-1.5 text-left text-[12px] transition-colors ${i === activo ? 'bg-white/[0.06]' : ''
                      } ${ramoId === ramo.id
                        ? 'font-semibold text-pink-500'
                        : 'text-neutral-400'
                      }`}
                  >
                    <span
                      className='mt-[5px] h-2 w-2 flex-shrink-0 rounded-full'
                      style={{ background: colorPorRamo(ramo.id) }}
                    />
                    <span className='min-w-0'>
                      <span className='block'>
                        <NombreResaltado
                          nombre={ramo.nombre}
                          palabras={palabras}
                        />
                      </span>
                      <span className='block text-[10.5px] font-normal text-neutral-600'>
                        {ubicacion}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            Object.entries(ramosPorAnio)
              .sort(([a], [b]) => a - b)
              .map(([anio, semestres]) => (
                <div
                  key={anio}
                  className='border-b border-white/[0.06] last:border-b-0'
                >
                  <button
                    type='button'
                    onClick={() =>
                      setAnioAbierto((a) => (a === anio ? null : anio))
                    }
                    className='flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[12.5px] font-bold text-neutral-300 hover:bg-white/[0.04]'
                  >
                    <span>{NUMEROS_ROMANOS[anio - 1] ?? anio} Año</span>
                    <i
                      className={`ti ti-chevron-right text-xs text-neutral-600 transition-transform ${anioAbierto === anio ? 'rotate-90' : ''
                        }`}
                    />
                  </button>

                  {anioAbierto === anio &&
                    Object.entries(semestres)
                      .sort(([a], [b]) => a - b)
                      .map(([sem, ramos]) => {
                        const semKey = `${anio}-${sem}`;
                        return (
                          <div key={semKey}>
                            <button
                              type='button'
                              onClick={() =>
                                setSemAbierto((s) =>
                                  s === semKey ? null : semKey,
                                )
                              }
                              className='flex w-full items-center justify-between py-1.5 pl-[22px] pr-3.5 text-left text-[11.5px] font-semibold text-neutral-500 hover:text-neutral-300'
                            >
                              <span>
                                {NUMEROS_ROMANOS[sem - 1] ?? sem} Semestre
                              </span>
                              <i
                                className={`ti ti-chevron-right text-xs transition-transform ${semAbierto === semKey ? 'rotate-90' : ''
                                  }`}
                              />
                            </button>

                            {semAbierto === semKey &&
                              ramos.map((ramo) => (
                                <button
                                  key={ramo.id}
                                  type='button'
                                  onClick={() => elegirRamo(ramo)}
                                  className={`flex w-full items-center gap-2 py-1.5 pl-[30px] pr-3.5 text-left text-[12px] transition-colors hover:bg-white/[0.04] ${ramoId === ramo.id
                                    ? 'font-semibold text-pink-500'
                                    : 'text-neutral-400'
                                    }`}
                                >
                                  <span
                                    className='h-2 w-2 flex-shrink-0 rounded-full'
                                    style={{
                                      background: colorPorRamo(ramo.id),
                                    }}
                                  />
                                  {ramo.nombre}
                                </button>
                              ))}
                          </div>
                        );
                      })}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}