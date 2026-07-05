import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

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

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    correo: '',
    contrasena: '',
    nombre_usuario: '',
  });
  const [errors, setErrors] = useState({ fields: {}, general: null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await register(form);
      setSuccess(true);
      // redirige al login tras 1.5s para que el usuario vea el mensaje de éxito
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    {
      id: 'correo',
      label: 'Correo institucional',
      type: 'email',
      autoComplete: 'email',
      placeholder: 'usuario@alumnos.ubiobio.cl',
    },
    {
      id: 'nombre_usuario',
      label: 'Nombre de usuario',
      type: 'text',
      autoComplete: 'username',
      placeholder: 'mi_usuario_123',
    },
    {
      id: 'contrasena',
      label: 'Contraseña',
      type: 'password',
      autoComplete: 'new-password',
      placeholder: '••••••••',
    },
  ];

  return (
    <div className='min-h-screen bg-neutral-950 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm'>
        {/* Encabezado */}
        <div className='mb-8'>
          <span className='text-xs font-mono tracking-widest text-indigo-400 uppercase'>
            UBB · Inface
          </span>
          <h1 className='mt-2 text-3xl font-bold text-white leading-tight'>
            Crea tu cuenta
          </h1>
          <p className='mt-1 text-sm text-neutral-400'>
            Solo correos de{' '}
            <span className='text-neutral-300'>@alumnos.ubiobio.cl</span> o{' '}
            <span className='text-neutral-300'>@ubiobio.cl</span>.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div className='mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400'>
            ¡Cuenta creada! Redirigiendo al inicio de sesión…
          </div>
        )}

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
          {fields.map(({ id, label, type, autoComplete, placeholder }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className='block text-xs font-medium text-neutral-400 mb-1.5'
              >
                {label}
              </label>
              <input
                id={id}
                name={id}
                type={type}
                autoComplete={autoComplete}
                value={form[id]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full rounded-lg border bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  ${
                    errors.fields[id]
                      ? 'border-red-500/60'
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
              />
              {errors.fields[id] && (
                <p className='mt-1.5 text-xs text-red-400'>
                  {errors.fields[id]}
                </p>
              )}
            </div>
          ))}

          {/* Hint de contraseña */}
          <p className='text-xs text-neutral-600'>
            Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
          </p>

          <button
            type='submit'
            disabled={loading || success}
            className='mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition
              hover:bg-indigo-500 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </form>

        {/* Link a login */}
        <p className='mt-6 text-center text-sm text-neutral-500'>
          ¿Ya tienes cuenta?{' '}
          <Link
            to='/login'
            className='text-indigo-400 hover:text-indigo-300 transition font-medium'
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
