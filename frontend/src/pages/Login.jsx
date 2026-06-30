import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

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
    <div className='min-h-screen bg-neutral-950 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm'>
        {/* Encabezado */}
        <div className='mb-8'>
          <span className='text-xs font-mono tracking-widest text-indigo-400 uppercase'>
            UBB · Inface
          </span>
          <h1 className='mt-2 text-3xl font-bold text-white leading-tight'>
            Inicia sesión
          </h1>
          <p className='mt-1 text-sm text-neutral-400'>
            Usa tu correo institucional para continuar.
          </p>
        </div>

        {/* Error general */}
        {errors.general && (
          <div className='mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400'>
            {errors.general}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className='space-y-4'
        >
          {/* Correo */}
          <div>
            <label
              htmlFor='correo'
              className='block text-xs font-medium text-neutral-400 mb-1.5'
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
              className={`w-full rounded-lg border bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                ${
                  errors.fields.correo
                    ? 'border-red-500/60'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
            />
            {errors.fields.correo && (
              <p className='mt-1.5 text-xs text-red-400'>
                {errors.fields.correo}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor='contrasena'
              className='block text-xs font-medium text-neutral-400 mb-1.5'
            >
              Contraseña
            </label>
            <input
              id='contrasena'
              name='contrasena'
              type='password'
              autoComplete='current-password'
              value={form.contrasena}
              onChange={handleChange}
              placeholder='••••••••'
              className={`w-full rounded-lg border bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                ${
                  errors.fields.contrasena
                    ? 'border-red-500/60'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
            />
            {errors.fields.contrasena && (
              <p className='mt-1.5 text-xs text-red-400'>
                {errors.fields.contrasena}
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type='submit'
            disabled={loading}
            className='mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition
              hover:bg-indigo-500 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {/* Link a registro */}
        <p className='mt-6 text-center text-sm text-neutral-500'>
          ¿No tienes cuenta?{' '}
          <Link
            to='/register'
            className='text-indigo-400 hover:text-indigo-300 transition font-medium'
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
