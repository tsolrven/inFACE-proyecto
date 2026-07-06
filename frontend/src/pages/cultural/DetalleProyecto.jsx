import { useState } from 'react';
import {
    getInitials,
    avatarColor,
    EstadoChip,
    ModalidadChip,
    formatFecha,
} from '../../helpers/matchHelpers';

function barGradient(estado) {
    if (estado === 'abierto') return 'linear-gradient(90deg,#34D399,#059669)';
    if (estado === 'en_progreso') return 'linear-gradient(90deg,#60A5FA,#2563AB)';
    return 'linear-gradient(90deg,#6B7280,#4B5563)';
}

export default function DetalleProyecto({
    proyecto,
    esCreador,
    esIntegrante,
    yaPostulado,
    puedePostular,
    onVolver,
    onPostular,
}) {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const av = avatarColor(proyecto.creador?.id);
    const cupos = proyecto.maximo_integrantes
        ? Math.max(proyecto.maximo_integrantes - proyecto.total_integrantes, 0)
        : null;

    const puedeMostrarAccion =
        puedePostular && !esCreador && !esIntegrante && !yaPostulado && !enviado;

    async function handleEnviar(e) {
        e.preventDefault();
        const texto = mensaje.trim();
        if (texto.length < 10) {
            setError('Cuéntale al creador por qué quieres unirte (mínimo 10 caracteres)');
            return;
        }
        setError(null);
        setEnviando(true);
        try {
            await onPostular(proyecto.id, texto);
            setEnviado(true);
            setMostrarForm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className='mx-auto max-w-[720px]'>
            <button
                onClick={onVolver}
                className='mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-400 transition hover:text-neutral-100'
            >
                <i className='ti ti-arrow-left text-[15px]' /> Volver
            </button>

            <div className='overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24]'>
                <div
                    className='h-1'
                    style={{ background: barGradient(proyecto.estado) }}
                />

                <div className='p-6'>
                    <div className='mb-1 flex flex-wrap items-start justify-between gap-3'>
                        <h1 className='text-[19px] font-bold leading-snug text-neutral-100'>{proyecto.titulo}</h1>
                    </div>

                    <div className='mb-4 flex flex-wrap items-center gap-2'>
                        <EstadoChip estado={proyecto.estado} />
                        <ModalidadChip modalidad={proyecto.modalidad} />
                        {esCreador && (
                            <span className='rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-pink-500'>
                                Eres el creador
                            </span>
                        )}
                        {esIntegrante && !esCreador && (
                            <span className='rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400'>
                                Ya eres integrante
                            </span>
                        )}
                    </div>

                    <div className='mb-4 flex items-center gap-2.5'>
                        <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${av.bg} ${av.text}`}
                        >
                            {getInitials(proyecto.creador?.nombre_usuario)}
                        </div>
                        <div className='text-[12.5px] text-neutral-400'>
                            Creado por <strong className='text-neutral-100'>{proyecto.creador?.nombre_usuario}</strong>
                            {' · '}
                            {formatFecha(proyecto.fecha_creacion)}
                        </div>
                    </div>

                    <p className='mb-4 whitespace-pre-line text-[13px] leading-relaxed text-neutral-300'>
                        {proyecto.descripcion}
                    </p>

                    {proyecto.etiquetas?.length > 0 && (
                        <div className='mb-4 flex flex-wrap gap-1.5'>
                            {proyecto.etiquetas.map((et) => (
                                <span
                                    key={et.id}
                                    className='rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-neutral-400'
                                >
                                    {et.nombre}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className='mb-4 flex gap-3 rounded-[10px] bg-[#2A2A32] px-3.5 py-2.5'>
                        <div className='flex flex-1 items-center gap-2.5'>
                            <i className='ti ti-armchair text-xl text-pink-500' />
                            <div>
                                <div className='text-[16px] font-bold leading-none text-neutral-100'>
                                    {cupos !== null ? cupos : '∞'}
                                </div>
                                <div className='mt-0.5 text-[10px] text-neutral-500'>Cupos disponibles</div>
                            </div>
                        </div>
                        <div className='flex flex-1 items-center gap-2.5'>
                            <i className='ti ti-users text-xl text-pink-500' />
                            <div>
                                <div className='text-[16px] font-bold leading-none text-neutral-100'>
                                    {proyecto.total_integrantes}
                                </div>
                                <div className='mt-0.5 text-[10px] text-neutral-500'>Integrantes</div>
                            </div>
                        </div>
                        <div className='flex flex-1 items-center gap-2.5'>
                            <i className='ti ti-inbox text-xl text-pink-500' />
                            <div>
                                <div className='text-[16px] font-bold leading-none text-neutral-100'>
                                    {proyecto.total_postulaciones}
                                </div>
                                <div className='mt-0.5 text-[10px] text-neutral-500'>Postulaciones</div>
                            </div>
                        </div>
                    </div>

                    {(proyecto.fecha_inicio || proyecto.fecha_fin) && (
                        <div className='mb-4 flex gap-4 text-[12px] text-neutral-500'>
                            {proyecto.fecha_inicio && (
                                <span>
                                    <i className='ti ti-calendar-event mr-1' />
                                    Inicio: {formatFecha(proyecto.fecha_inicio)}
                                </span>
                            )}
                            {proyecto.fecha_fin && (
                                <span>
                                    <i className='ti ti-calendar-due mr-1' />
                                    Fin: {formatFecha(proyecto.fecha_fin)}
                                </span>
                            )}
                        </div>
                    )}

                    {proyecto.integrantes?.length > 0 && (
                        <div className='mb-4'>
                            <div className='mb-1.5 text-[11px] font-medium text-neutral-500'>Equipo actual</div>
                            <div className='flex flex-wrap gap-2'>
                                {proyecto.integrantes.map((i) => {
                                    const iav = avatarColor(i.usuario_id);
                                    return (
                                        <div
                                            key={i.usuario_id}
                                            className='flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-[#232329] py-1 pl-1 pr-3'
                                        >
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${iav.bg} ${iav.text}`}
                                            >
                                                {getInitials(i.nombre_usuario)}
                                            </div>
                                            <span className='text-[11.5px] text-neutral-300'>{i.nombre_usuario}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className='border-t border-white/[0.07] pt-4'>
                        {enviado && (
                            <div className='flex items-center gap-2.5 rounded-[10px] bg-emerald-400/[0.08] px-3.5 py-2.5 text-[12.5px] text-emerald-400'>
                                <i className='ti ti-circle-check text-base' />
                                ¡Postulación enviada! Puedes verla en "Mis postulaciones".
                            </div>
                        )}

                        {!enviado && yaPostulado && (
                            <div className='flex items-center gap-2.5 rounded-[10px] bg-[#2A2A32] px-3.5 py-2.5 text-[12.5px] text-neutral-400'>
                                <i className='ti ti-clock text-amber-400' />
                                Ya tienes una postulación activa en este proyecto.
                            </div>
                        )}

                        {esCreador && (
                            <p className='text-[12.5px] text-neutral-500'>
                                Este es tu proyecto. Gestiona las postulaciones desde "Mis proyectos".
                            </p>
                        )}

                        {esIntegrante && !esCreador && !enviado && (
                            <p className='text-[12.5px] text-neutral-500'>Ya formas parte de este equipo.</p>
                        )}

                        {!puedePostular && !esCreador && !esIntegrante && !yaPostulado && !enviado && (
                            <p className='flex items-center gap-1.5 text-[12.5px] text-neutral-500'>
                                <i className='ti ti-lock' />
                                Este proyecto no está aceptando postulaciones por ahora.
                            </p>
                        )}

                        {puedeMostrarAccion && !mostrarForm && (
                            <button
                                onClick={() => setMostrarForm(true)}
                                className='inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
                            >
                                <i className='ti ti-send text-[14px]' /> Postularme a este proyecto
                            </button>
                        )}

                        {puedeMostrarAccion && mostrarForm && (
                            <form
                                onSubmit={handleEnviar}
                                className='flex flex-col gap-2.5'
                            >
                                {error && (
                                    <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[12px] text-red-400'>
                                        {error}
                                    </div>
                                )}
                                <label className='text-[11px] font-medium text-neutral-500'>
                                    Cuéntale al creador por qué te gustaría unirte
                                </label>
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    rows={4}
                                    placeholder='Ej: Tengo experiencia en React y me interesa aportar en el frontend...'
                                    className='w-full resize-none rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                                />
                                <div className='flex justify-end gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setMostrarForm(false);
                                            setError(null);
                                        }}
                                        className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={enviando}
                                        className='rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                                    >
                                        {enviando ? 'Enviando…' : 'Enviar postulación'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}