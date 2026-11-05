import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import armadillo from '@/assets/armadillo.png';

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

function ArrowRight({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      className={className}
      aria-hidden='true'
    >
      <path
        d='M4 12h16M13 5l7 7-7 7'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

const FACETAS = [
  {
    icon: 'ti-school',
    label: 'Académico',
    angulo: 0,
    clase: 'border-indigo-400/40 bg-indigo-500/15 text-indigo-300',
  },
  {
    icon: 'ti-palette',
    label: 'Artístico',
    angulo: 120,
    clase: 'border-pink-400/40 bg-pink-500/15 text-pink-300',
  },
  {
    icon: 'ti-rocket',
    label: 'Emprendedor',
    angulo: 240,
    clase: 'border-amber-400/40 bg-amber-500/15 text-amber-300',
  },
];

function PerfilOrbita() {
  return (
    <div
      className='relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121216]'
      role='img'
      aria-label='Ilustración: tu perfil en el centro, rodeado de tus facetas académica, artística y emprendedora'
    >
      <style>{`
        @keyframes lp-orbit { to { transform: rotate(360deg); } }
        @keyframes lp-counter {
          from { transform: rotate(calc(var(--a) * -1)); }
          to { transform: rotate(calc(var(--a) * -1 - 360deg)); }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        @keyframes lp-ring {
          0% { transform: scale(.85); opacity: .55; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes lp-toast {
          0%, 8% { opacity: 0; transform: translateY(14px) scale(.96); }
          16%, 62% { opacity: 1; transform: translateY(0) scale(1); }
          72%, 100% { opacity: 0; transform: translateY(-8px) scale(.98); }
        }
        .lp-orbit { animation: lp-orbit 32s linear infinite; }
        .lp-counter { animation: lp-counter 32s linear infinite; }
        .lp-float { animation: lp-float 5s ease-in-out infinite; }
        .lp-ring { animation: lp-ring 3.2s ease-out infinite; }
        .lp-toast { animation: lp-toast 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lp-orbit, .lp-counter, .lp-float, .lp-ring, .lp-toast { animation: none; }
          .lp-toast { opacity: 1; }
        }
      `}</style>

      {/* fondo: puntos + resplandores */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(232,84,106,.16) 0%, transparent 52%), radial-gradient(circle at 92% 8%, rgba(99,102,241,.16) 0%, transparent 40%), radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 22px 22px',
        }}
      />

      {/* órbita */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='relative aspect-square h-[74%]'>
          <div className='absolute inset-0 rounded-full border border-dashed border-white/[0.14]' />
          <div className='absolute inset-[17%] rounded-full border border-white/[0.06]' />

          <div className='lp-orbit absolute inset-0'>
            {FACETAS.map((f) => (
              <div
                key={f.label}
                className='absolute inset-0'
                style={{ transform: `rotate(${f.angulo}deg)` }}
              >
                <div
                  className='lp-counter absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2'
                  style={{ '--a': `${f.angulo}deg` }}
                >
                  <div className='flex flex-col items-center gap-1'>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm sm:h-12 sm:w-12 ${f.clase}`}
                    >
                      <i className={`ti ${f.icon} text-[20px]`} />
                    </div>
                    <span className='rounded-full bg-black/50 px-2 py-0.5 text-[9.5px] font-semibold text-neutral-300'>
                      {f.label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* perfil al centro */}
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
            <div className='relative flex flex-col items-center'>
              <span className='lp-ring absolute top-0 h-16 w-16 rounded-full border border-pink-400/50' />
              <span
                className='lp-ring absolute top-0 h-16 w-16 rounded-full border border-pink-400/40'
                style={{ animationDelay: '1.6s' }}
              />
              <div className='relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 shadow-[0_0_32px_rgba(232,84,106,.45)]'>
                <i className='ti ti-user text-[28px] text-white' />
              </div>
              <div className='mt-2 text-[12.5px] font-bold text-neutral-100'>
                Tu perfil
              </div>
              <div className='text-[10px] text-neutral-500'>
                Intereses editables
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* intereses flotando */}
      <span className='lp-float absolute left-[4%] top-[8%] rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-[10.5px] font-semibold text-indigo-300'>
        # Desarrollo Web
      </span>
      <span
        className='lp-float absolute right-[4%] top-[8%] hidden rounded-full border border-pink-400/30 bg-pink-500/10 px-2.5 py-1 text-[10.5px] font-semibold text-pink-300 sm:inline-block'
        style={{ animationDelay: '1.4s' }}
      >
        # Design Thinking
      </span>
      <span
        className='lp-float absolute bottom-[8%] left-[4%] hidden rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-300 sm:inline-block'
        style={{ animationDelay: '2.6s' }}
      >
        # Sustentabilidad
      </span>

      {/* aviso de match */}
      <div className='lp-toast absolute bottom-[6%] right-[5%] flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#1E1E24]/95 px-3 py-2 shadow-xl backdrop-blur'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400'>
          <i className='ti ti-flame text-[17px]' />
        </div>
        <div>
          <div className='text-[11.5px] font-bold text-neutral-100'>
            ¡Nuevo match!
          </div>
          <div className='text-[10px] text-neutral-500'>
            Proyecto afín a tus intereses
          </div>
        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// PALETA DE COLORES POR MÓDULO/TECNOLOGÍA
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_CLASSES = {
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    bar: 'bg-pink-500',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]',
    label: 'text-neutral-600',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    bar: 'bg-indigo-500',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]',
    label: 'text-neutral-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    bar: 'bg-cyan-500',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]',
    label: 'text-neutral-600',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]',
    label: 'text-neutral-600',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]',
    label: 'text-neutral-600',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    bar: 'bg-violet-500',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]',
    label: 'text-neutral-600',
  },
  gray: {
    bg: 'bg-white/[0.05]',
    text: 'text-neutral-500',
    bar: 'bg-white/15',
    border: 'border-white/[0.06] hover:border-white/[0.14]',
    wash: 'bg-[#1E1E24]/60',
    label: 'text-neutral-600',
  },
};

const MODULOS = [
  {
    icon: 'ti-notebook',
    categoria: 'Por carrera',
    titulo: 'Apuntes y códigos',
    descripcion:
      'Repositorio organizado por ramo, con búsqueda semántica para encontrar justo lo que necesitas.',
    estado: 'beta',
    color: 'indigo',
  },
  {
    icon: 'ti-messages',
    categoria: 'Por carrera',
    titulo: 'Foro por ramos',
    descripcion:
      'Preguntas y respuestas con votación, para que el conocimiento quede disponible semestre tras semestre.',
    estado: 'pendiente',
  },
  {
    icon: 'ti-speakerphone',
    categoria: 'Por carrera',
    titulo: 'Anuncios oficiales',
    descripcion:
      'Un canal único del Centro de Estudiantes y tutores, sin depender de canales externos.',
    estado: 'pendiente',
  },
  {
    icon: 'ti-flame',
    categoria: 'Universal',
    titulo: 'Match de proyectos',
    descripcion:
      'Encuentra equipo para proyectos académicos o emprendimientos, recomendados según tus intereses.',
    estado: 'beta',
    color: 'pink',
  },
  {
    icon: 'ti-palette',
    categoria: 'Universal',
    titulo: 'Espacio cultural',
    descripcion:
      'Música, teatro y artes visuales con herramientas propias y audiencia solo universitaria.',
    estado: 'pendiente',
  },
  {
    icon: 'ti-shopping-bag',
    categoria: 'Universal',
    titulo: 'Marketplace',
    descripcion:
      'Compra y vende entre estudiantes verificados, sin exponerte a un público general.',
    estado: 'pendiente',
  },
];

const MIS_INTERESES = [
  'React',
  'Machine Learning',
  'Diseño UX',
  'Emprendimiento',
];

const PROYECTOS_EJEMPLO = [
  {
    nombre: 'App de gestión para pymes',
    etiquetas: ['React', 'Emprendimiento'],
    afinidad: 92,
  },
  {
    nombre: 'Predicción de deserción',
    etiquetas: ['Machine Learning'],
    afinidad: 78,
  },
  { nombre: 'Feria de ciencias FACE', etiquetas: ['Eventos'], afinidad: 31 },
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
          <div className='flex flex-shrink-0 items-center gap-1.5'>
            <img
              src='/logo_white.png'
              alt='InFACE'
              className='h-8 w-8 flex-shrink-0 rounded-[8px] object-contain'
            />
            <div className='select-none text-[18px] font-bold tracking-tight'>
              In<span className='text-pink-500'>FACE</span>
            </div>
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
              className='inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
            >
              Crear cuenta
              <ArrowRight className='h-[14px] w-[14px]' />
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
            <h1 className='text-[36px] font-bold leading-[1.12] tracking-tight text-neutral-50 md:text-[46px]'>
              La comunidad de tu facultad, ahora en un solo lugar.
            </h1>

            <p className='mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-400 md:text-[16px]'>
              Apuntes, dudas de ramos, anuncios oficiales, equipos de proyecto,
              expresiones artísticas y compraventa entre estudiantes. Todo
              centralizado, verificado con tu correo institucional y pensado
              para las 5 carreras de la Facultad de Ciencias Empresariales en la Universidad del Bío-Bío.
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <Link
                to='/register'
                className='inline-flex items-center gap-2 rounded-[10px] bg-pink-500 px-5 py-3 text-[13.5px] font-semibold text-white transition hover:bg-pink-600 active:scale-[.98]'
              >
                Crear cuenta gratis
                <ArrowRight className='h-4 w-4' />
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
              Acceso exclusivo con correo institucional. Sin costo para
              estudiantes.
            </p>
          </Reveal>

          {/* MASCOTA — armadillo.png */}
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
            {
              valor: 'Machine Learning',
              label: 'Búsqueda y recomendación',
              largo: true,
            },
          ].map((s) => (
            <Reveal
              key={s.label}
              className='px-6 py-8 text-center'
            >
              <div
                className={`flex min-h-[34px] items-center justify-center font-bold leading-tight ${s.largo ? 'text-[19px] md:text-[22px]' : 'text-[26px]'
                  } ${s.pink ? 'text-pink-500' : 'text-neutral-50'}`}
              >
                {s.valor}
              </div>
              <div className='mt-1 text-[11.5px] text-neutral-500'>
                {s.label}
              </div>
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
          <span className='inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-tight text-pink-400'>
            <span className='h-px w-7 bg-gradient-to-r from-pink-500 to-transparent' />
            Cómo funciona
          </span>
          <h2 className='mt-3 text-[30px] font-bold tracking-tight text-neutral-50 md:text-[34px]'>
            Empezar toma menos de un minuto.
          </h2>
        </Reveal>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {[
            {
              n: 1,
              titulo: 'Crea tu cuenta',
              texto:
                'Regístrate con tu correo institucional y arma tu perfil integral: académico, artístico o emprendedor.',
            },
            {
              n: 2,
              titulo: 'Cuéntanos tus intereses',
              texto:
                'Elige tus habilidades y temas de interés para que el sistema recomiende contenido y proyectos afines a ti.',
            },
            {
              n: 3,
              titulo: 'Participa en tu facultad',
              texto:
                'Sube apuntes, responde dudas, únete a proyectos, comparte tu arte o publica en el marketplace.',
            },
          ].map((paso) => (
            <Reveal key={paso.n}>
              <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/10 text-[15px] font-bold text-pink-400'>
                {paso.n}
              </div>
              <h3 className='mb-2 text-[15px] font-bold text-neutral-100'>
                {paso.titulo}
              </h3>
              <p className='text-[13px] leading-relaxed text-neutral-500'>
                {paso.texto}
              </p>
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
          <span className='inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-tight text-pink-400'>
            <span className='h-px w-7 bg-gradient-to-r from-pink-500 to-transparent' />
            La plataforma
          </span>
          <h2 className='mt-3 text-[30px] font-bold tracking-tight text-neutral-50 md:text-[34px]'>
            Seis módulos, una sola cuenta.
          </h2>
        </Reveal>

        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {MODULOS.map((m) => {
            const c =
              COLOR_CLASSES[m.estado === 'pendiente' ? 'gray' : m.color];
            return (
              <Reveal key={m.titulo}>
                <div
                  className={`relative h-full overflow-hidden rounded-2xl border p-6 pt-[26px] transition ${c.border} ${c.wash} ${m.estado === 'pendiente'
                    ? 'opacity-70 hover:opacity-100'
                    : ''
                    }`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 ${c.bar}`} />

                  <div className='mb-4 flex items-start justify-between gap-2'>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${c.bg} ${c.text}`}
                    >
                      <i className={`ti ${m.icon} text-[19px]`} />
                    </div>
                    {m.estado === 'beta' ? (
                      <BadgeBeta />
                    ) : (
                      <BadgePorImplementar />
                    )}
                  </div>
                  <div
                    className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${m.estado === 'pendiente' ? c.label : c.text + '/70'}`}
                  >
                    {m.categoria}
                  </div>
                  <h3
                    className={`mb-1.5 text-[15px] font-bold ${m.estado === 'pendiente' ? 'text-neutral-300' : 'text-neutral-100'}`}
                  >
                    {m.titulo}
                  </h3>
                  <p className='text-[13px] leading-relaxed text-neutral-500'>
                    {m.descripcion}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════ VISTA PREVIA DEL PRODUCTO ══════════════════════════ */}
      <section className='mx-auto max-w-6xl px-5 py-24'>
        <div className='grid grid-cols-1 items-center gap-14 lg:grid-cols-2'>
          <Reveal className='lg:order-2'>
            <PerfilOrbita />
          </Reveal>

          <Reveal className='lg:order-1'>
            <span className='inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-tight text-pink-400'>
              <span className='h-px w-7 bg-gradient-to-r from-pink-500 to-transparent' />
              Perfil integral
            </span>
            <h2 className='mt-3 text-[28px] font-bold tracking-tight text-neutral-50 md:text-[32px]'>
              Una identidad, todas tus facetas.
            </h2>
            <p className='mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400'>
              Tu perfil reúne lo académico, lo artístico y lo emprendedor en un
              solo lugar, con intereses que puedes editar cuando quieras para
              recibir mejores recomendaciones.
            </p>
            <ul className='mt-5 space-y-2.5 text-[13px] text-neutral-400'>
              <li className='flex items-center gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-400'>
                  <i className='ti ti-check text-[12px]' />
                </span>
                Intereses editables que alimentan las recomendaciones
              </li>
              <li className='flex items-center gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-400'>
                  <i className='ti ti-check text-[12px]' />
                </span>
                Historial de proyectos, apuntes y participación
              </li>
              <li className='flex items-center gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-400'>
                  <i className='ti ti-check text-[12px]' />
                </span>
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
        <div className='grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]'>
          <Reveal>
            <span className='mb-4 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-tight text-pink-400'>
              <span className='h-px w-8 bg-gradient-to-r from-transparent to-pink-400/70' />
              Recomendación por etiquetas
            </span>
            <h2 className='text-[30px] font-bold leading-tight tracking-tight text-neutral-50 md:text-[36px]'>
              Hecha para que encuentres lo que te sirve.
            </h2>
            <p className='mt-4 max-w-md text-[14.5px] leading-relaxed text-neutral-400'>
              Cada proyecto y contenido se compara con tus intereses para
              sugerirte lo más afín. Tú eliges tus etiquetas y InFACE ordena
              primero lo que mejor calza contigo.
            </p>
            <ul className='mt-6 space-y-3 text-[13.5px] text-neutral-300'>
              {[
                'Elige tus intereses una sola vez',
                'Cada proyecto recibe un porcentaje de afinidad',
                'Lo más compatible aparece primero',
              ].map((t) => (
                <li
                  key={t}
                  className='flex items-center gap-3'
                >
                  <span className='flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/15 text-pink-400'>
                    <i className='ti ti-check text-[12px]' />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <div className='relative'>
              <div
                className='pointer-events-none absolute -inset-6 -z-10 rounded-[32px]'
                style={{
                  background:
                    'radial-gradient(ellipse 70% 70% at 50% 40%, rgba(232,84,106,.14) 0%, transparent 70%)',
                }}
              />
              <div className='rounded-2xl border border-white/[0.08] bg-[#1E1E24] p-6 shadow-2xl shadow-black/40'>
                <div className='mb-1 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-[10px] bg-pink-500/10 text-pink-400'>
                    <i className='ti ti-heart-handshake text-[18px]' />
                  </div>
                  <h3 className='text-[15px] font-bold text-neutral-100'>
                    Tus intereses
                  </h3>
                </div>
                <div className='mt-4 flex flex-wrap gap-2'>
                  {MIS_INTERESES.map((e) => (
                    <span
                      key={e}
                      className='rounded-full border border-pink-500/25 bg-pink-500/10 px-3 py-1 text-[12px] font-medium text-pink-300'
                    >
                      {e}
                    </span>
                  ))}
                </div>

                <div className='my-5 h-px bg-white/[0.06]' />

                <p className='mb-3 text-[12px] font-semibold text-neutral-500'>
                  Proyectos sugeridos para ti
                </p>
                <div className='space-y-3'>
                  {PROYECTOS_EJEMPLO.map((pr) => (
                    <div
                      key={pr.nombre}
                      className='rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5'
                    >
                      <div className='mb-2 flex items-center justify-between gap-3'>
                        <span className='text-[13px] font-semibold text-neutral-100'>
                          {pr.nombre}
                        </span>
                        <span className='text-[12px] font-bold text-pink-400'>
                          {pr.afinidad}%
                        </span>
                      </div>
                      <div className='h-1.5 overflow-hidden rounded-full bg-white/[0.06]'>
                        <div
                          className='h-full rounded-full bg-gradient-to-r from-pink-500 to-pink-300'
                          style={{ width: `${pr.afinidad}%` }}
                        />
                      </div>
                      <div className='mt-2.5 flex flex-wrap gap-1.5'>
                        {pr.etiquetas.map((e) => (
                          <span
                            key={e}
                            className='rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-neutral-400'
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════ CTA FINAL ══════════════════════════ */}
      <section className='mx-auto max-w-6xl px-5 pb-24'>
        <Reveal className='relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#1E1E24] px-8 py-14 md:px-14'>
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'radial-gradient(ellipse 60% 100% at 20% 0%, rgba(232,84,106,.12) 0%, transparent 70%)',
            }}
          />
          <div className='relative flex flex-col items-center gap-10 text-center lg:flex-row lg:text-left'>
            <div className='flex-1'>
              <h2 className='text-[26px] font-bold tracking-tight text-neutral-50 md:text-[30px]'>
                Únete a la comunidad de tu facultad.
              </h2>
              <p className='mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400 lg:mx-0'>
                Crea tu cuenta con tu correo institucional y empieza a formar
                parte de InFACE hoy mismo.
              </p>
              <Link
                to='/register'
                className='mt-7 inline-flex items-center gap-2 rounded-[10px] bg-pink-500 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-pink-600 active:scale-[.98]'
              >
                Crear mi cuenta InFACE
                <ArrowRight className='h-[17px] w-[17px]' />
              </Link>
            </div>

            {/* LOGO */}
            <img
              src='/logo_white.png'
              alt='Logo InFACE'
              className='h-52 w-52 flex-shrink-0 object-contain'
            />
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className='border-t border-white/[0.06] px-5 py-10'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex items-center gap-2.5 text-center md:text-left'>
            <img
              src='/logo_white.png'
              alt='InFACE'
              className='h-11 w-11 flex-shrink-0 rounded-[9px] object-contain'
            />
            <div>
              <div className='text-[14px] font-bold tracking-tight'>
                In<span className='text-pink-500'>FACE</span>
              </div>
              <p className='text-[11px] text-neutral-600'>
                Facultad de Ciencias Empresariales · Universidad del Bío-Bío
              </p>
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