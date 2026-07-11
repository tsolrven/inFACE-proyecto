import { useMemo, useState } from 'react';
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

// misma lógica que el backend (nombre.helper.js): detecta "Nombre Apellido" a partir
// de la parte local del correo, solo para mostrarle una vista previa al usuario.
function detectarNombreDesdeCorreo(correo) {
  const local = (correo.split('@')[0] || '').replace(/\d+$/, '');
  const partes = local
    .split(/[._-]+/)
    .map((p) => p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean);
  if (partes.length === 0) return null;
  return partes.map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');
}

export default function Register() {
  const { register, login } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    correo: '',
    nombre_usuario: '',
    contrasena: '',
  });
  const [errors, setErrors] = useState({ fields: {}, general: null });
  const [loading, setLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const nombreDetectado = useMemo(() => detectarNombreDesdeCorreo(form.correo), [form.correo]);

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
      // se loguea automáticamente para poder pasar directo a "configura tu perfil"
      await login({ correo: form.correo, contrasena: form.contrasena });
      navigate('/onboarding');
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className='flex min-h-screen items-center justify-center px-4 py-10'
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,84,106,.10) 0%, transparent 60%), #0B0B0E' }}
    >
      <div className='w-full max-w-sm'>
        {/* Encabezado */}
        <div className='mb-8 text-center'>
          <span className='inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-pink-400'>
            <i className='ti ti-affiliate text-[13px]' /> UBB · Inface
          </span>
          <h1 className='mt-2.5 text-[26px] font-bold leading-tight text-neutral-50'>
            Crea tu cuenta
          </h1>
          <p className='mt-1.5 text-[13px] text-neutral-500'>
            Solo correos de <span className='text-neutral-300'>@alumnos.ubiobio.cl</span> o{' '}
            <span className='text-neutral-300'>@ubiobio.cl</span>.
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
                placeholder='nombre.apellido@alumnos.ubiobio.cl'
                className={`w-full rounded-[10px] border bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition
                  focus:border-pink-500/50
                  ${errors.fields.correo ? 'border-red-500/60' : 'border-white/[0.07] hover:border-white/[0.14]'}`}
              />
              {errors.fields.correo && (
                <p className='mt-1.5 text-[11.5px] text-red-400'>{errors.fields.correo}</p>
              )}
              {!errors.fields.correo && nombreDetectado && (
                <p className='mt-1.5 flex items-center gap-1.5 text-[11.5px] text-emerald-400'>
                  <i className='ti ti-circle-check text-[13px]' />
                  Tu perfil se creará como <strong>{nombreDetectado}</strong>
                </p>
              )}
              {!errors.fields.correo && !nombreDetectado && form.correo && (
                <p className='mt-1.5 text-[11.5px] text-neutral-600'>
                  Detectamos tu nombre automáticamente desde tu correo institucional.
                </p>
              )}
            </div>

            {/* Nombre de usuario */}
            <div>
              <label
                htmlFor='nombre_usuario'
                className='mb-1.5 block text-[11px] font-medium text-neutral-500'
              >
                Nombre de usuario
              </label>
              <input
                id='nombre_usuario'
                name='nombre_usuario'
                type='text'
                autoComplete='username'
                value={form.nombre_usuario}
                onChange={handleChange}
                placeholder='mi_usuario_123'
                className={`w-full rounded-[10px] border bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition
                  focus:border-pink-500/50
                  ${errors.fields.nombre_usuario ? 'border-red-500/60' : 'border-white/[0.07] hover:border-white/[0.14]'}`}
              />
              {errors.fields.nombre_usuario && (
                <p className='mt-1.5 text-[11.5px] text-red-400'>{errors.fields.nombre_usuario}</p>
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
                  autoComplete='new-password'
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
              {!errors.fields.contrasena && (
                <p className='mt-1.5 text-[11px] text-neutral-600'>
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                </p>
              )}
            </div>

            <button
              type='submit'
              disabled={loading}
              className='mt-1 w-full rounded-[10px] bg-pink-500 px-4 py-2.5 text-[13px] font-semibold text-white transition
                hover:bg-pink-600 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? 'Creando cuenta…' : 'Continuar'}
            </button>
          </form>
        </div>

        {/* Link a login */}
        <p className='mt-6 text-center text-[13px] text-neutral-500'>
          ¿Ya tienes cuenta?{' '}
          <Link
            to='/login'
            className='font-medium text-pink-400 transition hover:text-pink-300'
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}