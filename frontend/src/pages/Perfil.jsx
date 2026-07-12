import { useEffect, useState } from 'react';
import {
    obtenerMiPerfil,
    actualizarMiPerfil,
    actualizarMisIntereses,
} from '../services/perfil';
import { listarProyectos } from '../services/matchingProyecto';
import { getInitials, avatarColor, etiquetaColor } from '../helpers/matchHelpers';
import ModalShell from './cultural/ModalShell';
import EtiquetasPicker from '../components/EtiquetasPicker';
import PerfilTabs from '../components/PerfilTabs';
// TODO(Silvana): importar aquí tu servicio de apuntes, ej:
// import { listarMisApuntes, listarMisRespuestas } from '../services/apunte';

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatMesAnio(fecha) {
    if (!fecha) return null;
    const d = new Date(fecha);
    const mes = MESES[d.getMonth()];
    return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${d.getFullYear()}`;
}

export default function Perfil() {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [modalEditar, setModalEditar] = useState(false);
    const [modalIntereses, setModalIntereses] = useState(false);

    // datos de las pestañas (conexión con otros módulos)
    const [proyectosCreados, setProyectosCreados] = useState([]);
    const [proyectosParticipa, setProyectosParticipa] = useState([]);
    const [cargandoTabs, setCargandoTabs] = useState(true);

    // TODO(Silvana): volver a agregar acá tu estado, ej:
    // const [apuntes, setApuntes] = useState([]);
    // const [respuestas, setRespuestas] = useState([]);

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

    async function cargarTabs(usuarioId) {
        setCargandoTabs(true);
        const [creados, participa /* TODO(Silvana): agregar tus llamadas acá */] = await Promise.allSettled([
            listarProyectos({ creador_id: usuarioId, limite: 50 }),
            listarProyectos({ integrante_id: usuarioId, limite: 50 }),
            // TODO(Silvana): agregar tus llamadas acá */
        ]);
        setProyectosCreados(creados.status === 'fulfilled' ? creados.value.datos : []);
        setProyectosParticipa(
            participa.status === 'fulfilled'
                ? participa.value.datos.filter((p) => p.creador?.id !== usuarioId)
                : [],
        );
        // TODO(Silvana): agregar tus setters, ej:
        // setApuntes(misApuntes.status === 'fulfilled' ? misApuntes.value : []);
        // setRespuestas(misRespuestas.status === 'fulfilled' ? misRespuestas.value : []);
        setCargandoTabs(false);
    }

    useEffect(() => {
        cargar();
    }, []);

    useEffect(() => {
        if (perfil?.id) cargarTabs(perfil.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [perfil?.id]);

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
            <div className='relative z-10 mx-auto -mt-11 flex max-w-4xl items-end gap-4 px-4 sm:px-[28px]'>
                <div className='relative flex-shrink-0'>
                    <div
                        className={`flex h-[90px] w-[90px] flex-shrink-0 items-center justify-center rounded-full border-[3px] border-neutral-950 text-[28px] font-bold ${av.bg} ${av.text}`}
                    >
                        {getInitials(nombreVisible)}
                    </div>
                    <span className='absolute bottom-1 right-1 h-[14px] w-[14px] rounded-full border-[2.5px] border-neutral-950 bg-emerald-400' />
                </div>

                <div className='ml-auto pb-2'>
                    <button
                        onClick={() => setModalEditar(true)}
                        className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-1.5 text-[12.5px] font-medium text-neutral-300 transition hover:border-white/[0.18] hover:text-neutral-100'
                    >
                        <i className='ti ti-pencil text-[14px]' /> Editar perfil
                    </button>
                </div>
            </div>

            {/* INFO */}
            <div className='mx-auto max-w-4xl px-4 sm:px-[28px] pb-10 pt-3.5'>
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
                    {perfil.carrera && (
                        <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                            <i className='ti ti-school text-[14px]' /> Estudiante de {perfil.carrera.nombre}
                        </span>
                    )}
                    <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                        <i className='ti ti-mail text-[14px]' /> {perfil.correo}
                    </span>
                    <span className='inline-flex items-center gap-1.5 text-[12px] capitalize text-neutral-500'>
                        <i className='ti ti-id-badge-2 text-[14px]' /> {perfil.rol}
                    </span>
                </div>

                {/* ESTADÍSTICAS (fila plana, sin caja, como el mockup) */}
                <div className='mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 border-b border-white/[0.07] pb-4'>
                    <div className='flex items-baseline gap-1.5'>
                        <span className='text-[16px] font-bold text-neutral-100'>{perfil.stats.proyectos_creados}</span>
                        <span className='text-[12px] text-neutral-500'>Proyectos creados</span>
                    </div>
                    <div className='flex items-baseline gap-1.5'>
                        <span className='text-[16px] font-bold text-pink-500'>{perfil.intereses.length}</span>
                        <span className='text-[12px] text-neutral-500'>Intereses</span>
                    </div>
                    {/* TODO(Silvana): agregar aquí más estadísticas cuando tengas los datos, ej:
                    <div className='flex items-baseline gap-1.5'>
                        <span className='text-[16px] font-bold text-neutral-100'>{apuntes.length}</span>
                        <span className='text-[12px] text-neutral-500'>Apuntes subidos</span>
                    </div> */}
                </div>

                {/* INTERESES (fila plana, con acción de editar al lado del título) */}
                <div className='mt-4'>
                    <div className='mb-2.5 flex items-center gap-2.5'>
                        <h2 className='flex items-center gap-1.5 text-[12.5px] font-bold text-neutral-300'>
                            <i className='ti ti-tag text-[14px] text-pink-500' /> Intereses
                        </h2>
                        <button
                            onClick={() => setModalIntereses(true)}
                            className='inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 transition hover:text-pink-400'
                        >
                            <i className='ti ti-pencil text-[11px]' /> Editar
                        </button>
                    </div>

                    {perfil.intereses.length === 0 ? (
                        <p className='text-[12.5px] leading-relaxed text-neutral-500'>
                            Aún no has agregado intereses. Agrégalos para que te recomendemos mejores proyectos en el
                            módulo de Match de proyectos.
                        </p>
                    ) : (
                        <div className='flex flex-wrap gap-1.5'>
                            {perfil.intereses.map((et) => {
                                const c = etiquetaColor(et.nombre);
                                return (
                                    <span
                                        key={et.id}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}
                                    >
                                        {et.nombre}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PESTAÑAS: conexión con los demás módulos */}
                <PerfilTabs
                    proyectosCreados={proyectosCreados}
                    proyectosParticipa={proyectosParticipa}
                    // TODO(Silvana): agregar tus props, ej:
                    // apuntes={apuntes}
                    // respuestas={respuestas}
                    cargando={cargandoTabs}
                />
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
// Solo nombre de usuario y biografía son editables. El nombre completo queda
// fijo desde el registro (se validó contra el correo institucional).
// ─────────────────────────────────────────────────────────────────────────────

function EditarPerfilModal({ perfil, onClose, onGuardado }) {
    const [form, setForm] = useState({
        nombre_usuario: perfil.nombre_usuario || '',
        biografia: perfil.biografia || '',
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
                biografia: form.biografia.trim() || null,
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
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>Nombre completo</label>
                    <div className='flex items-center gap-2 rounded-[10px] border border-white/[0.05] bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-500'>
                        <i className='ti ti-lock text-[13px]' />
                        {perfil.nombre_completo || 'Sin nombre completo'}
                    </div>
                    <p className='mt-1 text-[11px] text-neutral-600'>
                        No se puede editar: se detectó automáticamente desde tu correo institucional al registrarte.
                    </p>
                </div>

                <div>
                    <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>Nombre de usuario</label>
                    <input
                        type='text'
                        value={form.nombre_usuario}
                        onChange={(e) => setForm((f) => ({ ...f, nombre_usuario: e.target.value }))}
                        className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition focus:border-pink-500/50'
                    />
                    <p className='mt-1 text-[11px] text-neutral-600'>Debe ser único: no puede coincidir con el de otro usuario.</p>
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
