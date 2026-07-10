import { useEffect, useState } from 'react';
import { obtenerMiPerfil, actualizarMiPerfil, actualizarMisIntereses } from '../services/perfil';
import { getInitials, avatarColor } from '../helpers/matchHelpers';
import ModalShell from './cultural/ModalShell';
import EtiquetasPicker from '../components/EtiquetasPicker';

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatMesAnio(fecha) {
    if (!fecha) return null;
    const d = new Date(fecha);
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Perfil() {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [modalEditar, setModalEditar] = useState(false);
    const [modalIntereses, setModalIntereses] = useState(false);

    async function cargar() {
        setCargando(true);
        setError(null);
        try {
            const data = await obtenerMiPerfil();
            setPerfil(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    if (cargando) {
        return <p className='py-16 text-center text-[13px] text-neutral-500'>Cargando perfil…</p>;
    }

    if (error || !perfil) {
        return (
            <div className='mx-auto mt-10 max-w-md rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-400'>
                No se pudo cargar tu perfil{error ? `: ${error}` : ''}.
            </div>
        );
    }

    const av = avatarColor(perfil.id);
    const nombreVisible = perfil.nombre_completo || perfil.nombre_usuario;

    return (
        <div>
            {/* BANNER */}
            <div
                className='relative h-[190px] overflow-hidden'
                style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 70%,#1a1a2e 100%)' }}
            >
                <div
                    className='pointer-events-none absolute inset-0'
                    style={{
                        background:
                            'radial-gradient(ellipse 60% 80% at 70% 50%, rgba(232,84,106,.18) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 30%, rgba(99,102,241,.15) 0%, transparent 60%), radial-gradient(ellipse 30% 50% at 85% 20%, rgba(52,211,153,.10) 0%, transparent 60%)',
                    }}
                />
            </div>

            {/* AVATAR + ACCIONES (se monta sobre el borde inferior del banner) */}
            <div className='relative z-10 -mt-11 flex items-end gap-4 px-[28px]'>
                <div className='relative flex-shrink-0'>
                    <div
                        className={`flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-neutral-950 text-[28px] font-bold ${av.bg} ${av.text}`}
                    >
                        {getInitials(nombreVisible)}
                    </div>
                    <span className='absolute bottom-1 right-1 h-[14px] w-[14px] rounded-full border-[2.5px] border-neutral-950 bg-emerald-400' />
                </div>

                <div className='ml-auto flex gap-2 pb-2'>
                    <button
                        onClick={() => setModalEditar(true)}
                        className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-1.5 text-[12.5px] font-medium text-neutral-300 transition hover:border-white/[0.18] hover:text-neutral-100'
                    >
                        <i className='ti ti-pencil text-[14px]' /> Editar perfil
                    </button>
                </div>
            </div>

            {/* INFO */}
            <div className='px-[28px] pb-10 pt-3.5'>
                <div className='text-[20px] font-bold tracking-tight text-neutral-100'>{nombreVisible}</div>
                <div className='mt-px text-[13px] text-neutral-500'>u/{perfil.nombre_usuario}</div>

                {perfil.biografia && (
                    <p className='mt-2.5 max-w-xl text-[13px] leading-relaxed text-neutral-400'>
                        {perfil.biografia}
                    </p>
                )}

                <div className='mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5'>
                    {perfil.creado_en && (
                        <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                            <i className='ti ti-calendar text-[14px]' /> Se unió en{' '}
                            <strong className='font-medium text-neutral-400'>{formatMesAnio(perfil.creado_en)}</strong>
                        </span>
                    )}
                    {perfil.campus && (
                        <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                            <i className='ti ti-map-pin text-[14px]' /> {perfil.campus}
                        </span>
                    )}
                    <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                        <i className='ti ti-mail text-[14px]' /> {perfil.correo}
                    </span>
                    <span className='inline-flex items-center gap-1.5 text-[12px] capitalize text-neutral-500'>
                        <i className='ti ti-id-badge-2 text-[14px]' /> {perfil.rol}
                    </span>
                </div>

                {/* ESTADÍSTICAS */}
                <div className='mt-3.5 flex max-w-xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24]'>
                    <div className='flex-1 border-r border-white/[0.07] px-4 py-3 text-center'>
                        <div className='text-[18px] font-bold text-neutral-100'>{perfil.stats.proyectos_creados}</div>
                        <div className='mt-0.5 text-[10.5px] font-medium tracking-wide text-neutral-600'>
                            Proyectos creados
                        </div>
                    </div>
                    <div className='flex-1 border-r border-white/[0.07] px-4 py-3 text-center'>
                        <div className='text-[18px] font-bold text-neutral-100'>{perfil.stats.postulaciones_enviadas}</div>
                        <div className='mt-0.5 text-[10.5px] font-medium tracking-wide text-neutral-600'>
                            Postulaciones enviadas
                        </div>
                    </div>
                    <div className='flex-1 px-4 py-3 text-center'>
                        <div className='text-[18px] font-bold text-pink-500'>{perfil.intereses.length}</div>
                        <div className='mt-0.5 text-[10.5px] font-medium tracking-wide text-neutral-600'>
                            Intereses
                        </div>
                    </div>
                </div>

                {/* INTERESES */}
                <div className='mt-4 max-w-xl rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-[18px]'>
                    <div className='mb-3 flex items-center justify-between'>
                        <h2 className='flex items-center gap-1.5 text-[13px] font-bold text-neutral-100'>
                            <i className='ti ti-tag text-[15px] text-pink-500' /> Mis intereses
                        </h2>
                        <button
                            onClick={() => setModalIntereses(true)}
                            className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3 py-1 text-[11.5px] font-medium text-neutral-400 transition hover:border-white/[0.18] hover:text-neutral-100'
                        >
                            <i className='ti ti-pencil text-[12px]' /> Editar intereses
                        </button>
                    </div>

                    {perfil.intereses.length === 0 ? (
                        <p className='text-[12.5px] leading-relaxed text-neutral-500'>
                            Aún no has agregado intereses. Agrégalos para que te recomendemos mejores proyectos en el
                            módulo de Match de proyectos.
                        </p>
                    ) : (
                        <div className='flex flex-wrap gap-1.5'>
                            {perfil.intereses.map((et) => (
                                <span
                                    key={et.id}
                                    className='rounded-full border border-pink-500/25 bg-pink-500/10 px-2.5 py-1 text-[11px] font-semibold text-pink-400'
                                >
                                    {et.nombre}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: editar datos básicos */}
            {modalEditar && (
                <EditarPerfilModal
                    perfil={perfil}
                    onClose={() => setModalEditar(false)}
                    onGuardado={(actualizado) => {
                        setPerfil(actualizado);
                        setModalEditar(false);
                    }}
                />
            )}

            {/* MODAL: editar intereses */}
            {modalIntereses && (
                <EditarInteresesModal
                    perfil={perfil}
                    onClose={() => setModalIntereses(false)}
                    onGuardado={(actualizado) => {
                        setPerfil(actualizado);
                        setModalIntereses(false);
                    }}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: EDITAR DATOS BÁSICOS DEL PERFIL
// ─────────────────────────────────────────────────────────────────────────────

function EditarPerfilModal({ perfil, onClose, onGuardado }) {
    const [form, setForm] = useState({
        nombre_usuario: perfil.nombre_usuario || '',
        nombre_completo: perfil.nombre_completo || '',
        biografia: perfil.biografia || '',
        campus: perfil.campus || '',
    });
    const [errores, setErrores] = useState([]);
    const [guardando, setGuardando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setGuardando(true);
        setErrores([]);
        try {
            const actualizado = await actualizarMiPerfil({
                nombre_usuario: form.nombre_usuario.trim(),
                nombre_completo: form.nombre_completo.trim() || null,
                biografia: form.biografia.trim() || null,
                campus: form.campus.trim() || null,
            });
            onGuardado(actualizado);
        } catch (err) {
            setErrores(err.details?.length ? err.details.map((d) => d.message || d) : [err.message]);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <ModalShell
            title='Editar perfil'
            onClose={onClose}
            maxWidth='max-w-[480px]'
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
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>Nombre de usuario</label>
                    <input
                        type='text'
                        value={form.nombre_usuario}
                        onChange={(e) => setForm((f) => ({ ...f, nombre_usuario: e.target.value }))}
                        className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition focus:border-pink-500/50'
                    />
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>Nombre completo</label>
                    <input
                        type='text'
                        value={form.nombre_completo}
                        onChange={(e) => setForm((f) => ({ ...f, nombre_completo: e.target.value }))}
                        placeholder='Ej: Alumno InFACE'
                        className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                    />
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>Biografía</label>
                    <textarea
                        value={form.biografia}
                        onChange={(e) => setForm((f) => ({ ...f, biografia: e.target.value }))}
                        rows={3}
                        maxLength={280}
                        placeholder='Cuéntanos sobre ti...'
                        className='w-full resize-none rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                    />
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>Campus</label>
                    <input
                        type='text'
                        value={form.campus}
                        onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}
                        placeholder='Ej: Concepción'
                        className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                    />
                </div>

                <div className='flex justify-end gap-2 border-t border-white/[0.07] pt-4'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                    >
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        disabled={guardando}
                        className='rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                    >
                        {guardando ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: EDITAR INTERESES (ETIQUETAS)
// ─────────────────────────────────────────────────────────────────────────────

function EditarInteresesModal({ perfil, onClose, onGuardado }) {
    const [etiquetaIds, setEtiquetaIds] = useState(perfil.intereses.map((et) => et.id));
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);

    async function handleGuardar() {
        setGuardando(true);
        setError(null);
        try {
            const actualizado = await actualizarMisIntereses(etiquetaIds);
            onGuardado(actualizado);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <ModalShell
            title='Editar intereses'
            subtitle='Estos intereses se usan para recomendarte proyectos afines en el módulo de Match de proyectos.'
            onClose={onClose}
            maxWidth='max-w-[520px]'
        >
            <div className='flex flex-col gap-4'>
                {error && (
                    <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                        {error}
                    </div>
                )}

                <EtiquetasPicker
                    selectedIds={etiquetaIds}
                    onChange={setEtiquetaIds}
                    max={15}
                    emptyHint='Aún no seleccionas intereses.'
                />

                <div className='flex justify-end gap-2 border-t border-white/[0.07] pt-4'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                    >
                        Cancelar
                    </button>
                    <button
                        type='button'
                        onClick={handleGuardar}
                        disabled={guardando}
                        className='rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                    >
                        {guardando ? 'Guardando…' : 'Guardar intereses'}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}
