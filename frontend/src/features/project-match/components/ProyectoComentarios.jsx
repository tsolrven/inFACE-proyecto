import { useEffect, useState } from 'react';
import CommentThread from '@/shared/post/comments/CommentThread';
import {
    listarComentarios,
    crearComentario,
} from '@/shared/post/comments/comments.api';

function insertarRespuesta(comentarios, padreId, nueva) {
    return comentarios.map((c) => {
        if (c.id === padreId) {
            return { ...c, respuestas: [...(c.respuestas ?? []), nueva] };
        }
        if (c.respuestas?.length) {
            return {
                ...c,
                respuestas: insertarRespuesta(c.respuestas, padreId, nueva),
            };
        }
        return c;
    });
}

function eliminarNodoDelArbol(comentarios, comentarioId) {
    return comentarios
        .filter((c) => c.id !== comentarioId)
        .map((c) =>
            c.respuestas?.length
                ? { ...c, respuestas: eliminarNodoDelArbol(c.respuestas, comentarioId) }
                : c,
        );
}

function marcarComoEliminado(comentarios, comentarioId) {
    return comentarios.map((c) => {
        if (c.id === comentarioId) {
            return { ...c, eliminado: true, contenido: null, autor: null };
        }
        return c.respuestas?.length
            ? {
                ...c,
                respuestas: marcarComoEliminado(c.respuestas, comentarioId),
            }
            : c;
    });
}

function contarComentarios(comentarios) {
    return comentarios.reduce(
        (total, c) =>
            total +
            (c.eliminado ? 0 : 1) +
            (c.respuestas?.length ? contarComentarios(c.respuestas) : 0),
        0,
    );
}

export default function ProyectoComentarios({ proyectoId, onConteoCambio }) {
    const [comentarios, setComentarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [texto, setTexto] = useState('');
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        let cancelado = false;
        listarComentarios(proyectoId, 'proyecto')
            .then((data) => {
                if (cancelado) return;
                setComentarios(data);
                onConteoCambio?.(contarComentarios(data));
            })
            .catch((err) => !cancelado && setError(err.message))
            .finally(() => !cancelado && setCargando(false));
        return () => {
            cancelado = true;
        };

    }, [proyectoId]);

    function actualizar(nuevos) {
        setComentarios(nuevos);
        onConteoCambio?.(contarComentarios(nuevos));
    }

    async function handleEnviar() {
        if (!texto.trim()) return;
        setEnviando(true);
        try {
            const nuevo = await crearComentario(
                proyectoId,
                { contenido: texto },
                'proyecto',
            );
            actualizar([...comentarios, nuevo]);
            setTexto('');
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-4 sm:p-6'>
            <h3 className='mb-4 flex items-center gap-1.5 text-sm font-semibold text-neutral-100'>
                <i className='ti ti-messages text-base text-pink-500' />
                Comentarios ({contarComentarios(comentarios)})
            </h3>

            <div className='mb-6 flex flex-col gap-2 rounded-[10px] border border-white/[0.06] bg-[#111114] p-2.5'>
                <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder='Escribe un comentario o una pregunta sobre este proyecto...'
                    className='w-full resize-none bg-transparent text-[13px] text-neutral-100 outline-none placeholder-neutral-600'
                />
                <div className='flex justify-end'>
                    <button
                        type='button'
                        onClick={handleEnviar}
                        disabled={enviando || !texto.trim()}
                        className='rounded-md bg-pink-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#D43E56] disabled:opacity-50'
                    >
                        {enviando ? 'Enviando...' : 'Comentar'}
                    </button>
                </div>
            </div>

            {error && (
                <p className='mb-3 text-center text-[12.5px] text-red-400'>{error}</p>
            )}

            <div className='flex flex-col gap-4'>
                {cargando && (
                    <p className='text-center text-[12.5px] text-neutral-600'>
                        Cargando comentarios…
                    </p>
                )}
                {!cargando && comentarios.length === 0 && (
                    <p className='text-center text-[12.5px] text-neutral-600'>
                        Todavía no hay comentarios. ¡Sé el primero en preguntar!
                    </p>
                )}
                {comentarios.map((comentario) => (
                    <CommentThread
                        key={comentario.id}
                        comentario={comentario}
                        apunteId={proyectoId}
                        tipoContenido='proyecto'
                        onNuevaRespuesta={(padreId, nueva) =>
                            actualizar(insertarRespuesta(comentarios, padreId, nueva))
                        }
                        onComentarioEliminado={(comentarioId, eliminadoPermanente) =>
                            actualizar(
                                eliminadoPermanente
                                    ? eliminarNodoDelArbol(comentarios, comentarioId)
                                    : marcarComoEliminado(comentarios, comentarioId),
                            )
                        }
                    />
                ))}
            </div>
        </div>
    );
}