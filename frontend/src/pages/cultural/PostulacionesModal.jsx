import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalShell from './ModalShell';
import { getInitials, avatarColor, carreraColor, tiempoRelativo } from '../../helpers/matchHelpers';
import {
    listarPostulacionesProyecto,
    responderPostulacion,
    eliminarPostulacionRechazada,
} from '../../services/matchingProyecto';

export default function PostulacionesModal({ proyecto, onClose, onCambio, verTodas = false, onIrAVerPendientes }) {
    const [postulaciones, setPostulaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(null); 

    async function cargar() {
        setLoading(true);
        setError(null);
        try {
            const data = await listarPostulacionesProyecto(proyecto.id, { todas: verTodas });
            setPostulaciones(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proyecto.id, verTodas]);

    async function handleResponder(postulacionId, estado) {
        setProcesando(postulacionId);
        try {
            await responderPostulacion(proyecto.id, postulacionId, estado);
            await cargar();
            onCambio?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(null);
        }
    }

    async function handleEliminarResuelta(postulacionId) {
        setProcesando(postulacionId);
        try {
            await eliminarPostulacionRechazada(proyecto.id, postulacionId);
            await cargar();
            onCambio?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(null);
        }
    }

    return (
        <ModalShell
            title={verTodas ? 'Historial de postulaciones' : 'Postulaciones'}
            subtitle={proyecto.titulo}
            onClose={onClose}
            maxWidth='max-w-[560px]'
        >
            {loading && <p className='py-6 text-center text-[13px] text-neutral-500'>Cargando…</p>}

            {error && (
                <div className='mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400'>
                    {error}
                </div>
            )}

            {!loading && postulaciones.length === 0 && !error && (
                <div className='flex flex-col items-center py-8 text-center'>
                    <i className='ti ti-inbox mb-2 text-3xl text-neutral-700' />
                    <p className='text-[13px] text-neutral-500'>
                        {verTodas
                            ? 'Este proyecto todavía no ha recibido postulaciones.'
                            : 'Aún no tienes postulaciones pendientes para este proyecto.'}
                    </p>
                </div>
            )}

            <div className='flex flex-col gap-3'>
                {postulaciones.map((p) => {
                    const av = avatarColor(p.postulante?.id);
                    return (
                        <div
                            key={p.id}
                            className='rounded-2xl border border-white/[0.06] bg-[#232329] p-4'
                        >
                            <div className='flex items-start justify-between gap-3'>
                                <Link
                                    to={`/perfil/usuario/${p.postulante?.nombre_usuario}`}
                                    className='flex items-center gap-2.5 transition hover:opacity-80'
                                >
                                    <div
                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${av.bg} ${av.text}`}
                                    >
                                        {getInitials(p.postulante?.nombre_usuario)}
                                    </div>
                                    <div>
                                        <div className='flex items-center gap-1.5 text-[13px] font-semibold text-neutral-100'>
                                            {p.postulante?.nombre_usuario}
                                            {p.postulante?.carrera?.codigo && (
                                                <span
                                                    title={p.postulante.carrera.nombre}
                                                    className={`rounded-full border px-1.5 py-px text-[9.5px] font-bold ${carreraColor(p.postulante.carrera.codigo).bg} ${carreraColor(p.postulante.carrera.codigo).text} ${carreraColor(p.postulante.carrera.codigo).border}`}
                                                >
                                                    {p.postulante.carrera.codigo}
                                                </span>
                                            )}
                                        </div>
                                        <div className='text-[11px] text-neutral-500'>
                                            Postuló {tiempoRelativo(p.fecha_postulacion)}
                                        </div>
                                    </div>
                                </Link>
                                <EstadoPill estado={p.estado} />
                            </div>

                            {p.advertencia && (
                                <div className='mt-2.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[11.5px] text-amber-400'>
                                    <i className='ti ti-alert-triangle mr-1' /> {p.advertencia}
                                </div>
                            )}

                            {p.mensaje && (
                                <p className='mt-2.5 text-[12.5px] leading-relaxed text-neutral-400'>{p.mensaje}</p>
                            )}

                            {p.estado === 'pendiente' && !verTodas && (
                                <div className='mt-3 flex gap-2 border-t border-white/[0.06] pt-3'>
                                    <button
                                        onClick={() => handleResponder(p.id, 'aceptada')}
                                        disabled={procesando === p.id}
                                        className='inline-flex items-center gap-1.5 rounded-[10px] bg-emerald-400/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-400 transition hover:bg-emerald-400/20 disabled:opacity-50'
                                    >
                                        <i className='ti ti-check text-[13px]' /> Aceptar
                                    </button>
                                    <button
                                        onClick={() => handleResponder(p.id, 'rechazada')}
                                        disabled={procesando === p.id}
                                        className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:text-red-400 disabled:opacity-50'
                                    >
                                        <i className='ti ti-x text-[13px]' /> Rechazar
                                    </button>
                                </div>
                            )}

                            {p.estado === 'pendiente' && verTodas && (
                                <button
                                    onClick={onIrAVerPendientes}
                                    className='mt-2.5 flex w-full items-center gap-1.5 border-t border-white/[0.06] pt-2.5 text-left text-[11.5px] text-pink-400 transition hover:text-pink-300'
                                >
                                    <i className='ti ti-arrow-right text-[12px]' />
                                    Todavía sin responder — ir a "Ver postulaciones" para aceptar o rechazar
                                </button>
                            )}

                            {(p.estado === 'rechazada' || p.estado === 'aceptada') && (
                                <div className='mt-3 flex justify-end border-t border-white/[0.06] pt-3'>
                                    <button
                                        onClick={() => handleEliminarResuelta(p.id)}
                                        disabled={procesando === p.id}
                                        className='inline-flex items-center gap-1.5 text-[11.5px] font-medium text-neutral-500 transition hover:text-red-400 disabled:opacity-50'
                                    >
                                        <i className='ti ti-trash text-[13px]' /> Quitar de la lista
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ModalShell>
    );
}

function EstadoPill({ estado }) {
    const map = {
        pendiente: 'border-amber-400/25 bg-amber-400/10 text-amber-400',
        aceptada: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
        rechazada: 'border-white/10 bg-white/[0.06] text-red-400',
    };
    const label = { pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada' };
    return (
        <span
            className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${map[estado] || map.pendiente}`}
        >
            {label[estado] || estado}
        </span>
    );
}