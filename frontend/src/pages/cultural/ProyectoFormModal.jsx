import { useEffect, useState } from 'react';
import ModalShell from './ModalShell';
import { listarEtiquetas } from '../../services/etiqueta';
import { etiquetaColor } from '../../helpers/matchHelpers';

const MODALIDAD_COLORES = {
    presencial: 'border-sky-400/25 bg-sky-400/10 text-sky-400',
    remoto: 'border-purple-400/25 bg-purple-400/10 text-purple-400',
    hibrido: 'border-teal-400/25 bg-teal-400/10 text-teal-400',
};

const MODALIDADES = [
    { value: 'remoto', label: 'Remoto', icon: 'ti-world' },
    { value: 'presencial', label: 'Presencial', icon: 'ti-building' },
    { value: 'hibrido', label: 'Híbrido', icon: 'ti-arrows-shuffle' },
];

function toInputDate(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toISOString().slice(0, 10);
}

export default function ProyectoFormModal({ proyecto, onClose, onSubmit }) {
    const esEdicion = Boolean(proyecto);

    const [form, setForm] = useState({
        titulo_proyecto: proyecto?.titulo || '',
        descripcion_proyecto: proyecto?.descripcion || '',
        modalidad_proyecto: proyecto?.modalidad || 'remoto',
        maximo_integrantes: proyecto?.maximo_integrantes || '',
        fecha_inicio: toInputDate(proyecto?.fecha_inicio),
        fecha_fin: toInputDate(proyecto?.fecha_fin),
    });
    const [errores, setErrores] = useState([]);
    const [enviando, setEnviando] = useState(false);

    const [etiquetaIds, setEtiquetaIds] = useState(
        () => new Set(proyecto?.etiquetas?.map((et) => et.id) || []),
    );
    const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
    const [cargandoEtiquetas, setCargandoEtiquetas] = useState(true);
    const [busquedaEtiqueta, setBusquedaEtiqueta] = useState('');

    useEffect(() => {
        listarEtiquetas()
            .then(setEtiquetasDisponibles)
            .catch(() => setEtiquetasDisponibles([]))
            .finally(() => setCargandoEtiquetas(false));
    }, []);

    function toggleEtiqueta(id) {
        setEtiquetaIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else if (next.size < 10) {
                next.add(id);
            }
            return next;
        });
    }

    const etiquetasFiltradas = etiquetasDisponibles.filter((et) =>
        et.nombre.toLowerCase().includes(busquedaEtiqueta.trim().toLowerCase()),
    );
    const etiquetasPorTipo = etiquetasFiltradas.reduce((acc, et) => {
        const tipo = et.tipo || 'Otras';
        (acc[tipo] ||= []).push(et);
        return acc;
    }, {});

    function validar() {
        const errs = [];
        const titulo = form.titulo_proyecto.trim();
        const desc = form.descripcion_proyecto.trim();

        if (!titulo) errs.push('El título del proyecto es obligatorio');
        else if (titulo.length < 5) errs.push('El título debe tener al menos 5 caracteres');
        else if (titulo.length > 200) errs.push('El título no puede superar los 200 caracteres');

        if (!desc) errs.push('La descripción del proyecto es obligatoria');
        else if (desc.length < 20) errs.push('La descripción debe tener al menos 20 caracteres');

        if (!form.modalidad_proyecto) errs.push('La modalidad es obligatoria');

        if (form.maximo_integrantes !== '' && (!Number.isInteger(Number(form.maximo_integrantes)) || Number(form.maximo_integrantes) < 2)) {
            errs.push('El máximo de integrantes debe ser un número entero mayor o igual a 2');
        }

        if (form.fecha_inicio && form.fecha_fin && new Date(form.fecha_inicio) >= new Date(form.fecha_fin)) {
            errs.push('La fecha de inicio debe ser anterior a la fecha de fin');
        }

        if (!esEdicion && form.fecha_inicio) {
            const hoyStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' en hora local, comparable como texto
            if (form.fecha_inicio <= hoyStr) {
                errs.push('La fecha de inicio no puede ser hoy: elige una fecha futura para tu proyecto');
            }
        }

        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validar();
        if (errs.length > 0) {
            setErrores(errs);
            return;
        }
        setErrores([]);
        setEnviando(true);
        try {
            await onSubmit({
                titulo_proyecto: form.titulo_proyecto.trim(),
                descripcion_proyecto: form.descripcion_proyecto.trim(),
                modalidad_proyecto: form.modalidad_proyecto,
                maximo_integrantes: form.maximo_integrantes === '' ? null : Number(form.maximo_integrantes),
                fecha_inicio: form.fecha_inicio || null,
                fecha_fin: form.fecha_fin || null,
                etiqueta_ids: [...etiquetaIds],
            });
        } catch (err) {
            setErrores(err.details?.length ? err.details : [err.message]);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <ModalShell
            title={esEdicion ? 'Editar proyecto' : 'Crear proyecto'}
            onClose={onClose}
            maxWidth='max-w-[560px]'
        >
            <form
                onSubmit={handleSubmit}
                className='flex flex-col gap-4'
            >
                {errores.length > 0 && (
                    <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                        <ul className='list-disc space-y-0.5 pl-4'>
                            {errores.map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                        Título del proyecto
                    </label>
                    <input
                        type='text'
                        value={form.titulo_proyecto}
                        onChange={(e) => setForm((f) => ({ ...f, titulo_proyecto: e.target.value }))}
                        placeholder='Ej: Sistema de gestión académica FACE'
                        className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                    />
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                        Descripción
                    </label>
                    <textarea
                        value={form.descripcion_proyecto}
                        onChange={(e) => setForm((f) => ({ ...f, descripcion_proyecto: e.target.value }))}
                        placeholder='Describe el objetivo del proyecto, qué buscas construir y qué perfiles necesitas...'
                        rows={4}
                        className='w-full resize-none rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                    />
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                        Modalidad
                    </label>
                    <div className='flex flex-wrap gap-2'>
                        {MODALIDADES.map((m) => (
                            <button
                                type='button'
                                key={m.value}
                                onClick={() => setForm((f) => ({ ...f, modalidad_proyecto: m.value }))}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${form.modalidad_proyecto === m.value
                                    ? MODALIDAD_COLORES[m.value]
                                    : 'border-white/[0.07] text-neutral-400 hover:text-neutral-100'
                                    }`}
                            >
                                <i className={`ti ${m.icon} text-[13px]`} />
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                        Etiquetas <span className='text-neutral-600'>({etiquetaIds.size}/10)</span>
                    </label>

                    {etiquetaIds.size > 0 && (
                        <div className='mb-2 flex flex-wrap gap-1.5'>
                            {etiquetasDisponibles
                                .filter((et) => etiquetaIds.has(et.id))
                                .map((et) => {
                                    const c = etiquetaColor(et.nombre);
                                    return (
                                        <span
                                            key={et.id}
                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${c.bg} ${c.text} ${c.border}`}
                                        >
                                            {et.nombre}
                                            <i
                                                onClick={() => toggleEtiqueta(et.id)}
                                                className='ti ti-x cursor-pointer text-[12px]'
                                            />
                                        </span>
                                    );
                                })}
                        </div>
                    )}

                    <input
                        type='text'
                        value={busquedaEtiqueta}
                        onChange={(e) => setBusquedaEtiqueta(e.target.value)}
                        placeholder='Buscar etiquetas (tecnologías, habilidades, metodologías...)'
                        className='mb-2 w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2 text-[12.5px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                    />

                    <div className='max-h-[160px] overflow-y-auto rounded-[10px] border border-white/[0.07] bg-[#232329] p-2.5'>
                        {cargandoEtiquetas && (
                            <p className='py-2 text-center text-[12px] text-neutral-500'>Cargando etiquetas…</p>
                        )}
                        {!cargandoEtiquetas && etiquetasFiltradas.length === 0 && (
                            <p className='py-2 text-center text-[12px] text-neutral-500'>No se encontraron etiquetas</p>
                        )}
                        {Object.entries(etiquetasPorTipo).map(([tipo, etiquetas]) => (
                            <div
                                key={tipo}
                                className='mb-2 last:mb-0'
                            >
                                <div className='mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600'>
                                    {tipo}
                                </div>
                                <div className='flex flex-wrap gap-1.5'>
                                    {etiquetas.map((et) => {
                                        const seleccionada = etiquetaIds.has(et.id);
                                        const c = etiquetaColor(et.nombre);
                                        return (
                                            <button
                                                type='button'
                                                key={et.id}
                                                onClick={() => toggleEtiqueta(et.id)}
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${seleccionada
                                                    ? `${c.bg} ${c.text} ${c.border}`
                                                    : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.16] hover:text-neutral-100'
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
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                            Máximo de integrantes
                        </label>
                        <input
                            type='number'
                            min={2}
                            value={form.maximo_integrantes}
                            onChange={(e) => setForm((f) => ({ ...f, maximo_integrantes: e.target.value }))}
                            placeholder='Opcional'
                            className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                        />
                    </div>
                    <div />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                            Fecha de inicio
                        </label>
                        <input
                            type='date'
                            value={form.fecha_inicio}
                            onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))}
                            className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition focus:border-pink-500/50 [color-scheme:dark]'
                        />
                    </div>
                    <div>
                        <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                            Fecha de fin
                        </label>
                        <input
                            type='date'
                            value={form.fecha_fin}
                            onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))}
                            className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition focus:border-pink-500/50 [color-scheme:dark]'
                        />
                    </div>
                </div>

                <div className='mt-2 flex justify-end gap-2 border-t border-white/[0.07] pt-4'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                    >
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        disabled={enviando}
                        className='rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                    >
                        {enviando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear proyecto'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}