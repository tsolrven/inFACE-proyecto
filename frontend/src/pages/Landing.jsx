import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import armadillo from '../assets/armadillo.png';

/*
 * Envuelve una sección para que aparezca suavemente al entrar en el viewport.
 * Sin librerías externas: un IntersectionObserver + clases de Tailwind.
 */
function Reveal({ children, className = '' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-500 motion-reduce:transition-none motion-reduce:transform-none ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                } ${className}`}
        >
            {children}
        </div>
    );
}

/*
 * Cajón de imagen provisorio: borde punteado + ícono + instrucción de reemplazo.
 * Cuando tengas el asset final, reemplaza el <div className="img-slot"> por:
 *   <img src="/ruta-del-archivo.png" alt="..." className="..." />
 */
function ImgSlot({ icon, label, hint, className = '' }) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-white/[0.16] bg-white/[0.02] text-center text-white/30 ${className}`}
        >
            <i className={`ti ${icon}`} />
            <div className='text-[12px] font-medium leading-relaxed'>
                {label}
                {hint && <div className='text-[11px]'>{hint}</div>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGES DE ESTADO DE MÓDULO
// ─────────────────────────────────────────────────────────────────────────────

function BadgeBeta() {
    return (
        <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-emerald-400'>
            <i className='ti ti-flask text-[10px]' /> Beta
        </span>
    );
}

function BadgePorImplementar() {
    return (
        <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-neutral-500'>
            <i className='ti ti-clock text-[10px]' /> Por implementar
        </span>
    );
}

const MODULOS = [
    {
        icon: 'ti-notebook',
        categoria: 'Por carrera',
        titulo: 'Apuntes y códigos',
        descripcion: 'Repositorio organizado por ramo, con búsqueda semántica para encontrar justo lo que necesitas.',
        estado: 'beta',
    },
    {
        icon: 'ti-messages',
        categoria: 'Por carrera',
        titulo: 'Foro por ramos',
        descripcion: 'Preguntas y respuestas con votación, para que el conocimiento quede disponible semestre tras semestre.',
        estado: 'beta',
    },
    {
        icon: 'ti-speakerphone',
        categoria: 'Por carrera',
        titulo: 'Anuncios oficiales',
        descripcion: 'Un canal único del Centro de Estudiantes y tutores, sin depender de canales externos.',
        estado: 'pendiente',
    },
    {
        icon: 'ti-flame',
        categoria: 'Universal',
        titulo: 'Match de proyectos',
        descripcion: 'Encuentra equipo para proyectos académicos o emprendimientos, recomendados según tus intereses.',
        estado: 'beta',
        destacado: true,
    },
    {
        icon: 'ti-palette',
        categoria: 'Universal',
        titulo: 'Espacio cultural',
        descripcion: 'Música, teatro y artes visuales con herramientas propias y audiencia solo universitaria.',
        estado: 'pendiente',
    },
    {
        icon: 'ti-shopping-bag',
        categoria: 'Universal',
        titulo: 'Marketplace',
        descripcion: 'Compra y vende entre estudiantes verificados, sin exponerte a un público general.',
        estado: 'pendiente',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────────────────────────────────────

export default function Landing() {
    return (
        <div className='min-h-screen bg-[#0B0B0D] text-neutral-100 antialiased'>
            {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
            <header className='sticky top-0 z-50 border-b border-white/[0.07] bg-[#0B0B0D]/85 backdrop-blur-md'>
                <nav className='mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-5'>
                    {/* SLOT LOGO — reemplaza por <img src="/logo.svg" className="h-8 w-8" alt="InFACE" /> */}
                    <ImgSlot
                        icon='ti-photo text-[14px]'
                        label=''
                        className='h-8 w-8 flex-shrink-0 rounded-[8px]'
                    />
                    <div className='select-none text-[18px] font-bold tracking-tight'>
                        In<span className='text-pink-500'>FACE</span>
                    </div>

                    <div className='ml-auto hidden items-center gap-8 md:flex'>
                        <a
                            href='#como-funciona'
                            className='text-[13px] text-neutral-400 transition hover:text-neutral-100'
                        >
                            Cómo funciona
                        </a>
                        <a
                            href='#modulos'
                            className='text-[13px] text-neutral-400 transition hover:text-neutral-100'
                        >
                            Módulos
                        </a>
                        <a
                            href='#tecnologia'
                            className='text-[13px] text-neutral-400 transition hover:text-neutral-100'
                        >
                            Tecnología
                        </a>
                    </div>

                    <div className='ml-auto flex items-center gap-2 md:ml-8'>
                        <Link
                            to='/login'
                            className='rounded-[10px] border border-white/[0.09] px-3.5 py-[7px] text-[12.5px] font-medium text-neutral-300 transition hover:border-white/20 hover:text-neutral-100'
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            to='/register'
                            className='rounded-[10px] bg-pink-500 px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
                        >
                            Crear cuenta
                        </Link>
                    </div>
                </nav>
            </header>

            {/* ══════════════════════════ HERO ══════════════════════════ */}
            <section className='relative overflow-hidden'>
                <div
                    className='pointer-events-none absolute inset-0'
                    style={{
                        background:
                            'radial-gradient(ellipse 55% 55% at 12% 5%, rgba(232,84,106,.13) 0%, transparent 60%), radial-gradient(ellipse 45% 45% at 95% 20%, rgba(99,102,241,.12) 0%, transparent 60%)',
                    }}
                />

                <div className='relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-16 md:pb-24 md:pt-20 lg:grid-cols-2'>
                    <Reveal>
                        <span className='inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[10.5px] uppercase tracking-widest text-indigo-400'>
                            <i className='ti ti-building-bank text-[13px]' /> FACE · Universidad del Bío-Bío
                        </span>

                        <h1 className='mt-5 text-[36px] font-bold leading-[1.12] tracking-tight text-neutral-50 md:text-[46px]'>
                            La comunidad de tu facultad, ahora en un solo lugar.
                        </h1>

                        <p className='mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-400 md:text-[16px]'>
                            Apuntes, dudas de ramos, anuncios oficiales, equipos de proyecto, expresiones artísticas y
                            compraventa entre estudiantes. Todo centralizado, verificado con tu correo institucional y
                            pensado para las 5 carreras de la FACE.
                        </p>

                        <div className='mt-8 flex flex-wrap items-center gap-3'>
                            <Link
                                to='/register'
                                className='inline-flex items-center gap-2 rounded-[10px] bg-pink-500 px-5 py-3 text-[13.5px] font-semibold text-white transition hover:bg-pink-600 active:scale-[.98]'
                            >
                                Crear cuenta gratis
                                <i className='ti ti-arrow-right text-[15px]' />
                            </Link>
                            <Link
                                to='/login'
                                className='inline-flex items-center gap-2 rounded-[10px] border border-white/[0.09] px-5 py-3 text-[13.5px] font-medium text-neutral-300 transition hover:border-white/20 hover:text-neutral-100'
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>

                        <p className='mt-5 flex items-center gap-1.5 text-[12px] text-neutral-600'>
                            <i className='ti ti-shield-check text-[14px] text-emerald-400' />
                            Acceso exclusivo con correo institucional. Sin costo para estudiantes.
                        </p>
                    </Reveal>

                    {/* MASCOTA */}
                    <Reveal className='relative mx-auto w-full max-w-md'>
                        <div className='absolute -inset-6 -z-10 rounded-full bg-gradient-to-br from-pink-500/15 via-transparent to-indigo-500/15 blur-3xl' />
                        <img
                            src={armadillo}
                            alt='Mascota InFACE'
                            className='mx-auto w-full max-w-md'
                        />
                    </Reveal>
                </div>
            </section>

            {/* ══════════════════════════ FRANJA DE CONFIANZA ══════════════════════════ */}
            <section className='border-y border-white/[0.06] bg-white/[0.015]'>
                <div className='mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4'>
                    {[
                        { valor: '5', label: 'Carreras de la FACE' },
                        { valor: '6', label: 'Módulos integrados' },
                        { valor: '100%', label: 'Comunidad verificada', pink: true },
                        { valor: 'IA', label: 'Búsqueda y recomendación' },
                    ].map((s) => (
                        <Reveal
                            key={s.label}
                            className='px-6 py-8 text-center'
                        >
                            <div className={`text-[26px] font-bold ${s.pink ? 'text-pink-500' : 'text-neutral-50'}`}>{s.valor}</div>
                            <div className='mt-1 text-[11.5px] text-neutral-500'>{s.label}</div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════ CÓMO FUNCIONA ══════════════════════════ */}
            <section
                id='como-funciona'
                className='mx-auto max-w-6xl px-5 py-24'
            >
                <Reveal className='mb-14 max-w-xl'>
                    <span className='font-mono text-[10.5px] uppercase tracking-widest text-indigo-400'>Cómo funciona</span>
                    <h2 className='mt-3 text-[30px] font-bold tracking-tight text-neutral-50 md:text-[34px]'>
                        Empezar toma menos de un minuto.
                    </h2>
                </Reveal>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {[
                        { n: 1, titulo: 'Crea tu cuenta', texto: 'Regístrate con tu correo institucional y arma tu perfil integral: académico, artístico o emprendedor.' },
                        { n: 2, titulo: 'Cuéntanos tus intereses', texto: 'Elige tus habilidades y temas de interés para que el sistema recomiende contenido y proyectos afines a ti.' },
                        { n: 3, titulo: 'Participa en tu facultad', texto: 'Sube apuntes, responde dudas, únete a proyectos, comparte tu arte o publica en el marketplace.' },
                    ].map((paso) => (
                        <Reveal key={paso.n}>
                            <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/10 text-[15px] font-bold text-pink-400'>
                                {paso.n}
                            </div>
                            <h3 className='mb-2 text-[15px] font-bold text-neutral-100'>{paso.titulo}</h3>
                            <p className='text-[13px] leading-relaxed text-neutral-500'>{paso.texto}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════ MÓDULOS ══════════════════════════ */}
            <section
                id='modulos'
                className='mx-auto max-w-6xl px-5 py-24'
            >
                <Reveal className='mb-14 max-w-xl'>
                    <span className='font-mono text-[10.5px] uppercase tracking-widest text-indigo-400'>La plataforma</span>
                    <h2 className='mt-3 text-[30px] font-bold tracking-tight text-neutral-50 md:text-[34px]'>
                        Seis módulos, una sola cuenta.
                    </h2>
                </Reveal>

                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                    {MODULOS.map((m) => (
                        <Reveal key={m.titulo}>
                            <div
                                className={`h-full rounded-2xl border p-6 transition ${m.destacado
                                    ? 'border-pink-500/20 bg-gradient-to-b from-pink-500/[0.06] to-transparent hover:border-pink-500/40'
                                    : m.estado === 'pendiente'
                                        ? 'border-white/[0.06] bg-[#1E1E24]/60 opacity-70 hover:border-white/[0.14] hover:opacity-100'
                                        : 'border-white/[0.06] bg-[#1E1E24] hover:border-white/[0.14]'
                                    }`}
                            >
                                <div className='mb-4 flex items-start justify-between gap-2'>
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${m.destacado
                                            ? 'bg-pink-500/10 text-pink-400'
                                            : m.estado === 'pendiente'
                                                ? 'bg-white/[0.05] text-neutral-500'
                                                : 'bg-indigo-500/10 text-indigo-400'
                                            }`}
                                    >
                                        <i className={`ti ${m.icon} text-[19px]`} />
                                    </div>
                                    {m.estado === 'beta' ? <BadgeBeta /> : <BadgePorImplementar />}
                                </div>
                                <div className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${m.destacado ? 'text-pink-500/70' : 'text-neutral-600'}`}>
                                    {m.categoria}
                                </div>
                                <h3 className={`mb-1.5 text-[15px] font-bold ${m.estado === 'pendiente' ? 'text-neutral-300' : 'text-neutral-100'}`}>
                                    {m.titulo}
                                </h3>
                                <p className='text-[13px] leading-relaxed text-neutral-500'>{m.descripcion}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════ VISTA PREVIA DEL PRODUCTO ══════════════════════════ */}
            <section className='mx-auto max-w-6xl px-5 py-24'>
                <div className='grid grid-cols-1 items-center gap-14 lg:grid-cols-2'>
                    {/* SLOT CAPTURA — reemplaza por <img src="/captura-app.png" alt="Vista de InFACE" className="w-full rounded-2xl" /> */}
                    <Reveal className='lg:order-2'>
                        <ImgSlot
                            icon='ti-device-desktop text-[44px]'
                            label='Espacio para captura de pantalla de la plataforma'
                            hint='(PNG/JPG, sugerido 1200×900px)'
                            className='aspect-[4/3] w-full rounded-2xl p-8'
                        />
                    </Reveal>

                    <Reveal className='lg:order-1'>
                        <span className='font-mono text-[10.5px] uppercase tracking-widest text-indigo-400'>Perfil integral</span>
                        <h2 className='mt-3 text-[28px] font-bold tracking-tight text-neutral-50 md:text-[32px]'>
                            Una identidad, todas tus facetas.
                        </h2>
                        <p className='mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400'>
                            Tu perfil reúne lo académico, lo artístico y lo emprendedor en un solo lugar, con intereses que
                            puedes editar cuando quieras para recibir mejores recomendaciones.
                        </p>
                        <ul className='mt-5 space-y-2.5 text-[13px] text-neutral-400'>
                            <li className='flex items-center gap-2'>
                                <i className='ti ti-check text-[15px] text-emerald-400' />
                                Intereses editables que alimentan las recomendaciones
                            </li>
                            <li className='flex items-center gap-2'>
                                <i className='ti ti-check text-[15px] text-emerald-400' />
                                Historial de proyectos, apuntes y participación
                            </li>
                            <li className='flex items-center gap-2'>
                                <i className='ti ti-check text-[15px] text-emerald-400' />
                                Roles diferenciados: estudiante, tutor, CEE, administración
                            </li>
                        </ul>
                    </Reveal>
                </div>
            </section>

            {/* ══════════════════════════ TECNOLOGÍA ══════════════════════════ */}
            <section
                id='tecnologia'
                className='mx-auto max-w-6xl px-5 py-24'
            >
                <Reveal className='mb-14 max-w-xl'>
                    <span className='font-mono text-[10.5px] uppercase tracking-widest text-indigo-400'>Bajo el capó</span>
                    <h2 className='mt-3 text-[30px] font-bold tracking-tight text-neutral-50 md:text-[34px]'>
                        Con inteligencia artificial desde el diseño.
                    </h2>
                </Reveal>

                <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
                    {[
                        { icon: 'ti-search', titulo: 'Búsqueda semántica', texto: 'Encuentra contenido describiendo lo que necesitas, no adivinando la palabra exacta.' },
                        { icon: 'ti-shield-lock', titulo: 'Moderación automática', texto: 'Contenido inapropiado y nombres de usuario ofensivos se filtran antes de publicarse.' },
                        { icon: 'ti-heart-handshake', titulo: 'Recomendación por etiquetas', texto: 'Cada proyecto y contenido se compara con tus intereses para sugerirte lo más afín.', destacado: true },
                    ].map((t) => (
                        <Reveal key={t.titulo}>
                            <div className={`h-full rounded-2xl border p-6 ${t.destacado ? 'border-pink-500/20 bg-pink-500/[0.04]' : 'border-white/[0.06] bg-[#1E1E24]'}`}>
                                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] ${t.destacado ? 'bg-pink-500/10 text-pink-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                    <i className={`ti ${t.icon} text-[18px]`} />
                                </div>
                                <h3 className='mb-1.5 text-[14px] font-bold text-neutral-100'>{t.titulo}</h3>
                                <p className='text-[12.5px] leading-relaxed text-neutral-500'>{t.texto}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════ CTA FINAL ══════════════════════════ */}
            <section className='mx-auto max-w-6xl px-5 pb-24'>
                <Reveal className='relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#1E1E24] px-8 py-14 md:px-14'>
                    <div
                        className='pointer-events-none absolute inset-0'
                        style={{ background: 'radial-gradient(ellipse 60% 100% at 20% 0%, rgba(232,84,106,.12) 0%, transparent 70%)' }}
                    />
                    <div className='relative flex flex-col items-center gap-10 text-center lg:flex-row lg:text-left'>
                        <div className='flex-1'>
                            <h2 className='text-[26px] font-bold tracking-tight text-neutral-50 md:text-[30px]'>
                                Únete a la comunidad de tu facultad.
                            </h2>
                            <p className='mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400 lg:mx-0'>
                                Crea tu cuenta con tu correo institucional y empieza a formar parte de InFACE hoy mismo.
                            </p>
                            <Link
                                to='/register'
                                className='mt-7 inline-flex items-center gap-2 rounded-[10px] bg-pink-500 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-pink-600 active:scale-[.98]'
                            >
                                Crear mi cuenta InFACE
                                <i className='ti ti-arrow-right text-[16px]' />
                            </Link>
                        </div>

                        {/* MASCOTA - CAMBIAR AL LOGO CUANDO ME LO PASE EL VICTOR */}
                        <img
                            src={armadillo}
                            alt='Mascota InFACE'
                            className='h-32 w-32 flex-shrink-0 object-contain'
                        />
                    </div>
                </Reveal>
            </section>

            {/* ══════════════════════════ FOOTER ══════════════════════════ */}
            <footer className='border-t border-white/[0.06] px-5 py-10'>
                <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row'>
                    <div className='flex items-center gap-2.5 text-center md:text-left'>
                        {/* SLOT LOGO (footer) */}
                        <ImgSlot
                            icon='ti-photo text-[11px]'
                            label=''
                            className='h-7 w-7 flex-shrink-0 rounded-[7px]'
                        />
                        <div>
                            <div className='text-[14px] font-bold tracking-tight'>
                                In<span className='text-pink-500'>FACE</span>
                            </div>
                            <p className='text-[11px] text-neutral-600'>Facultad de Ciencias Empresariales · Universidad del Bío-Bío</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 text-[12px] text-neutral-500'>
                        <Link
                            to='/login'
                            className='transition hover:text-neutral-200'
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            to='/register'
                            className='transition hover:text-neutral-200'
                        >
                            Crear cuenta
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
