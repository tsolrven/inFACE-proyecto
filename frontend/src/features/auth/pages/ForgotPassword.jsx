import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solicitarRecuperacion } from '@/shared/auth/auth.service';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await solicitarRecuperacion(correo.trim());
      setEnviado(true);
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className='flex min-h-screen items-center justify-center px-4'
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,84,106,.10) 0%, transparent 60%), #0B0B0E',
      }}
    >
      <div className='w-full max-w-sm'>
        <Link
          to='/login'
          className='mb-6 inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 transition hover:text-neutral-200'
        >
          <i className='ti ti-arrow-left text-[14px]' />
          Volver a iniciar sesión
        </Link>

        <div className='mb-8 text-center'>
          <span className='inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-tight text-pink-400'>
            Recuperar acceso
          </span>
          <h1 className='mt-2.5 text-[26px] font-bold leading-tight text-neutral-50'>
            ¿Olvidaste tu contraseña?
          </h1>
          <p className='mt-1.5 text-[13px] text-neutral-500'>
            Escribe tu correo institucional y te enviaremos un enlace para
            elegir una nueva.
          </p>
        </div>

        <div className='rounded-2xl border border-white/[0.07] bg-[#1E1E24] p-6'>
          {enviado ? (
            <div className='text-center'>
              <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/10 text-pink-400'>
                <i className='ti ti-mail-check text-[20px]' />
              </div>
              <h2 className='text-[15px] font-semibold text-neutral-100'>
                Revisa tu correo
              </h2>
              <p className='mt-2 text-[12.5px] leading-relaxed text-neutral-500'>
                Si <b className='text-neutral-300'>{correo.trim()}</b> tiene una
                cuenta, te enviamos un enlace que vence en 30 minutos. Si no lo
                ves, revisa la carpeta de spam.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className='flex flex-col gap-4'
            >
              {error && (
                <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor='correo'
                  className='mb-1.5 block text-[11px] font-medium text-neutral-500'
                >
                  Correo institucional
                </label>
                <input
                  id='correo'
                  type='email'
                  autoComplete='email'
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder='usuario@alumnos.ubiobio.cl'
                  className='w-full rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition hover:border-white/[0.14] focus:border-pink-500/50'
                />
              </div>
              <button
                type='submit'
                disabled={enviando || !correo.trim()}
                className='w-full rounded-[10px] bg-pink-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-pink-600 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {enviando ? 'Enviando…' : 'Enviarme el enlace'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
