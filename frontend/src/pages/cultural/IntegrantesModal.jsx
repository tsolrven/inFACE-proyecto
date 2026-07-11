import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalShell from './ModalShell';
import { getInitials, avatarColor, formatFecha } from '../../helpers/matchHelpers';
import { listarIntegrantes, expulsarIntegrante } from '../../services/matchingProyecto';

export default function IntegrantesModal({ proyecto, esCreador, onClose, onCambio }) {
    const [integrantes, setIntegrantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(null);

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

    async function handleExpulsar(usuarioId) {
        if (!confirm('¿Expulsar a este integrante del proyecto?')) return;
        setProcesando(usuarioId);
        try {
            await expulsarIntegrante(proyecto.id, usuarioId);
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
                    <p className='text-[13px] text-neutral-500'>Todavía no tienes integrantes en este proyecto.</p>
                </div>
            )}

            <div className='flex flex-col gap-2'>
                {integrantes.map((i) => {
                    const av = avatarColor(i.usuario_id);
                    return (
                        <div
                            key={i.usuario_id}
                            className='flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#232329] px-3.5 py-2.5'
                        >
                            <Link
                                to={`/perfil/usuario/${i.nombre_usuario}`}
                                className='flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-80'
                            >
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${av.bg} ${av.text}`}
                                >
                                    {getInitials(i.nombre_usuario)}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <div className='truncate text-[13px] font-semibold text-neutral-100'>
                                        {i.nombre_usuario}
                                    </div>
                                    <div className='text-[11px] text-neutral-500'>
                                        {i.rol_en_proyecto || 'Integrante'} · desde {formatFecha(i.fecha_union)}
                                    </div>
                                </div>
                            </Link>
                            {esCreador && (
                                <button
                                    onClick={() => handleExpulsar(i.usuario_id)}
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
    );
}