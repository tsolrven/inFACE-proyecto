import { useEffect, useMemo, useState } from 'react';
import { listarEtiquetas } from '../services/etiqueta';

export default function EtiquetasPicker({ selectedIds = [], onChange, max = 15, emptyHint }) {
    const [disponibles, setDisponibles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        listarEtiquetas()
            .then(setDisponibles)
            .catch(() => setDisponibles([]))
            .finally(() => setCargando(false));
    }, []);

    const seleccionadasSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    function toggle(id) {
        if (seleccionadasSet.has(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else if (selectedIds.length < max) {
            onChange([...selectedIds, id]);
        }
    }

    const filtradas = disponibles.filter((et) =>
        et.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
    );
    const porTipo = filtradas.reduce((acc, et) => {
        const tipo = et.tipo || 'Otras';
        (acc[tipo] ||= []).push(et);
        return acc;
    }, {});

    const seleccionadas = disponibles.filter((et) => seleccionadasSet.has(et.id));

    return (
        <div>
            {seleccionadas.length > 0 ? (
                <div className='mb-2 flex flex-wrap gap-1.5'>
                    {seleccionadas.map((et) => (
                        <span
                            key={et.id}
                            className='inline-flex items-center gap-1 rounded-full border border-pink-500/40 bg-pink-500/10 px-2.5 py-1 text-[11px] font-medium text-pink-500'
                        >
                            {et.nombre}
                            <i
                                onClick={() => toggle(et.id)}
                                className='ti ti-x cursor-pointer text-[12px]'
                            />
                        </span>
                    ))}
                </div>
            ) : (
                emptyHint && <p className='mb-2 text-[12px] text-neutral-600'>{emptyHint}</p>
            )}

            <input
                type='text'
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder='Buscar intereses (tecnologías, habilidades, temas...)'
                className='mb-2 w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2 text-[12.5px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
            />

            <div className='max-h-[220px] overflow-y-auto rounded-[10px] border border-white/[0.07] bg-[#232329] p-2.5'>
                {cargando && (
                    <p className='py-2 text-center text-[12px] text-neutral-500'>Cargando intereses…</p>
                )}
                {!cargando && filtradas.length === 0 && (
                    <p className='py-2 text-center text-[12px] text-neutral-500'>No se encontraron etiquetas</p>
                )}
                {Object.entries(porTipo).map(([tipo, etiquetas]) => (
                    <div
                        key={tipo}
                        className='mb-2 last:mb-0'
                    >
                        <div className='mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600'>
                            {tipo}
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                            {etiquetas.map((et) => {
                                const seleccionada = seleccionadasSet.has(et.id);
                                return (
                                    <button
                                        type='button'
                                        key={et.id}
                                        onClick={() => toggle(et.id)}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${seleccionada
                                            ? 'border-pink-500/40 bg-pink-500/10 text-pink-500'
                                            : 'border-white/[0.07] text-neutral-400 hover:text-neutral-100'
                                            }`}
                                    >
                                        {et.nombre}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <p className='mt-1.5 text-right text-[11px] text-neutral-600'>
                {selectedIds.length}/{max} seleccionadas
            </p>
        </div>
    );
}
