import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// extrae los errores del backend (auth.validation) y los agrupa por campo
function parseApiError(err) {
  if (err.details && Array.isArray(err.details)) {
    const byField = {};
    err.details.forEach(({ field, message }) => {
      byField[field] = message;
    });
    return { fields: byField, general: null };
  }
  return { fields: {}, general: err.message || 'Ocurrió un error inesperado' };
}

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [errors, setErrors] = useState({ fields: {}, general: null });
  const [loading, setLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpia el error del campo al escribir
    setErrors((prev) => ({
      ...prev,
      fields: { ...prev.fields, [name]: undefined },
      general: null,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({ fields: {}, general: null });

    try {
      await login(form);
      navigate('/home');
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className='flex min-h-screen items-center justify-center px-4'
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,84,106,.10) 0%, transparent 60%), #0B0B0E' }}
    >
      <div className='w-full max-w-sm'>
        {/* Volver al inicio */}
        <Link
          to='/'
          className='mb-6 inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 transition hover:text-neutral-200'
        >
          <i className='ti ti-arrow-left text-[14px]' />
          Volver al inicio
        </Link>

        {/* Encabezado */}
        <div className='mb-8 text-center'>
          <span className='inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-pink-400'>
            <i className='ti ti-affiliate text-[13px]' /> UBB · Inface
          </span>
          <h1 className='mt-2.5 text-[26px] font-bold leading-tight text-neutral-50'>
            Inicia sesión
          </h1>
          <p className='mt-1.5 text-[13px] text-neutral-500'>
            Usa tu correo institucional para continuar.
          </p>
        </div>

        {/* Card */}
        <div className='rounded-2xl border border-white/[0.07] bg-[#1E1E24] p-6'>
          {errors.general && (
            <div className='mb-4 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className='flex flex-col gap-4'
          >
            {/* Correo */}
            <div>
              <label
                htmlFor='correo'
                className='mb-1.5 block text-[11px] font-medium text-neutral-500'
              >
                Correo institucional
              </label>
              <input
                id='correo'
                name='correo'
                type='email'
                autoComplete='email'
                value={form.correo}
                onChange={handleChange}
                placeholder='usuario@alumnos.ubiobio.cl'
                className={`w-full rounded-[10px] border bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition
                  focus:border-pink-500/50
                  ${errors.fields.correo ? 'border-red-500/60' : 'border-white/[0.07] hover:border-white/[0.14]'}`}
              />
              {errors.fields.correo && (
                <p className='mt-1.5 text-[11.5px] text-red-400'>{errors.fields.correo}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor='contrasena'
                className='mb-1.5 block text-[11px] font-medium text-neutral-500'
              >
                Contraseña
              </label>
              <div className='relative'>
                <input
                  id='contrasena'
                  name='contrasena'
                  type={mostrarContrasena ? 'text' : 'password'}
                  autoComplete='current-password'
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className={`w-full rounded-[10px] border bg-[#17171B] px-3.5 py-2.5 pr-10 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition
                    focus:border-pink-500/50
                    ${errors.fields.contrasena ? 'border-red-500/60' : 'border-white/[0.07] hover:border-white/[0.14]'}`}
                />
                <button
                  type='button'
                  onClick={() => setMostrarContrasena((v) => !v)}
                  tabIndex={-1}
                  className='absolute right-0 top-0 flex h-full w-10 items-center justify-center text-neutral-500 transition hover:text-neutral-200'
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`ti ${mostrarContrasena ? 'ti-eye-off' : 'ti-eye'} text-[16px]`} />
                </button>
              </div>
              {errors.fields.contrasena && (
                <p className='mt-1.5 text-[11.5px] text-red-400'>{errors.fields.contrasena}</p>
              )}
            </div>

            {/* Botón */}
            <button
              type='submit'
              disabled={loading}
              className='mt-1 w-full rounded-[10px] bg-pink-500 px-4 py-2.5 text-[13px] font-semibold text-white transition
                hover:bg-pink-600 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Link a registro */}
        <p className='mt-6 text-center text-[13px] text-neutral-500'>
          ¿No tienes cuenta?{' '}
          <Link
            to='/register'
            className='font-medium text-pink-400 transition hover:text-pink-300'
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}