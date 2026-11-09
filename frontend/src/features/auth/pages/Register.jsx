import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import { listarCarreras } from '@/shared/api/catalog.api';

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

function detectarNombreDesdeCorreo(correo) {
  const local = (correo.split('@')[0] || '').replace(/\d+$/, '');
  const partes = local
    .split(/[._-]+/)
    .map((p) =>
      p
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, ''),
    )
    .filter(Boolean);
  if (partes.length === 0) return null;
  return partes.map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');
}

function detectarGeneracion(correo) {
  const m = (correo.split('@')[0] || '').match(/(\d{2})\d{2}$/);
  if (!m) return null;
  const anio = 2000 + Number(m[1]);
  return anio <= new Date().getFullYear() + 1 ? anio : null;
}

const CARGOS = [
  {
    id: 'jefe_carrera',
    label: 'Jefa de Carrera',
    icon: 'ti-crown',
  },
  { id: 'funcionario', label: 'Funcionario', icon: 'ti-id-badge-2' },
  { id: 'academico', label: 'Académico', icon: 'ti-school' },
];

export default function Register() {
  const { register, login } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    correo: '',
    nombre_usuario: '',
    carrera_id: '',
    cargo: '',
    nombre_completo: '',
    contrasena: '',
    acepta_terminos: false,
    acepta_investigacion: false,
  });
  const [errors, setErrors] = useState({ fields: {}, general: null });
  const [loading, setLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [carreras, setCarreras] = useState([]);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);
  const [errorCarreras, setErrorCarreras] = useState(false);

  useEffect(() => {
    listarCarreras()
      .then(setCarreras)
      .catch(() => setErrorCarreras(true))
      .finally(() => setCargandoCarreras(false));
  }, []);

  const nombreDetectado = useMemo(
    () => detectarNombreDesdeCorreo(form.correo),
    [form.correo],
  );

  const esAcademico = form.correo.trim().toLowerCase().endsWith('@ubiobio.cl');
  const generacion = useMemo(
    () => (esAcademico ? null : detectarGeneracion(form.correo.trim())),
    [form.correo, esAcademico],
  );

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      fields: { ...prev.fields, [name]: undefined },
      general: null,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.acepta_terminos) {
      setErrors({
        fields: {
          acepta_terminos:
            'Debes aceptar los Términos y la Política de Privacidad para registrarte',
        },
        general: null,
      });
      return;
    }
    setLoading(true);
    setErrors({ fields: {}, general: null });

    try {
      const datos = { ...form };
      if (esAcademico) {
        delete datos.carrera_id;
        datos.nombre_completo = datos.nombre_completo.trim();
        if (!datos.cargo) {
          setErrors({
            fields: { cargo: 'Debes seleccionar tu cargo' },
            general: null,
          });
          setLoading(false);
          return;
        }
      } else {
        delete datos.cargo;
        delete datos.nombre_completo;
      }
      await register(datos);
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
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,84,106,.10) 0%, transparent 60%), #0B0B0E',
      }}
    >
      <div className='w-full max-w-sm'>
        <Link
          to='/'
          className='mb-6 inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 transition hover:text-neutral-200'
        >
          <i className='ti ti-arrow-left text-[14px]' />
          Volver al inicio
        </Link>

        <div className='mb-8 text-center'>
          <span className='inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-pink-400'>
            <i className='ti ti-affiliate text-[13px]' /> UBB · Inface
          </span>
          <h1 className='mt-2.5 text-[26px] font-bold leading-tight text-neutral-50'>
            Crea tu cuenta
          </h1>
          <p className='mt-1.5 text-[13px] text-neutral-500'>
            Solo correos de{' '}
            <span className='text-neutral-300'>@alumnos.ubiobio.cl</span> o{' '}
            <span className='text-neutral-300'>@ubiobio.cl</span>.
          </p>
        </div>

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
                <p className='mt-1.5 text-[11.5px] text-red-400'>
                  {errors.fields.correo}
                </p>
              )}
              {!errors.fields.correo && !esAcademico && nombreDetectado && (
                <p className='mt-1.5 flex items-center gap-1.5 text-[11.5px] text-emerald-400'>
                  <i className='ti ti-circle-check text-[13px]' />
                  Tu perfil se creará como <strong>{nombreDetectado}</strong>
                </p>
              )}
              {!errors.fields.correo && generacion && (
                <p className='mt-1 flex items-center gap-1.5 text-[11.5px] text-violet-300'>
                  <i className='ti ti-school text-[13px]' />
                  Generación <strong>{generacion}</strong>
                </p>
              )}
              {!errors.fields.correo &&
                !esAcademico &&
                !nombreDetectado &&
                form.correo && (
                  <p className='mt-1.5 text-[11.5px] text-neutral-600'>
                    Detectamos tu nombre automáticamente desde tu correo
                    institucional.
                  </p>
                )}
            </div>

            {esAcademico && (
              <div>
                <label
                  htmlFor='nombre_completo'
                  className='mb-1.5 block text-[11px] font-medium text-neutral-500'
                >
                  Nombre completo
                </label>
                <input
                  id='nombre_completo'
                  name='nombre_completo'
                  type='text'
                  autoComplete='name'
                  value={form.nombre_completo}
                  onChange={handleChange}
                  placeholder='María Pérez González'
                  className={`w-full rounded-[10px] border bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none transition
                    focus:border-pink-500/50
                    ${errors.fields.nombre_completo ? 'border-red-500/60' : 'border-white/[0.07] hover:border-white/[0.14]'}`}
                />
                {errors.fields.nombre_completo && (
                  <p className='mt-1.5 text-[11.5px] text-red-400'>
                    {errors.fields.nombre_completo}
                  </p>
                )}
                <p className='mt-1.5 text-[11px] text-neutral-600'>
                  Así se mostrará en tu perfil.
                </p>
              </div>
            )}

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
                <p className='mt-1.5 text-[11.5px] text-red-400'>
                  {errors.fields.nombre_usuario}
                </p>
              )}
            </div>

            {esAcademico ? (
              <div>
                <span className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                  Cargo
                </span>
                <div className='grid grid-cols-3 gap-2'>
                  {CARGOS.map((c) => {
                    const activo = form.cargo === c.id;
                    return (
                      <button
                        key={c.id}
                        type='button'
                        aria-pressed={activo}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, cargo: c.id }));
                          setErrors((prev) => ({
                            ...prev,
                            fields: { ...prev.fields, cargo: undefined },
                          }));
                        }}
                        className={`flex flex-col items-center gap-1 rounded-[10px] border px-2 py-2.5 text-[11.5px] font-medium transition ${activo
                            ? 'border-pink-500/60 bg-pink-500/10 text-pink-300'
                            : 'border-white/[0.07] bg-[#17171B] text-neutral-400 hover:border-white/[0.18]'
                          }`}
                      >
                        <i className={`ti ${c.icon} text-[17px]`} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                {errors.fields.cargo && (
                  <p className='mt-1.5 text-[11.5px] text-red-400'>
                    {errors.fields.cargo}
                  </p>
                )}
                <p className='mt-1.5 text-[11px] text-neutral-600'>
                  Tu personaje parte sin accesorios; podrás personalizarlo
                  después en tu perfil.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor='carrera_id'
                    className='mb-1.5 block text-[11px] font-medium text-neutral-500'
                  >
                    Carrera
                  </label>
                  <select
                    id='carrera_id'
                    name='carrera_id'
                    value={form.carrera_id}
                    onChange={handleChange}
                    disabled={cargandoCarreras || errorCarreras}
                    className={`w-full rounded-[10px] border bg-[#17171B] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition
                  focus:border-pink-500/50 disabled:opacity-50
                  ${errors.fields.carrera_id ? 'border-red-500/60' : 'border-white/[0.07] hover:border-white/[0.14]'}`}
                  >
                    <option
                      value=''
                      disabled
                    >
                      {cargandoCarreras
                        ? 'Cargando carreras…'
                        : 'Selecciona tu carrera'}
                    </option>
                    {carreras.map((carrera) => (
                      <option
                        key={carrera.id}
                        value={carrera.id}
                      >
                        {carrera.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.fields.carrera_id && (
                    <p className='mt-1.5 text-[11.5px] text-red-400'>
                      {errors.fields.carrera_id}
                    </p>
                  )}
                  {errorCarreras && (
                    <p className='mt-1.5 text-[11.5px] text-red-400'>
                      No se pudo cargar la lista de carreras. Recarga la página.
                    </p>
                  )}
                </div>
              </>
            )}

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
                  aria-label={
                    mostrarContrasena
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  <i
                    className={`ti ${mostrarContrasena ? 'ti-eye-off' : 'ti-eye'} text-[16px]`}
                  />
                </button>
              </div>
              {errors.fields.contrasena && (
                <p className='mt-1.5 text-[11.5px] text-red-400'>
                  {errors.fields.contrasena}
                </p>
              )}
              {!errors.fields.contrasena && (
                <p className='mt-1.5 text-[11px] text-neutral-600'>
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                </p>
              )}
            </div>

            <div className='flex flex-col gap-2.5'>
              <label className='flex items-start gap-2.5 text-[12px] text-neutral-400'>
                <input
                  type='checkbox'
                  name='acepta_terminos'
                  checked={form.acepta_terminos}
                  onChange={handleChange}
                  className='mt-0.5'
                />
                <span>
                  He leído y acepto los{' '}
                  <Link
                    to='/legal/terminos'
                    target='_blank'
                    className='text-pink-400 hover:underline'
                  >
                    Términos y Condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link
                    to='/legal/privacidad'
                    target='_blank'
                    className='text-pink-400 hover:underline'
                  >
                    Política de Privacidad
                  </Link>
                  .
                </span>
              </label>
              {errors.fields.acepta_terminos && (
                <p className='text-[11.5px] text-red-400'>
                  {errors.fields.acepta_terminos}
                </p>
              )}
              <label className='flex items-start gap-2.5 text-[12px] text-neutral-500'>
                <input
                  type='checkbox'
                  name='acepta_investigacion'
                  checked={form.acepta_investigacion}
                  onChange={handleChange}
                  className='mt-0.5'
                />
                <span>
                  (Opcional) Acepto que mi actividad en el Match de proyectos se
                  use, de forma seudonimizada, para evaluar los algoritmos de
                  recomendación de una tesis.
                </span>
              </label>
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