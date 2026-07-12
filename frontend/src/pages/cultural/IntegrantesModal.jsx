import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalShell from './ModalShell';
import ConfirmDialog from './ConfirmDialog';
import { getInitials, avatarColor, etiquetaColor, carreraColor, formatFecha } from '../../helpers/matchHelpers';
import { listarIntegrantes, expulsarIntegrante } from '../../services/matchingProyecto';

export default function IntegrantesModal({ proyecto, esCreador, onClose, onCambio, esVistaExterna = false }) {
    const [integrantes, setIntegrantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(null);
    const [confirmExpulsar, setConfirmExpulsar] = useState(null);

    async function cargar() {
        setLoading(true);
        setError(null);
        try {
            const data = await listarIntegrantes(proyecto.id);
            setIntegrantes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proyecto.id]);

    function handleExpulsar(integrante) {
        setConfirmExpulsar(integrante);
    }

    async function ejecutarExpulsar() {
        const integrante = confirmExpulsar;
        setConfirmExpulsar(null);
        setProcesando(integrante.usuario_id);
        try {
            await expulsarIntegrante(proyecto.id, integrante.usuario_id);
            await cargar();
            onCambio?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(null);
        }
    }

    return (
        <>
            <ModalShell
                title='Integrantes del equipo'
                subtitle={proyecto.titulo}
                onClose={onClose}
                maxWidth='max-w-[480px]'
            >
            {loading && <p className='py-6 text-center text-[13px] text-neutral-500'>Cargando…</p>}

            {error && (
                <div className='mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400'>
                    {error}
                </div>
            )}

            {!loading && integrantes.length === 0 && !error && (
                <div className='flex flex-col items-center py-8 text-center'>
                    <i className='ti ti-users mb-2 text-3xl text-neutral-700' />
                    <p className='text-[13px] text-neutral-500'>
                        {esCreador
                            ? 'Todavía no tienes integrantes en este proyecto.'
                            : 'Todavía no hay más integrantes en este proyecto.'}
                    </p>
                </div>
            )}

            <div className='flex flex-col gap-2'>
                {proyecto.creador && (
                    <div className='flex items-center gap-3 rounded-2xl border border-pink-500/20 bg-pink-500/[0.06] px-3.5 py-2.5'>
                        <Link
                            to={`/perfil/usuario/${proyecto.creador.nombre_usuario}`}
                            replace={esVistaExterna}
                            className='flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-80'
                        >
                            <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${avatarColor(proyecto.creador.id).bg} ${avatarColor(proyecto.creador.id).text}`}
                            >
                                {getInitials(proyecto.creador.nombre_usuario)}
                            </div>
                            <div className='min-w-0 flex-1'>
                                <div className='flex items-center gap-1.5 truncate text-[13px] font-semibold text-neutral-100'>
                                    {proyecto.creador.nombre_usuario}
                                    <i
                                        title='Creador del proyecto'
                                        className='ti ti-crown text-[13px] text-amber-400'
                                    />
                                    {proyecto.creador.carrera?.codigo && (
                                        <span
                                            title={proyecto.creador.carrera.nombre}
                                            className={`rounded-full border px-1.5 py-px text-[9.5px] font-bold ${carreraColor(proyecto.creador.carrera.codigo).bg} ${carreraColor(proyecto.creador.carrera.codigo).text} ${carreraColor(proyecto.creador.carrera.codigo).border}`}
                                        >
                                            {proyecto.creador.carrera.codigo}
                                        </span>
                                    )}
                                </div>
                                <div className='text-[11px] text-neutral-500'>
                                    Creador del proyecto
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
                {integrantes.map((i) => {
                    const av = avatarColor(i.usuario_id);
                    return (
                        <div
                            key={i.usuario_id}
                            className='flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#232329] px-3.5 py-2.5'
                        >
                            <Link
                                to={`/perfil/usuario/${i.nombre_usuario}`}
                                replace={esVistaExterna}
                                className='flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-80'
                            >
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${av.bg} ${av.text}`}
                                >
                                    {getInitials(i.nombre_usuario)}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-1.5 truncate text-[13px] font-semibold text-neutral-100'>
                                        {i.nombre_usuario}
                                        {i.carrera?.codigo && (
                                            <span
                                                title={i.carrera.nombre}
                                                className={`rounded-full border px-1.5 py-px text-[9.5px] font-bold ${carreraColor(i.carrera.codigo).bg} ${carreraColor(i.carrera.codigo).text} ${carreraColor(i.carrera.codigo).border}`}
                                            >
                                                {i.carrera.codigo}
                                            </span>
                                        )}
                                    </div>
                                    <div className='text-[11px] text-neutral-500'>
                                        {i.rol_en_proyecto || 'Integrante'} · desde {formatFecha(i.fecha_union)}
                                    </div>
                                </div>
                            </Link>
                            {esCreador && (
                                <button
                                    onClick={() => handleExpulsar(i)}
                                    disabled={procesando === i.usuario_id}
                                    title='Expulsar del proyecto'
                                    className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50'
                                >
                                    <i className='ti ti-user-x text-[15px]' />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </ModalShell>

            <ConfirmDialog
                open={!!confirmExpulsar}
                title='Expulsar integrante'
                message={confirmExpulsar ? `¿Expulsar a ${confirmExpulsar.nombre_usuario} de este proyecto?` : ''}
                confirmLabel='Expulsar'
                danger
                onConfirm={ejecutarExpulsar}
                onCancel={() => setConfirmExpulsar(null)}
            />
        </>
    );
}