import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    listarProyectosRecomendados,
    descartarProyecto,
    listarHabilidadesEnDemanda,
    listarUsuariosSimilares,
} from '../../services/matchingProyecto';
import { obtenerMiPerfil } from '../../services/perfil';
import { getInitials, avatarColor, etiquetaColor, EstadoChip, ModalidadChip, formatFecha } from '../../helpers/matchHelpers';
import ModalShell from './ModalShell';
import armadilloArma from '../../assets/armadillo.png';

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
    search = '',
}) {
    const navigate = useNavigate();

    const [cola, setCola] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [tieneIntereses, setTieneIntereses] = useState(true);
    const [interesesIds, setInteresesIds] = useState(new Set());
    const [misIntereses, setMisIntereses] = useState([]);
    const [salida, setSalida] = useState(null); // 'izquierda' | 'derecha' | null
    // id del primer proyecto "genérico" (0% de match) que sigue después de los recomendados;
    // se calcula una sola vez por carga, así el aviso no se repite al volver a pasar por acá.
    const [primerGenericoId, setPrimerGenericoId] = useState(null);

    // ── panel lateral (solo aporta valor en pantallas anchas, pero se carga siempre) ──
    const [habilidades, setHabilidades] = useState([]);
    const [personasSimilares, setPersonasSimilares] = useState([]);
    const [cargandoPanel, setCargandoPanel] = useState(true);
    const [errorPersonas, setErrorPersonas] = useState(null);
    const [panelMobile, setPanelMobile] = useState(null); // null | 'habilidades' | 'personas' — para las burbujas en mobile

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
            if (perfil) {
                setInteresesIds(new Set(perfil.intereses.map((et) => et.id)));
                setMisIntereses(perfil.intereses);
            }

            // se marca, una sola vez, dónde termina lo recomendado y empieza lo genérico
            const primerConMatch = recomendados.datos.find((p) => (p.porcentaje_match ?? 0) > 0);
            const primerSinMatch = recomendados.datos.find((p) => (p.porcentaje_match ?? 0) === 0);
            setPrimerGenericoId(primerConMatch && primerSinMatch ? primerSinMatch.id : null);
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

    useEffect(() => {
        // cuando se crea/edita un proyecto en otra pestaña, se refresca habilidades en demanda
        // (y la cola, por si hay proyectos nuevos) — pero solo cuando de verdad cambia algo,
        // no cada vez que se vuelve a entrar a "Descubrir".
        function alActualizarProyectos() {
            cargarPanel();
            cargar();
        }
        window.addEventListener('inface:mis-proyectos-actualizados', alActualizarProyectos);
        return () => window.removeEventListener('inface:mis-proyectos-actualizados', alActualizarProyectos);
    }, [cargar, cargarPanel]);

    const colaVisible = useMemo(() => {
        if (!search.trim()) return cola;
        const q = search.trim().toLowerCase();
        return cola.filter(
            (p) =>
                p.titulo.toLowerCase().includes(q) ||
                p.descripcion?.toLowerCase().includes(q) ||
                p.etiquetas?.some((e) => e.nombre.toLowerCase().includes(q)),
        );
    }, [cola, search]);

    const actual = colaVisible[0];
    const siguientes = colaVisible.slice(1, 3);

    function quitarActual() {
        setCola((prev) => prev.filter((p) => p.id !== actual.id));
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
        setTimeout(quitarActual, 380);
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
        if (salida === 'derecha') return 'translate(760px, -40px) rotate(24deg) scale(0.96)';
        if (salida === 'izquierda') return 'translate(-760px, -40px) rotate(-24deg) scale(0.96)';
        return `translate(${dragPos.x}px, ${dragPos.y}px) rotate(${dragPos.x / 14}deg)`;
    }

    function transitionActual() {
        if (drag.current.activo) return 'none';
        if (salida) return 'transform .5s cubic-bezier(.17,.67,.83,.67), box-shadow .4s ease';
        return 'transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease'; // rebote elástico al soltar sin swipe
    }

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
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start'>
            <div className='min-w-0 w-full'>
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
                            <span>{colaVisible.length} proyecto{colaVisible.length === 1 ? '' : 's'} recomendado{colaVisible.length === 1 ? '' : 's'}</span>
                            <span className='inline-flex items-center gap-1'>
                                <i className='ti ti-arrows-left-right text-[13px]' /> Desliza o usa los botones
                            </span>
                        </div>

                        {actual.id === primerGenericoId && (
                            <div className='mb-3 flex items-center gap-2.5 rounded-[10px] border border-sky-500/25 bg-sky-500/10 px-3.5 py-2.5 text-[12px] text-sky-300'>
                                <i className='ti ti-info-circle text-[16px]' />
                                Ya viste los proyectos recomendados según tus intereses. Ahora te mostramos otros
                                proyectos abiertos en general.
                            </div>
                        )}

                        {/* burbujas de acceso rápido (solo mobile: reemplazan los paneles laterales que sí se ven en escritorio) */}
                        <div className='mb-3 flex flex-wrap gap-2 lg:hidden'>
                            <button
                                onClick={() => setPanelMobile('intereses')}
                                className='flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#1E1E24] px-3 py-1.5 text-[11.5px] font-medium text-neutral-300'
                            >
                                <i className='ti ti-tag text-[14px] text-pink-400' /> Mis intereses
                            </button>
                            <button
                                onClick={() => setPanelMobile('habilidades')}
                                className='flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#1E1E24] px-3 py-1.5 text-[11.5px] font-medium text-neutral-300'
                            >
                                <i className='ti ti-trending-up text-[14px] text-pink-400' /> Habilidades en demanda
                            </button>
                            <button
                                onClick={() => setPanelMobile('personas')}
                                className='flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#1E1E24] px-3 py-1.5 text-[11.5px] font-medium text-neutral-300'
                            >
                                <i className='ti ti-users-group text-[14px] text-pink-400' /> Perfiles
                            </button>
                        </div>

                        {/* MAZO DE TARJETAS — ocupa todo el ancho de la columna, del sidebar al panel derecho.
                            El tamaño real lo define una copia invisible (en flujo normal) de la tarjeta activa,
                            así el mazo crece con la descripción en vez de recortarla, y empuja los botones de abajo. */}
                        <div className="relative select-none min-h-[380px]">
                            <div
                                className="invisible"
                                aria-hidden="true"
                            >
                                <TarjetaProyecto
                                    proyecto={actual}
                                    interesesIds={interesesIds}
                                />
                            </div>

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
                                                transition: 'transform .32s cubic-bezier(.34,1.56,.64,1), opacity .32s ease',
                                            }}
                                        />
                                    );
                                })}

                            <div
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerUp}
                                className='absolute inset-0 z-30 cursor-grab touch-none overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1E1E24] active:cursor-grabbing'
                                style={{
                                    transform: transformActual(),
                                    transformOrigin: 'center bottom',
                                    transition: transitionActual(),
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
                                    willChange: 'transform',
                                }}
                            >
                                <TarjetaProyecto
                                    proyecto={actual}
                                    interesesIds={interesesIds}
                                />
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
                                title='Guardar'
                                onClick={() => handleSwipe('derecha')}
                                className='flex h-12 w-12 items-center justify-center rounded-full border border-pink-400/30 bg-pink-500/10 text-pink-400 transition hover:bg-pink-500/20'
                            >
                                <i className='ti ti-bookmark text-[20px]' />
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
                ) : search.trim() && cola.length > 0 ? (
                    <div className='flex flex-col items-center px-5 py-16 text-center'>
                        <i className='ti ti-search-off mb-3 text-5xl text-neutral-700' />
                        <h3 className='mb-1 text-[15px] font-bold text-neutral-300'>Sin resultados para "{search}"</h3>
                        <p className='max-w-[280px] text-[13px] leading-relaxed text-neutral-600'>
                            Ninguno de tus proyectos recomendados coincide con la búsqueda.
                        </p>
                    </div>
                ) : (
                    <div className='flex flex-col items-center px-5 py-16 text-center'>
                        <i className='ti ti-confetti mb-3 text-5xl text-neutral-700' />
                        <h3 className='mb-1 text-[15px] font-bold text-neutral-300'>¡Viste todas las recomendaciones!</h3>
                        <p className='mb-5 max-w-[280px] text-[13px] leading-relaxed text-neutral-600'>
                            Puedes revisar los que te interesaron en "Guardados" o explorar todos los proyectos abiertos.
                        </p>
                        <div className='flex gap-2'>
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

            {/* COLUMNA DERECHA — mis intereses + perfiles similares + habilidades en demanda, todo en un solo bloque, solo escritorio */}
            <div className='hidden lg:block'>
                <div className='sticky top-[70px] divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24]'>
                    <div className='p-5'>
                        <MisInteresesPanel
                            misIntereses={misIntereses}
                            cargando={cargandoPanel}
                            sinBorde
                        />
                    </div>
                    <div className='p-5'>
                        <PersonasPanel
                            personasSimilares={personasSimilares}
                            cargando={cargandoPanel}
                            errorPersonas={errorPersonas}
                            tieneIntereses={interesesIds.size > 0}
                            sinBorde
                        />
                    </div>
                    <div className='p-5'>
                        <HabilidadesPanel
                            habilidades={habilidades}
                            cargando={cargandoPanel}
                            sinBorde
                        />
                    </div>
                </div>
            </div>

            {/* en mobile, las burbujas de arriba abren el mismo contenido en un modal */}
            {panelMobile === 'intereses' && (
                <ModalShell
                    title='Mis intereses'
                    onClose={() => setPanelMobile(null)}
                    maxWidth='max-w-[420px]'
                >
                    <MisInteresesPanel
                        misIntereses={misIntereses}
                        cargando={cargandoPanel}
                        sinBorde
                    />
                </ModalShell>
            )}
            {panelMobile === 'habilidades' && (
                <ModalShell
                    title='Habilidades en demanda'
                    onClose={() => setPanelMobile(null)}
                    maxWidth='max-w-[420px]'
                >
                    <HabilidadesPanel
                        habilidades={habilidades}
                        cargando={cargandoPanel}
                        sinBorde
                    />
                </ModalShell>
            )}
            {panelMobile === 'personas' && (
                <ModalShell
                    title='Perfiles similares al tuyo'
                    onClose={() => setPanelMobile(null)}
                    maxWidth='max-w-[420px]'
                >
                    <PersonasPanel
                        personasSimilares={personasSimilares}
                        cargando={cargandoPanel}
                        errorPersonas={errorPersonas}
                        tieneIntereses={interesesIds.size > 0}
                        sinBorde
                    />
                </ModalShell>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MIS INTERESES: chips con los intereses del propio usuario, de referencia rápida
// ─────────────────────────────────────────────────────────────────────────────

function MisInteresesPanel({ misIntereses, cargando, sinBorde = false }) {
    return (
        <div className={sinBorde ? '' : 'rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-5'}>
            <div className='mb-3.5 flex items-center gap-2'>
                <i className='ti ti-tag text-[16px] text-pink-400' />
                <h3 className='text-[13.5px] font-bold text-neutral-100'>Mis intereses</h3>
            </div>

            {cargando && <p className='text-[12px] text-neutral-600'>Cargando…</p>}

            {!cargando && misIntereses.length === 0 && (
                <p className='text-[12px] leading-relaxed text-neutral-600'>
                    Aún no tienes intereses configurados.{' '}
                    <Link
                        to='/perfil'
                        className='font-semibold text-pink-400 hover:underline'
                    >
                        Agrégalos en tu perfil
                    </Link>{' '}
                    para recibir mejores recomendaciones.
                </p>
            )}

            {!cargando && misIntereses.length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                    {misIntereses.map((et) => {
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
    );
}

function HabilidadesPanel({ habilidades, cargando, sinBorde = false }) {
    return (
        <div className={sinBorde ? '' : 'rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-5'}>
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
    );
}

function PersonasPanel({ personasSimilares, cargando, errorPersonas, tieneIntereses, sinBorde = false }) {
    return (
        <div className={sinBorde ? '' : 'rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-5'}>
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
                            <Link
                                key={p.id}
                                to={`/perfil/usuario/${p.nombre_usuario}`}
                                className='flex items-center gap-2.5 transition hover:opacity-80'
                            >
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
                            </Link>
                        );
                    })}
                </div>
            )}
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
        <div className="flex h-full max-h-[80vh] flex-col overflow-y-auto overflow-x-hidden px-5 py-4 md:px-7 md:py-5">

            {/* CONTENIDO — flex-1 + min-h-0 para que se achique si falta espacio, en vez de empujar el footer fuera de vista */}
            <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_200px_200px]">

                {/* INFO */}
                <div className="flex min-w-0 flex-col justify-center gap-2.5">
                    <div className="line-clamp-2 text-[19px] font-bold leading-tight text-neutral-100 md:text-[21px]">
                        {p.titulo}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        <ModalidadChip modalidad={p.modalidad} />
                        <EstadoChip estado={p.estado} />
                    </div>

                    <p className="text-[13px] leading-relaxed text-neutral-400">
                        {p.descripcion}
                    </p>

                    {p.etiquetas?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {p.etiquetas.slice(0, 8).map((et) => {
                                const coincide = interesesIds.has(et.id);
                                const c = etiquetaColor(et.nombre);
                                return (
                                    <span
                                        key={et.id}
                                        className={`rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${c.bg} ${c.text} ${coincide
                                            ? `${c.border} ring-1 ring-inset ring-current`
                                            : "border-transparent"
                                            }`}
                                    >
                                        {coincide && <i className="ti ti-check mr-1 text-[9px]" />}
                                        {et.nombre}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {(p.fecha_inicio || p.fecha_fin) && (
                        <div className="hidden flex-col gap-1.5 sm:flex">
                            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-neutral-600">
                                Duración
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-neutral-300">
                                {p.fecha_inicio && (
                                    <span className="inline-flex items-center gap-1">
                                        <i className="ti ti-calendar-event text-pink-400" />
                                        {formatFecha(p.fecha_inicio)}
                                    </span>
                                )}
                                {p.fecha_inicio && p.fecha_fin && (
                                    <i className="ti ti-arrow-right text-neutral-600" />
                                )}
                                {p.fecha_fin && (
                                    <span className="inline-flex items-center gap-1">
                                        <i className="ti ti-calendar-due text-pink-400" />
                                        {formatFecha(p.fecha_fin)}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <Link
                        to={`/perfil/usuario/${p.creador?.nombre_usuario}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="mt-0.5 flex items-center gap-2.5 rounded-lg transition hover:opacity-85"
                    >
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold ${av.bg} ${av.text}`}>
                            {getInitials(p.creador?.nombre_usuario)}
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-[13.5px] font-bold text-neutral-100">
                                {p.creador?.nombre_completo || p.creador?.nombre_usuario}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                                u/{p.creador?.nombre_usuario}
                            </div>
                        </div>
                    </Link>
                </div>

                {/* MATCH — columna de 200px, círculo fijo que cabe cómodo en el alto real de la tarjeta */}
                <div className="flex h-full items-center justify-center">
                    <div
                        className="relative flex h-[160px] w-[160px] items-center justify-center rounded-full"
                        style={{ background: `conic-gradient(#E8546A ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
                    >
                        <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[#1E1E24] text-[28px] font-extrabold text-pink-400">
                            {pct}%
                        </div>
                    </div>
                </div>

                {/* ARMADILLO — misma columna de 200px que el match, mismo criterio de tamaño fijo para que el gap se vea parejo en ambos lados */}
                <div className="hidden h-full items-center justify-center md:flex">
                    <img
                        src={armadilloArma}
                        alt=""
                        aria-hidden="true"
                        className="h-[220px] w-auto max-w-[200px] object-contain"
                    />
                </div>
            </div>

            {/* FOOTER — flex-shrink-0: nunca se comprime ni se corta, siempre visible al fondo de la tarjeta */}
            <div className="mt-3 flex flex-shrink-0 flex-col items-center gap-1.5 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2 text-[12px] text-neutral-400">
                    <i className="ti ti-users text-[13px]" />
                    {p.maximo_integrantes ? (
                        <span>{cupos > 0 ? cupos : 0}/{p.maximo_integrantes} cupos</span>
                    ) : (
                        <span>{p.total_integrantes} integrantes</span>
                    )}
                </div>

                {p.integrantes?.length > 0 && (
                    <div className="flex items-center">
                        {p.integrantes.slice(0, 4).map((i, idx) => {
                            const iav = avatarColor(i.usuario_id);
                            return (
                                <div
                                    key={i.usuario_id}
                                    title={i.nombre_usuario}
                                    style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: 5 - idx }}
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1E1E24] text-[8px] font-bold ${iav.bg} ${iav.text}`}
                                >
                                    {getInitials(i.nombre_usuario)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
