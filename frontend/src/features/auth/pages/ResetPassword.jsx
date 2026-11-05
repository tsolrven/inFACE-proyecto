import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { restablecerContrasena } from '@/shared/auth/auth.service';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (nueva !== repetir) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setEnviando(true);
    try {
      await restablecerContrasena(token, nueva);
      setListo(true);
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setEnviando(false);
    }
  }

  const inputClase =
    'w-full rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition hover:border-white/[0.14] focus:border-pink-500/50';

  return (
    <div
      className='flex min-h-screen items-center justify-center px-4'
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,84,106,.10) 0%, transparent 60%), #0B0B0E',
      }}
    >
      <div className='w-full max-w-sm'>
        <div className='mb-8 text-center'>
          <span className='inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-tight text-pink-400'>
            Recuperar acceso
          </span>
          <h1 className='mt-2.5 text-[26px] font-bold leading-tight text-neutral-50'>
            Elige una contraseña nueva
          </h1>
        </div>

        <div className='rounded-2xl border border-white/[0.07] bg-[#1E1E24] p-6'>
          {listo ? (
            <div className='text-center'>
              <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400'>
                <i className='ti ti-circle-check text-[22px]' />
              </div>
              <h2 className='text-[15px] font-semibold text-neutral-100'>
                Contraseña actualizada
              </h2>
              <p className='mt-2 text-[12.5px] text-neutral-500'>
                Ya puedes iniciar sesión con tu contraseña nueva.
              </p>
              <Link
                to='/login'
                className='mt-5 block w-full rounded-[10px] bg-pink-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-pink-600'
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : !token ? (
            <div className='text-center'>
              <p className='text-[12.5px] text-neutral-400'>
                Este enlace no es válido. Pide uno nuevo desde la pantalla de
                inicio de sesión.
              </p>
              <Link
                to='/olvide-contrasena'
                className='mt-4 inline-block text-[13px] font-medium text-pink-400 hover:text-pink-300'
              >
                Pedir un enlace nuevo
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className='flex flex-col gap-4'
            >
              {error && (
                <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                  {error}{' '}
                  {/venció|válido/.test(error) && (
                    <Link
                      to='/olvide-contrasena'
                      className='font-medium underline'
                    >
                      Pedir uno nuevo
                    </Link>
                  )}
                </div>
              )}
              <div>
                <label
                  htmlFor='nueva'
                  className='mb-1.5 block text-[11px] font-medium text-neutral-500'
                >
                  Contraseña nueva
                </label>
                <input
                  id='nueva'
                  type={mostrar ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  className={inputClase}
                />
                <p className='mt-1.5 text-[11.5px] text-neutral-600'>
                  Mínimo 8 caracteres, con mayúscula, minúscula y número.
                </p>
              </div>
              <div>
                <label
                  htmlFor='repetir'
                  className='mb-1.5 block text-[11px] font-medium text-neutral-500'
                >
                  Repite la contraseña
                </label>
                <input
                  id='repetir'
                  type={mostrar ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={repetir}
                  onChange={(e) => setRepetir(e.target.value)}
                  className={inputClase}
                />
              </div>
              <label className='flex items-center gap-2 text-[12px] text-neutral-500'>
                <input
                  type='checkbox'
                  checked={mostrar}
                  onChange={(e) => setMostrar(e.target.checked)}
                  className='accent-pink-500'
                />
                Mostrar contraseñas
              </label>
              <button
                type='submit'
                disabled={enviando || !nueva || !repetir}
                className='w-full rounded-[10px] bg-pink-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-pink-600 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {enviando ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
