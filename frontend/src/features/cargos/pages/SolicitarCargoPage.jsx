import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import { obtenerPerfilActual } from '@/shared/auth/auth.service';
import MisCargos from '@/features/cargos/components/MisCargos';
import SolicitudForm from '@/features/cargos/components/SolicitudForm';
import MisSolicitudes from '@/features/cargos/components/MisSolicitudes';

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

export default function SolicitarCargoPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const actualizarUsuario = useAuthStore((s) => s.actualizarUsuario);

  // Al abrir la página se vuelve a pedir el usuario: así los cargos (por
  // ejemplo uno recién aprobado o vencido) están al día.
  useEffect(() => {
    let activo = true;
    obtenerPerfilActual()
      .then((u) => {
        if (activo) actualizarUsuario(u);
      })
      .catch(() => {
        // si falla se conserva el usuario que ya está en memoria
      });
    return () => {
      activo = false;
    };
  }, [actualizarUsuario]);

  const carreras = usuario?.carreras ?? [];

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
        <h1 className='text-[20px] font-bold text-neutral-100'>
          Solicitar cargo
        </h1>
        <p className='mt-1 text-[12.5px] text-neutral-500'>
          Pide el cargo de CEE o tutor de tu carrera. La moderación revisa cada
          solicitud.
        </p>
      </div>

      <Tarjeta
        titulo='Mis cargos'
        descripcion='Los cargos vencen en una fecha fija según su tipo.'
      >
        <MisCargos
          cargos={usuario?.cargos ?? []}
          carreras={carreras}
        />
      </Tarjeta>

      <Tarjeta titulo='Nueva solicitud'>
        <SolicitudForm carreras={carreras} />
      </Tarjeta>

      <Tarjeta titulo='Mis solicitudes'>
        <MisSolicitudes />
      </Tarjeta>
    </div>
  );
}