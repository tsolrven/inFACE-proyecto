import { Link } from 'react-router-dom';

function fechaHoy() {
  const f = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return f.charAt(0).toUpperCase() + f.slice(1);
}

export default function Hero({ saludo, nombre, accesos, acciones }) {
  return (
    <section
      className='relative overflow-hidden rounded-3xl border border-white/[0.07] p-5 sm:p-7'
      style={{
        background:
          'radial-gradient(120% 140% at 0% 0%, rgba(244,114,182,0.16) 0%, rgba(167,139,250,0.08) 38%, rgba(23,23,27,0) 70%), #17171B',
      }}
    >
      <div className='flex flex-col gap-5'>
        <div className='min-w-0'>
          <p className='text-[11.5px] font-semibold uppercase tracking-wider text-pink-400/80'>
            {fechaHoy()}
          </p>
          <h1 className='mt-1 text-[24px] font-bold leading-tight text-neutral-50 sm:text-[30px]'>
            {saludo}
            {nombre ? `, ${nombre}` : ''}
          </h1>
          <p className='mt-1.5 max-w-[520px] text-[13px] leading-relaxed text-neutral-400'>
            Esto es lo que está pasando en InFACE ahora mismo. Entra a un
            módulo o publica algo nuevo.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-2.5 lg:grid-cols-4'>
          {accesos.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className='group flex flex-col items-start gap-2 rounded-2xl border border-white/[0.07] bg-black/25 p-3 transition hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-black/35 sm:flex-row sm:items-center sm:gap-3'
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${a.fondo}`}
              >
                <i className={`ti ${a.icon} text-[19px] ${a.color}`} />
              </div>
              <div className='min-w-0 max-w-full'>
                <div className='flex flex-wrap items-center gap-x-1.5'>
                  <span className='truncate text-[13px] font-bold text-neutral-100'>
                    {a.titulo}
                  </span>
                  {a.beta && (
                    <span className='rounded border border-pink-500/30 bg-pink-500/15 px-1 py-px text-[8.5px] font-bold uppercase text-pink-400'>
                      Beta
                    </span>
                  )}
                </div>
                <div className='truncate text-[11.5px] text-neutral-500'>
                  {a.texto}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {acciones.length > 0 && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='mr-1 text-[11.5px] font-semibold text-neutral-500'>
              Atajos
            </span>
            {acciones.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className='flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 transition hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-300'
              >
                <i className={`ti ${a.icon} text-[13px]`} />
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}