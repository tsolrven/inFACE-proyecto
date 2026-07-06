import { useEffect, useRef, useState } from 'react';
import { listarRamosPorCarrera } from '../../services/repositorioMateriales/ramo.service';
import { useRepositorioStore } from '../../stores/repositorioStore';
import { colorPorRamo } from '../../utils/ramoColors';

// ⚠️ ASUNCIÓN: el backend agrupa ramos por "semestre" (1, 2, 3...), pero
// el mockup organiza el acordeón por "Año" (I Año, II Año...) y dentro
// por semestre. Como un año universitario = 2 semestres, derivo el año
// con Math.ceil(semestre / 2). Si tu concepto de "semestre" en el
// schema ya es continuo (1..10), esto calza. Si tu backend maneja el
// año de otra forma, ajusta la función `agruparPorAnio` de este archivo.
function agruparPorAnio(ramosPorSemestre) {
  const anios = {};
  Object.entries(ramosPorSemestre).forEach(([semestre, ramos]) => {
    const sem = Number(semestre);
    const anio = Math.ceil(sem / 2);
    const semestreEnAnio = sem % 2 === 0 ? 2 : 1;
    if (!anios[anio]) anios[anio] = {};
    anios[anio][semestreEnAnio] = ramos;
  });
  return anios;
}

const NUMEROS_ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export default function FiltroRamo({ carreraId }) {
  const [open, setOpen] = useState(false);
  const [anioAbierto, setAnioAbierto] = useState(null);
  const [semAbierto, setSemAbierto] = useState(null);
  const [ramosPorAnio, setRamosPorAnio] = useState({});
  const [cargando, setCargando] = useState(false);
  const ref = useRef(null);

  const ramoId = useRepositorioStore((s) => s.filtros.ramo_id);
  const setFiltro = useRepositorioStore((s) => s.setFiltro);
  const [ramoSeleccionado, setRamoSeleccionado] = useState(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !carreraId || Object.keys(ramosPorAnio).length > 0) return;
    setCargando(true);
    listarRamosPorCarrera(carreraId)
      .then((data) => setRamosPorAnio(agruparPorAnio(data)))
      .finally(() => setCargando(false));
  }, [open, carreraId, ramosPorAnio]);

  function elegirRamo(ramo) {
    setRamoSeleccionado(ramo);
    setFiltro('ramo_id', ramo.id);
    setOpen(false);
  }

  function limpiar() {
    setRamoSeleccionado(null);
    setFiltro('ramo_id', null);
    setOpen(false);
  }

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
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
        <i className={`ti ti-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute left-0 top-[calc(100%+6px)] z-[450] max-h-[420px] w-[230px] overflow-y-auto rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
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
            <div className='px-3.5 py-3 text-[12px] text-neutral-500'>Cargando ramos...</div>
          )}

          {Object.entries(ramosPorAnio)
            .sort(([a], [b]) => a - b)
            .map(([anio, semestres]) => (
              <div key={anio} className='border-b border-white/[0.06] last:border-b-0'>
                <button
                  type='button'
                  onClick={() => setAnioAbierto((a) => (a === anio ? null : anio))}
                  className='flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[12.5px] font-bold text-neutral-300 hover:bg-white/[0.04]'
                >
                  <span>{NUMEROS_ROMANOS[anio - 1] ?? anio} Año</span>
                  <i
                    className={`ti ti-chevron-right text-xs text-neutral-600 transition-transform ${
                      anioAbierto === anio ? 'rotate-90' : ''
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
                            onClick={() => setSemAbierto((s) => (s === semKey ? null : semKey))}
                            className='flex w-full items-center justify-between py-1.5 pl-[22px] pr-3.5 text-left text-[11.5px] font-semibold text-neutral-500 hover:text-neutral-300'
                          >
                            <span>{NUMEROS_ROMANOS[sem - 1] ?? sem} Semestre</span>
                            <i
                              className={`ti ti-chevron-right text-xs transition-transform ${
                                semAbierto === semKey ? 'rotate-90' : ''
                              }`}
                            />
                          </button>

                          {semAbierto === semKey &&
                            ramos.map((ramo) => (
                              <button
                                key={ramo.id}
                                type='button'
                                onClick={() => elegirRamo(ramo)}
                                className={`flex w-full items-center gap-2 py-1.5 pl-[30px] pr-3.5 text-left text-[12px] transition-colors hover:bg-white/[0.04] ${
                                  ramoId === ramo.id ? 'font-semibold text-pink-500' : 'text-neutral-400'
                                }`}
                              >
                                <span
                                  className='h-2 w-2 flex-shrink-0 rounded-full'
                                  style={{ background: colorPorRamo(ramo.id) }}
                                />
                                {ramo.nombre}
                              </button>
                            ))}
                        </div>
                      );
                    })}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
