import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import {
  obtenerMiPerfil,
  cambiarContrasena,
  actualizarConsentimientoInvestigacion,
} from '@/shared/api/perfil.api';
import EliminarCuenta from '@/features/profile/components/EliminarCuenta';

const inputClase =
  'rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3 py-2 text-[13px] text-neutral-100 outline-none focus:border-pink-500/50';

function Tarjeta({ titulo, descripcion, children }) {
  return (
    <section className='rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-5'>
      <h2 className='text-[14px] font-bold text-neutral-100'>{titulo}</h2>
      {descripcion && (
        <p className='mt-1 text-[12.5px] leading-relaxed text-neutral-500'>
          {descripcion}
        </p>
      )}
      <div className='mt-4'>{children}</div>
    </section>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] py-2.5 text-[13px] last:border-0'>
      <span className='text-neutral-500'>{etiqueta}</span>
      <span className='break-all text-neutral-200'>{valor || '—'}</span>
    </div>
  );
}

function CambiarContrasena() {
  const logout = useAuthStore((s) => s.logout);
  const [form, setForm] = useState({ actual: '', nueva: '', repetir: '' });
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function cambiar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    if (form.nueva !== form.repetir) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    setGuardando(true);
    try {
      await cambiarContrasena(form.actual, form.nueva);
      setOk(true);
      setTimeout(() => logout(), 1800);
    } catch (err) {
      setError(
        err.details?.length
          ? err.details.map((d) => d.message || d).join('. ')
          : err.message,
      );
    } finally {
      setGuardando(false);
    }
  }

  if (ok) {
    return (
      <p className='rounded-[10px] bg-emerald-400/[0.08] px-3.5 py-2.5 text-[12.5px] text-emerald-400'>
        Contraseña actualizada. Te llevamos a iniciar sesión de nuevo…
      </p>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className='flex max-w-sm flex-col gap-3'
    >
      {error && (
        <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
          {error}
        </div>
      )}
      <label className='flex flex-col gap-1.5 text-[12.5px] text-neutral-400'>
        Contraseña actual
        <input
          type='password'
          value={form.actual}
          onChange={cambiar('actual')}
          autoComplete='current-password'
          className={inputClase}
        />
      </label>
      <label className='flex flex-col gap-1.5 text-[12.5px] text-neutral-400'>
        Contraseña nueva
        <input
          type='password'
          value={form.nueva}
          onChange={cambiar('nueva')}
          autoComplete='new-password'
          className={inputClase}
        />
        <span className='text-[11.5px] text-neutral-600'>
          Mínimo 8 caracteres, con mayúscula, minúscula y número.
        </span>
      </label>
      <label className='flex flex-col gap-1.5 text-[12.5px] text-neutral-400'>
        Repite la contraseña nueva
        <input
          type='password'
          value={form.repetir}
          onChange={cambiar('repetir')}
          autoComplete='new-password'
          className={inputClase}
        />
      </label>
      <p className='text-[11.5px] text-neutral-600'>
        Por seguridad, al cambiarla se cerrará tu sesión en todos tus
        dispositivos.
      </p>
      <button
        type='submit'
        disabled={guardando || !form.actual || !form.nueva || !form.repetir}
        className='self-start rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
      >
        {guardando ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}

function ConsentimientoInvestigacion({ inicial }) {
  const [activo, setActivo] = useState(!!inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function alternar() {
    const nuevo = !activo;
    setGuardando(true);
    setError(null);
    try {
      await actualizarConsentimientoInvestigacion(nuevo);
      setActivo(nuevo);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className='flex items-start justify-between gap-4'>
        <p className='text-[12.5px] leading-relaxed text-neutral-400'>
          Permito que mis interacciones se usen, de forma anónima y agregada,
          para evaluar los algoritmos de recomendación de la tesis. Puedes
          cambiarlo cuando quieras sin perder acceso a la plataforma.
        </p>
        <button
          type='button'
          role='switch'
          aria-checked={activo}
          aria-label='Consentimiento de investigación'
          onClick={alternar}
          disabled={guardando}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition disabled:opacity-60 ${activo ? 'bg-pink-500' : 'bg-white/[0.12]'
            }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${activo ? 'left-[22px]' : 'left-0.5'
              }`}
          />
        </button>
      </div>
      {error && <p className='mt-2 text-[12px] text-red-400'>{error}</p>}
    </div>
  );
}

export default function Ajustes() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerMiPerfil()
      .then(setPerfil)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className='mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6'>
      <button
        type='button'
        onClick={() => navigate(-1)}
        className='inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-neutral-400 transition hover:text-neutral-100'
      >
        <i className='ti ti-arrow-left text-[15px]' /> Volver
      </button>

      <div>
        <h1 className='text-[20px] font-bold text-neutral-100'>Ajustes</h1>
        <p className='mt-1 text-[12.5px] text-neutral-500'>
          Administra tu cuenta, tu seguridad y tu privacidad.
        </p>
      </div>

      {error && (
        <p className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
          {error}
        </p>
      )}

      {!perfil && !error && (
        <p className='py-10 text-center text-[13px] text-neutral-600'>
          Cargando…
        </p>
      )}

      {perfil && (
        <>
          <Tarjeta titulo='Tu cuenta'>
            <Dato
              etiqueta='Correo institucional'
              valor={perfil.correo}
            />
            <Dato
              etiqueta='Nombre de usuario'
              valor={perfil.nombre_usuario}
            />
            <Dato
              etiqueta='Carrera'
              valor={perfil.carrera?.nombre}
            />
            <p className='mt-3 text-[12px] text-neutral-600'>
              Para cambiar tu nombre de usuario, biografía o intereses, ve a{' '}
              <Link
                to='/perfil'
                className='text-pink-400 hover:text-pink-300'
              >
                tu perfil
              </Link>
              .
            </p>
          </Tarjeta>

          <Tarjeta titulo='Contraseña'>
            <CambiarContrasena />
          </Tarjeta>

          <Tarjeta
            titulo='Privacidad e investigación'
            descripcion='Decide cómo se usan tus datos.'
          >
            <ConsentimientoInvestigacion
              inicial={perfil.consentimiento_investigacion}
            />
            <div className='mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/[0.05] pt-3 text-[12.5px]'>
              <Link
                to='/legal/privacidad'
                className='text-pink-400 hover:text-pink-300'
              >
                Política de Privacidad
              </Link>
              <Link
                to='/legal/terminos'
                className='text-pink-400 hover:text-pink-300'
              >
                Términos de uso
              </Link>
            </div>
          </Tarjeta>

          <EliminarCuenta programada={perfil.eliminacion_programada_en} />
        </>
      )}
    </div>
  );
}