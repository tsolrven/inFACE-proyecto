import { useEffect, useMemo, useState } from 'react';
import { listarEtiquetas } from '@/shared/api/etiqueta.api';
import { etiquetaColor } from '@/shared/lib/matchHelpers';

export default function EtiquetasPicker({
  selectedIds = [],
  onChange,
  max = 15,
  emptyHint,
}) {
  const [disponibles, setDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tipoActivo, setTipoActivo] = useState(null); // null = todos los tipos

  useEffect(() => {
    listarEtiquetas()
      .then(setDisponibles)
      .catch(() => setDisponibles([]))
      .finally(() => setCargando(false));
  }, []);

  const seleccionadasSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const llegoAlMaximo = selectedIds.length >= max;

  function toggle(id) {
    if (seleccionadasSet.has(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else if (!llegoAlMaximo) {
      onChange([...selectedIds, id]);
    }
  }

  const tipos = useMemo(
    () => [...new Set(disponibles.map((et) => et.tipo || 'Otras'))],
    [disponibles],
  );

  const texto = busqueda.trim().toLowerCase();
  const filtradas = disponibles.filter((et) => {
    if (tipoActivo && (et.tipo || 'Otras') !== tipoActivo) return false;
    if (!texto) return true;
    return (
      et.nombre.toLowerCase().includes(texto) ||
      (et.descripcion || '').toLowerCase().includes(texto)
    );
  });
  const porTipo = filtradas.reduce((acc, et) => {
    const tipo = et.tipo || 'Otras';
    (acc[tipo] ||= []).push(et);
    return acc;
  }, {});

  const seleccionadas = disponibles.filter((et) => seleccionadasSet.has(et.id));

  return (
    <div>
      {seleccionadas.length > 0 ? (
        <div className='mb-3 flex flex-wrap gap-1.5'>
          {seleccionadas.map((et) => {
            const c = etiquetaColor(et.nombre);
            return (
              <span
                key={et.id}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${c.bg} ${c.text} ${c.border}`}
              >
                {et.nombre}
                <i
                  onClick={() => toggle(et.id)}
                  className='ti ti-x cursor-pointer text-[12px]'
                />
              </span>
            );
          })}
        </div>
      ) : (
        emptyHint && (
          <p className='mb-3 text-[12px] text-neutral-600'>{emptyHint}</p>
        )
      )}

      <input
        type='text'
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder='Buscar por nombre o tema (contabilidad, marketing, bases de datos...)'
        className='mb-2.5 w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2 text-[12.5px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
      />

      {tipos.length > 1 && (
        <div className='mb-2.5 flex flex-wrap gap-1.5'>
          {[null, ...tipos].map((tipo) => {
            const activo = tipoActivo === tipo;
            return (
              <button
                type='button'
                key={tipo ?? 'todas'}
                onClick={() => setTipoActivo(tipo)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  activo
                    ? 'border-pink-500/40 bg-pink-500/10 text-pink-300'
                    : 'border-white/[0.07] text-neutral-500 hover:border-white/[0.16] hover:text-neutral-200'
                }`}
              >
                {tipo ?? 'Todas'}
              </button>
            );
          })}
        </div>
      )}

      <div className='max-h-[min(55vh,440px)] overflow-y-auto rounded-[10px] border border-white/[0.07] bg-[#232329] p-3'>
        {cargando && (
          <p className='py-2 text-center text-[12px] text-neutral-500'>
            Cargando intereses…
          </p>
        )}
        {!cargando && filtradas.length === 0 && (
          <p className='py-2 text-center text-[12px] text-neutral-500'>
            No se encontraron etiquetas
          </p>
        )}
        {Object.entries(porTipo).map(([tipo, etiquetas]) => (
          <div
            key={tipo}
            className='mb-4 last:mb-0'
          >
            <div className='mb-2 px-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500'>
              {tipo}
            </div>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {etiquetas.map((et) => {
                const seleccionada = seleccionadasSet.has(et.id);
                const bloqueada = !seleccionada && llegoAlMaximo;
                const c = etiquetaColor(et.nombre);
                return (
                  <button
                    type='button'
                    key={et.id}
                    onClick={() => toggle(et.id)}
                    aria-pressed={seleccionada}
                    disabled={bloqueada}
                    className={`relative flex min-h-[78px] flex-col items-start rounded-[12px] border p-3 pr-8 text-left transition ${
                      seleccionada
                        ? `${c.bg} ${c.border}`
                        : 'border-white/[0.07] bg-[#1E1E24] hover:border-white/[0.18]'
                    } ${bloqueada ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <span
                      className={`text-[13px] font-semibold leading-tight ${
                        seleccionada ? c.text : 'text-neutral-100'
                      }`}
                    >
                      {et.nombre}
                    </span>
                    {et.descripcion && (
                      <span className='mt-1 text-[11.5px] leading-snug text-neutral-500'>
                        {et.descripcion}
                      </span>
                    )}
                    <span
                      className={`absolute right-2.5 top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[11px] ${
                        seleccionada
                          ? `${c.border} ${c.text}`
                          : 'border-white/[0.14] text-transparent'
                      }`}
                    >
                      <i className='ti ti-check' />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p
        className={`mt-1.5 text-right text-[11px] ${
          llegoAlMaximo ? 'text-amber-400' : 'text-neutral-600'
        }`}
      >
        {selectedIds.length}/{max} seleccionadas
        {llegoAlMaximo && ' · quita una para elegir otra'}
      </p>
    </div>
  );
}
