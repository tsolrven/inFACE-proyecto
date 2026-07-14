import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    listarProyectosRecomendados,
    listarProyectos,
} from '../services/matchingProyecto';
import { listarApuntes } from '../services/repositorioMateriales/apunte.service';
import {
    getInitials,
    avatarColor,
    ModalidadChip,
    EstadoChip,
} from '../helpers/matchHelpers';
import { colorPorRamo } from '../utils/ramoColors';
import { formatearTiempoRelativo } from '../utils/formatRelativeTime';
import { navSections } from '../config/navConfig';

// ─────────────────────────────────────────────────────────────────────────────
// HOME — vista general con preview de los módulos ya implementados
// ─────────────────────────────────────────────────────────────────────────────

// paths de los módulos que ya tienen contenido funcional; el resto del navConfig
// se muestra abajo como "próximamente" para que no se sienta como que falta algo
const MODULOS_IMPLEMENTADOS = ['/match-proyectos', '/repositorio-materiales'];

export default function Inicio() {
    const usuario = useAuthStore((s) => s.usuario);

    const nombre = usuario?.nombre_completo || usuario?.nombre_usuario || '';
    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

    const modulosProximamente = navSections
        .flatMap((s) => s.items)
        .filter((item) => !MODULOS_IMPLEMENTADOS.includes(item.path));

    return (
        <div className='mx-auto flex max-w-[1100px] flex-col gap-8 px-5 py-8 md:px-8'>
            {/* SALUDO */}
            <div>
                <h1 className='text-[22px] font-bold leading-tight text-neutral-100 md:text-[26px]'>
                    {saludo}{nombre ? `, ${nombre}` : ''} 
                </h1>
                <p className='mt-1.5 text-[13px] text-neutral-500'>
                    Esto es lo que está pasando en InFACE ahora mismo.
                </p>
            </div>

            <PreviewMatchProyectos />
            <PreviewRepositorioMateriales />

            {modulosProximamente.length > 0 && (
                <ProximamentePanel modulos={modulosProximamente} />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CABECERA DE SECCIÓN reutilizable — ícono + título + link "ver todo"
// ─────────────────────────────────────────────────────────────────────────────

function SeccionHeader({ icon, iconColor, iconBg, title, subtitle, to }) {
    return (
        <div className='mb-4 flex items-center gap-3'>
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border ${iconBg}`}>
                <i className={`ti ${icon} text-[18px] ${iconColor}`} />
            </div>
            <div className='min-w-0 flex-1'>
                <h2 className='text-[15.5px] font-bold text-neutral-100'>{title}</h2>
                {subtitle && <p className='text-[11.5px] text-neutral-600'>{subtitle}</p>}
            </div>
            <Link
                to={to}
                className='flex flex-shrink-0 items-center gap-1 text-[12.5px] font-semibold text-pink-500 transition hover:text-pink-400'
            >
                Ver todo <i className='ti ti-arrow-right text-[13px]' />
            </Link>
        </div>
    );
}

function SeccionVacia({ icon, mensaje }) {
    return (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-5 py-10 text-center'>
            <i className={`ti ${icon} mb-2 text-4xl text-neutral-700`} />
            <p className='text-[12.5px] text-neutral-600'>{mensaje}</p>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className='animate-pulse rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4'>
            <div className='mb-3 h-3.5 w-2/3 rounded bg-white/[0.06]' />
            <div className='mb-2 h-2.5 w-1/3 rounded bg-white/[0.05]' />
            <div className='h-2.5 w-full rounded bg-white/[0.05]' />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW: MATCH DE PROYECTOS
// ─────────────────────────────────────────────────────────────────────────────

function PreviewMatchProyectos() {
    const [proyectos, setProyectos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let activo = true;
        (async () => {
            try {
                const recomendados = await listarProyectosRecomendados({ limite: 3 });
                if (!activo) return;
                if (recomendados.datos.length > 0) {
                    setProyectos(recomendados.datos.slice(0, 3));
                } else {
                    // sin recomendaciones (ej. cuenta nueva) → mostramos proyectos abiertos en general
                    const { datos } = await listarProyectos({ estado: 'abierto', limite: 3 });
                    if (activo) setProyectos(datos.slice(0, 3));
                }
            } catch {
                if (activo) setProyectos([]);
            } finally {
                if (activo) setCargando(false);
            }
        })();
        return () => {
            activo = false;
        };
    }, []);

    return (
        <section>
            <SeccionHeader
                icon='ti-puzzle'
                iconColor='text-pink-400'
                iconBg='bg-pink-500/10 border-pink-500/25'
                title='Match de Proyectos'
                subtitle='Encuentra equipos y proyectos afines a tus intereses'
                to='/match-proyectos'
            />

            {cargando && (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!cargando && proyectos.length === 0 && (
                <SeccionVacia
                    icon='ti-puzzle-off'
                    mensaje='Todavía no hay proyectos abiertos para mostrar.'
                />
            )}

            {!cargando && proyectos.length > 0 && (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    {proyectos.map((p) => (
                        <MiniProyectoCard key={p.id} proyecto={p} />
                    ))}
                </div>
            )}
        </section>
    );
}

function MiniProyectoCard({ proyecto: p }) {
    const av = avatarColor(p.creador?.id);
    const pct = p.porcentaje_match;
    const cupos = p.maximo_integrantes ? p.maximo_integrantes - p.total_integrantes : null;

    return (
        <Link
            to='/match-proyectos'
            className='flex flex-col gap-2.5 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:border-white/[0.14]'
        >
            <div className='flex items-start justify-between gap-2'>
                <div className='flex flex-wrap gap-1.5'>
                    <ModalidadChip modalidad={p.modalidad} />
                    <EstadoChip estado={p.estado} />
                </div>
                {typeof pct === 'number' && (
                    <span className='flex-shrink-0 rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-bold text-pink-400'>
                        {pct}%
                    </span>
                )}
            </div>

            <h3 className='line-clamp-2 text-[13.5px] font-bold leading-snug text-neutral-100'>
                {p.titulo}
            </h3>

            <p className='line-clamp-2 flex-1 text-[12px] leading-relaxed text-neutral-500'>
                {p.descripcion}
            </p>

            <div className='flex items-center justify-between border-t border-white/[0.06] pt-2.5'>
                <div className='flex min-w-0 items-center gap-1.5'>
                    <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${av.bg} ${av.text}`}>
                        {getInitials(p.creador?.nombre_usuario)}
                    </div>
                    <span className='truncate text-[11px] text-neutral-500'>
                        u/{p.creador?.nombre_usuario}
                    </span>
                </div>
                {p.maximo_integrantes != null && (
                    <span className='flex-shrink-0 text-[11px] text-neutral-600'>
                        {cupos > 0 ? cupos : 0}/{p.maximo_integrantes} cupos
                    </span>
                )}
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW: REPOSITORIO DE MATERIALES
// ─────────────────────────────────────────────────────────────────────────────

function PreviewRepositorioMateriales() {
    const [apuntes, setApuntes] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let activo = true;
        (async () => {
            try {
                const { apuntes: datos } = await listarApuntes({ limite: 3, orden: 'recientes' });
                if (activo) setApuntes(datos);
            } catch {
                if (activo) setApuntes([]);
            } finally {
                if (activo) setCargando(false);
            }
        })();
        return () => {
            activo = false;
        };
    }, []);

    return (
        <section>
            <SeccionHeader
                icon='ti-books'
                iconColor='text-blue-400'
                iconBg='bg-blue-400/10 border-blue-400/25'
                title='Repositorio de Materiales'
                subtitle='Lo último que compartió la comunidad'
                to='/repositorio-materiales'
            />

            {cargando && (
                <div className='flex flex-col gap-2.5'>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!cargando && apuntes.length === 0 && (
                <SeccionVacia
                    icon='ti-mood-empty'
                    mensaje='Aún no hay materiales publicados.'
                />
            )}

            {!cargando && apuntes.length > 0 && (
                <div className='flex flex-col gap-2.5'>
                    {apuntes.map((a) => (
                        <MiniApunteCard key={a.id} apunte={a} />
                    ))}
                </div>
            )}
        </section>
    );
}

function MiniApunteCard({ apunte: a }) {
    const ramoColor = colorPorRamo(a.ramo?.id);

    return (
        <Link
            to={`/repositorio-materiales/${a.id}`}
            className='flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-4 py-3 transition hover:border-white/[0.14]'
        >
            <div className='min-w-0 flex-1'>
                <div className='mb-1 flex flex-wrap items-center gap-1.5'>
                    <span
                        className='rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
                        style={{ background: `${ramoColor}22`, color: ramoColor }}
                    >
                        {a.ramo?.nombre}
                    </span>
                    <span className='text-[11px] text-neutral-600'>
                        u/{a.autor?.nombre_usuario} · {formatearTiempoRelativo(a.creado_en)}
                    </span>
                </div>
                <h3 className='truncate text-[13px] font-semibold text-neutral-100'>
                    {a.titulo}
                </h3>
            </div>

            <div className='flex flex-shrink-0 items-center gap-3 text-[11.5px] text-neutral-500'>
                <span className='flex items-center gap-1'>
                    <i className='ti ti-arrow-big-up text-[13px]' /> {a.votos_neto ?? 0}
                </span>
                <span className='flex items-center gap-1'>
                    <i className='ti ti-message-circle-2 text-[13px]' /> {a.comentarios_count ?? 0}
                </span>
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRÓXIMAMENTE — el resto de módulos del navConfig que todavía no tienen contenido
// ─────────────────────────────────────────────────────────────────────────────

function ProximamentePanel({ modulos }) {
    return (
        <section>
            <div className='mb-3.5 flex items-center gap-2'>
                <i className='ti ti-hammer text-[16px] text-neutral-500' />
                <h2 className='text-[13.5px] font-bold text-neutral-300'>Próximamente</h2>
            </div>
            <div className='flex flex-wrap gap-2'>
                {modulos.map((m) => (
                    <span
                        key={m.path}
                        title='Todavía en desarrollo'
                        className='flex cursor-default items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#1E1E24] px-3 py-1.5 text-[11.5px] font-medium text-neutral-600'
                    >
                        <i className={`ti ${m.icon} text-[13px]`} />
                        {m.label}
                    </span>
                ))}
            </div>
        </section>
    );
}
