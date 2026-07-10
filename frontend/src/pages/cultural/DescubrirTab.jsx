import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    listarProyectosRecomendados,
    descartarProyecto,
    listarHabilidadesEnDemanda,
    listarUsuariosSimilares,
} from '../../services/matchingProyecto';
import { obtenerMiPerfil } from '../../services/perfil';
import { getInitials, avatarColor, etiquetaColor, EstadoChip, ModalidadChip } from '../../helpers/matchHelpers';

const UMBRAL_SWIPE = 110; // px de arrastre necesarios para confirmar un swipe

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: DESCUBRIR (swipe estilo Tinder) — punto de entrada del módulo de matching
// ─────────────────────────────────────────────────────────────────────────────

export default function DescubrirTab({
    usuario,
    favoritosIds,
    postuladosActivos,
    onToggleFavorito,
    onVerDetalle,
    onPostularClick,
    onIrExplorar,
}) {
    const navigate = useNavigate();

    const [cola, setCola] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [tieneIntereses, setTieneIntereses] = useState(true);
    const [interesesIds, setInteresesIds] = useState(new Set());
    const [salida, setSalida] = useState(null); // 'izquierda' | 'derecha' | null

    // ── panel lateral (solo aporta valor en pantallas anchas, pero se carga siempre) ──
    const [habilidades, setHabilidades] = useState([]);
    const [personasSimilares, setPersonasSimilares] = useState([]);
    const [cargandoPanel, setCargandoPanel] = useState(true);
    const [errorPersonas, setErrorPersonas] = useState(null);

    const drag = useRef({ activo: false, startX: 0, startY: 0, x: 0, y: 0 });
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [recomendados, perfil] = await Promise.all([
                listarProyectosRecomendados({ limite: 30 }),
                obtenerMiPerfil().catch(() => null),
            ]);
            setCola(recomendados.datos);
            setTieneIntereses(recomendados.tieneIntereses);
            if (perfil) setInteresesIds(new Set(perfil.intereses.map((et) => et.id)));
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, []);

    const cargarPanel = useCallback(async () => {
        setCargandoPanel(true);
        setErrorPersonas(null);

        const [habRes, personasRes] = await Promise.allSettled([
            listarHabilidadesEnDemanda({ limite: 8 }),
            listarUsuariosSimilares({ limite: 6 }),
        ]);

        if (habRes.status === 'fulfilled') {
            setHabilidades(habRes.value);
        } else {
            console.error('Error cargando habilidades en demanda:', habRes.reason);
            setHabilidades([]);
        }

        if (personasRes.status === 'fulfilled') {
            setPersonasSimilares(personasRes.value);
        } else {
            console.error('Error cargando perfiles similares:', personasRes.reason);
            setErrorPersonas(personasRes.reason?.message || 'No se pudo cargar');
            setPersonasSimilares([]);
        }

        setCargandoPanel(false);
    }, []);


    useEffect(() => {
        cargar();
        cargarPanel();
    }, [cargar, cargarPanel]);

    const actual = cola[0];
    const siguientes = cola.slice(1, 3);

    function quitarActual() {
        setCola((prev) => prev.slice(1));
        setSalida(null);
        setDragPos({ x: 0, y: 0 });
    }

    function handleSwipe(direccion) {
        if (!actual || salida) return;
        setSalida(direccion);
        if (direccion === 'derecha') {
            // "me interesa" = guardarlo en favoritos (si no lo estaba ya) para revisarlo con calma;
            // el proyecto no vuelve a aparecer aquí porque el backend excluye los ya favoritos
            if (!favoritosIds.has(actual.id)) onToggleFavorito(actual.id);
        } else {
            // "no me interesa" = se descarta de forma permanente, no vuelve a mostrarse en Descubrir
            descartarProyecto(actual.id).catch((err) => {
                // se saca de la cola igual (mejor UX), pero se deja rastro del error para poder depurarlo
                console.error('Error al descartar proyecto:', actual.id, err);
            });
        }
        setTimeout(quitarActual, 300);
    }

    // ── gestos de arrastre (mouse + touch, sin librerías externas) ──
    function onPointerDown(e) {
        if (!actual || salida) return;
        drag.current = { activo: true, startX: e.clientX, startY: e.clientY, x: 0, y: 0 };
        e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    function onPointerMove(e) {
        if (!drag.current.activo) return;
        const x = e.clientX - drag.current.startX;
        const y = e.clientY - drag.current.startY;
        drag.current.x = x;
        drag.current.y = y;
        setDragPos({ x, y });
    }
    function onPointerUp() {
        if (!drag.current.activo) return;
        drag.current.activo = false;
        const { x } = drag.current;
        if (x > UMBRAL_SWIPE) handleSwipe('derecha');
        else if (x < -UMBRAL_SWIPE) handleSwipe('izquierda');
        else setDragPos({ x: 0, y: 0 });
    }

    function transformActual() {
        if (salida === 'derecha') return 'translate(650px, -30px) rotate(20deg) scale(1.04)';
        if (salida === 'izquierda') return 'translate(-650px, -30px) rotate(-20deg) scale(0.96)';
        return `translate(${dragPos.x}px, ${dragPos.y}px) rotate(${dragPos.x / 22}deg)`;
    }

    const likeOpacity = Math.min(Math.max(dragPos.x / UMBRAL_SWIPE, 0), 1);
    const nopeOpacity = Math.min(Math.max(-dragPos.x / UMBRAL_SWIPE, 0), 1);

    // ── estados de carga / error / vacío ──

    if (cargando) {
        return <p className='py-16 text-center text-[13px] text-neutral-500'>Buscando proyectos para ti…</p>;
    }

    if (error) {
        return (
            <div className='mx-auto max-w-md rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-400'>
                No se pudieron cargar tus recomendaciones: {error}
            </div>
        );
    }

    return (
        <div className='mx-auto grid max-w-[940px] gap-8 lg:grid-cols-[420px_1fr] lg:items-start'>
            <div className='mx-auto w-full max-w-[420px]'>
                {!tieneIntereses && (
                    <div className='mb-4 flex items-center gap-3 rounded-[10px] border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-[12px] text-amber-300'>
                        <i className='ti ti-sparkles text-[16px]' />
                        <span className='flex-1'>
                            Aún no configuras tus intereses, así que estas recomendaciones son generales.
                        </span>
                        <button
                            onClick={() => navigate('/perfil')}
                            className='flex-shrink-0 font-semibold underline underline-offset-2'
                        >
                            Configurar
                        </button>
                    </div>
                )}

                {actual ? (
                    <>
                        <div className='mb-3 flex items-center justify-between text-[11.5px] text-neutral-600'>
                            <span>{cola.length} proyecto{cola.length === 1 ? '' : 's'} recomendado{cola.length === 1 ? '' : 's'}</span>
                            <span className='inline-flex items-center gap-1'>
                                <i className='ti ti-arrows-left-right text-[13px]' /> Desliza o usa los botones
                            </span>
                        </div>

                        {/* MAZO DE TARJETAS */}
                        <div className='relative h-[520px] select-none'>
                            {siguientes
                                .slice()
                                .reverse()
                                .map((p, i) => {
                                    const profundidad = siguientes.length - i; // 2, 1
                                    return (
                                        <div
                                            key={p.id}
                                            className='absolute inset-0 rounded-2xl border border-white/[0.06] bg-[#1E1E24]'
                                            style={{
                                                transform: `translateY(${profundidad * 10}px) scale(${1 - profundidad * 0.035})`,
                                                opacity: 1 - profundidad * 0.28,
                                            }}
                                        />
                                    );
                                })}

                            <div
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerUp}
                                className='absolute inset-0 cursor-grab touch-none overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1E1E24] active:cursor-grabbing'
                                style={{
                                    transform: transformActual(),
                                    transition: drag.current.activo ? 'none' : 'transform .32s cubic-bezier(.22,.61,.36,1), box-shadow .32s ease',
                                    boxShadow:
                                        salida === 'derecha'
                                            ? '0 20px 60px rgba(232,84,106,0.45)'
                                            : '0 20px 50px rgba(0,0,0,0.45)',
                                }}
                            >
                                <TarjetaProyecto
                                    proyecto={actual}
                                    interesesIds={interesesIds}
                                />

                                {/* sellos ME INTERESA / PASAR */}
                                <div
                                    className='pointer-events-none absolute left-5 top-6 -rotate-[18deg] rounded-lg border-[3px] border-pink-400 px-3 py-1 text-[18px] font-black tracking-wider text-pink-400'
                                    style={{ opacity: likeOpacity }}
                                >
                                    ME INTERESA
                                </div>
                                <div
                                    className='pointer-events-none absolute right-5 top-6 rotate-[18deg] rounded-lg border-[3px] border-red-400 px-3 py-1 text-[18px] font-black tracking-wider text-red-400'
                                    style={{ opacity: nopeOpacity }}
                                >
                                    PASAR
                                </div>

                                {/* pequeño estallido de corazón al confirmar match */}
                                {salida === 'derecha' && (
                                    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                                        <i className='ti ti-heart-filled animate-ping text-[64px] text-pink-400/70' />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div className='mt-5 flex items-center justify-center gap-3'>
                            <button
                                title='Pasar'
                                onClick={() => handleSwipe('izquierda')}
                                className='flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-[#1E1E24] text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10'
                            >
                                <i className='ti ti-x text-[20px]' />
                            </button>
                            <button
                                title='Ver detalle'
                                onClick={() => onVerDetalle(actual)}
                                className='flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#1E1E24] text-neutral-400 transition hover:text-neutral-100'
                            >
                                <i className='ti ti-info-circle text-[18px]' />
                            </button>
                            {actual.estado === 'abierto' && actual.creador?.id !== usuario?.id && (
                                <button
                                    title='Postularme'
                                    onClick={() => onPostularClick(actual)}
                                    disabled={postuladosActivos.has(actual.id)}
                                    className='flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#1E1E24] text-indigo-400 transition hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-30'
                                >
                                    <i className='ti ti-send text-[18px]' />
                                </button>
                            )}
                            <button
                                title='Me interesa'
                                onClick={() => handleSwipe('derecha')}
                                className='flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 transition hover:bg-emerald-500/20'
                            >
                                <i className='ti ti-heart text-[20px]' />
                            </button>
                        </div>

                        <p className='mt-4 text-center text-[12px] text-neutral-600'>
                            ¿Prefieres verlos todos en lista?{' '}
                            <button
                                onClick={onIrExplorar}
                                className='font-semibold text-pink-500 hover:underline'
                            >
                                Ir a Explorar
                            </button>
                        </p>
                    </>
                ) : (
                    <div className='flex flex-col items-center px-5 py-16 text-center'>
                        <i className='ti ti-confetti mb-3 text-5xl text-neutral-700' />
                        <h3 className='mb-1 text-[15px] font-bold text-neutral-300'>¡Viste todas las recomendaciones!</h3>
                        <p className='mb-5 max-w-[280px] text-[13px] leading-relaxed text-neutral-600'>
                            Puedes revisar los que te interesaron en "Guardados" o explorar todos los proyectos abiertos.
                        </p>
                        <div className='flex gap-2'>
                            <button
                                onClick={cargar}
                                className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-4 py-2 text-[12.5px] font-medium text-neutral-300 transition hover:text-neutral-100'
                            >
                                <i className='ti ti-refresh text-[14px]' /> Buscar de nuevo
                            </button>
                            <button
                                onClick={onIrExplorar}
                                className='inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
                            >
                                <i className='ti ti-compass text-[14px]' /> Ir a Explorar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL LATERAL — solo aporta valor con espacio de escritorio, se oculta en mobile */}
            <div className='hidden lg:block'>
                <PanelLateral
                    habilidades={habilidades}
                    personasSimilares={personasSimilares}
                    cargando={cargandoPanel}
                    interesesIds={interesesIds}
                    errorPersonas={errorPersonas}
                    tieneIntereses={interesesIds.size > 0}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL LATERAL: habilidades en demanda + personas con perfil similar
// ─────────────────────────────────────────────────────────────────────────────

function PanelLateral({ habilidades, personasSimilares, cargando, interesesIds, errorPersonas, tieneIntereses }) {
    return (
        <div className='sticky top-[70px] flex flex-col gap-5'>
            {/* HABILIDADES EN DEMANDA */}
            <div className='rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-5'>
                <div className='mb-3.5 flex items-center gap-2'>
                    <i className='ti ti-trending-up text-[16px] text-pink-400' />
                    <h3 className='text-[13.5px] font-bold text-neutral-100'>Habilidades en demanda</h3>
                </div>

                {cargando && <p className='text-[12px] text-neutral-600'>Cargando…</p>}

                {!cargando && habilidades.length === 0 && (
                    <p className='text-[12px] leading-relaxed text-neutral-600'>
                        Todavía no hay suficientes proyectos abiertos para calcular tendencias.
                    </p>
                )}

                {!cargando && habilidades.length > 0 && (
                    <div className='flex flex-col gap-2.5'>
                        {(() => {
                            const max = Math.max(...habilidades.map((h) => h.total_proyectos), 1);
                            return habilidades.map((h) => {
                                const c = etiquetaColor(h.nombre);
                                return (
                                    <div key={h.id}>
                                        <div className='mb-1 flex items-center justify-between gap-2'>
                                            <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${c.text}`}>
                                                <span
                                                    className='h-2 w-2 flex-shrink-0 rounded-full'
                                                    style={{ background: c.hex }}
                                                />
                                                {h.nombre}
                                                {h.es_interes_propio && (
                                                    <i title='Ya está entre tus intereses' className='ti ti-check text-[11px]' />
                                                )}
                                            </span>
                                            <span className='flex-shrink-0 text-[11px] text-neutral-600'>
                                                {h.total_proyectos} proyecto{h.total_proyectos === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]'>
                                            <div
                                                className='h-full rounded-full transition-all'
                                                style={{ width: `${Math.max((h.total_proyectos / max) * 100, 8)}%`, background: c.hex }}
                                            />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}
            </div>

            {/* PERSONAS CON PERFIL SIMILAR */}
            <div className='rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-5'>
                <div className='mb-3.5 flex items-center gap-2'>
                    <i className='ti ti-users-group text-[16px] text-pink-400' />
                    <h3 className='text-[13.5px] font-bold text-neutral-100'>Perfiles similares al tuyo</h3>
                </div>

                {cargando && <p className='text-[12px] text-neutral-600'>Cargando…</p>}

                {!cargando && errorPersonas && (
                    <p className='text-[12px] leading-relaxed text-red-400'>
                        No se pudieron cargar: {errorPersonas}
                    </p>
                )}

                {!cargando && !errorPersonas && personasSimilares.length === 0 && !tieneIntereses && (
                    <p className='text-[12px] leading-relaxed text-neutral-600'>
                        Agrega intereses a tu perfil para que podamos encontrar personas afines a ti.
                    </p>
                )}

                {!cargando && !errorPersonas && personasSimilares.length === 0 && tieneIntereses && (
                    <p className='text-[12px] leading-relaxed text-neutral-600'>
                        Por ahora no hay otras personas activas que compartan tus intereses.
                    </p>
                )}

                {!cargando && personasSimilares.length > 0 && (
                    <div className='flex flex-col gap-3'>
                        {personasSimilares.map((p) => {
                            const av = avatarColor(p.id);
                            return (
                                <div key={p.id} className='flex items-center gap-2.5'>
                                    <div
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${av.bg} ${av.text}`}
                                    >
                                        {getInitials(p.nombre_usuario)}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <div className='truncate text-[12.5px] font-semibold text-neutral-100'>
                                            {p.nombre_usuario}
                                        </div>
                                        <div className='truncate text-[11px] text-neutral-500'>
                                            {p.etiquetas_compartidas?.slice(0, 2).map((et) => et.nombre).join(', ') || 'Intereses en común'}
                                        </div>
                                    </div>
                                    <div className='flex-shrink-0 rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-bold text-pink-400'>
                                        {p.porcentaje_match}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA
// ─────────────────────────────────────────────────────────────────────────────

function TarjetaProyecto({ proyecto: p, interesesIds }) {
    const av = avatarColor(p.creador?.id);
    const cupos = p.maximo_integrantes ? p.maximo_integrantes - p.total_integrantes : null;
    const pct = p.porcentaje_match ?? 0;

    return (
        <div className='flex h-full flex-col p-[18px]'>
            <div className='mb-2.5 flex items-start justify-between gap-3'>
                <div className='flex flex-wrap gap-1.5'>
                    <EstadoChip estado={p.estado} />
                    <ModalidadChip modalidad={p.modalidad} />
                </div>

                {/* anillo de porcentaje de coincidencia */}
                <div
                    className='relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full'
                    style={{ background: `conic-gradient(#E8546A ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
                >
                    <div className='flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#1E1E24] text-[11px] font-bold text-pink-400'>
                        {pct}%
                    </div>
                </div>
            </div>

            <div className='mb-1.5 text-[16px] font-bold leading-snug text-neutral-100'>{p.titulo}</div>

            <p className='mb-3 line-clamp-4 text-[12.5px] leading-relaxed text-neutral-400'>
                {p.descripcion}
            </p>

            {p.etiquetas?.length > 0 && (
                <div className='mb-3 flex flex-wrap gap-1.5'>
                    {p.etiquetas.slice(0, 8).map((et) => {
                        const coincide = interesesIds.has(et.id);
                        const c = etiquetaColor(et.nombre);
                        return (
                            <span
                                key={et.id}
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text} ${coincide ? `${c.border} ring-1 ring-inset ring-current` : 'border-transparent'
                                    }`}
                            >
                                {coincide && <i className='ti ti-check mr-0.5 text-[9px]' />}
                                {et.nombre}
                            </span>
                        );
                    })}
                </div>
            )}

            <div className='mt-auto flex items-center gap-2 border-t border-white/[0.07] pt-3'>
                <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${av.bg} ${av.text}`}
                >
                    {getInitials(p.creador?.nombre_usuario)}
                </div>
                <div className='text-[12px] text-neutral-400'>
                    <strong className='text-neutral-100'>{p.creador?.nombre_usuario}</strong>
                </div>

                <div className='ml-auto flex items-center gap-1.5 text-[11px] text-neutral-600'>
                    <i className='ti ti-users text-[13px]' />
                    {p.maximo_integrantes ? (
                        <span>{cupos > 0 ? cupos : 0}/{p.maximo_integrantes} cupos</span>
                    ) : (
                        <span>{p.total_integrantes} integrantes</span>
                    )}
                </div>
            </div>
        </div>
    );
}
