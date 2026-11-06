import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import SancionForm from '@/shared/moderation/SancionForm';
import RevocarSancion from '@/features/admin/components/RevocarSancion';
import SancionesHistorial from '@/shared/moderation/SancionesHistorial';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useAplicarSancion,
  useSancionesDeUsuario,
} from '@/features/admin/hooks/useSanciones';
import { nombreDeUsuario } from '@/shared/moderation/reportUi';
import {
  ETIQUETA_SANCION,
  ICONO_SANCION,
  TIPO_SANCION_BADGE,
  TIPOS_SANCION,
  descripcionTermino,
  resumirSanciones,
} from '@/shared/moderation/sancionUi';

function ChipVigente({ sancion }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIPO_SANCION_BADGE[sancion.tipo]}`}
    >
      <i className={`ti ${ICONO_SANCION[sancion.tipo]}`} />
      {ETIQUETA_SANCION[sancion.tipo]} vigente · {descripcionTermino(sancion)}
    </span>
  );
}

function mensajeConfirmacion(nombre, payload) {
  const duracion = payload.permanente
    ? 'de forma permanente'
    : `por ${payload.dias} día${payload.dias === 1 ? '' : 's'}`;

  if (payload.tipo === TIPOS_SANCION.RESTRICCION) {
    return `Se aplicará una restricción temporal ${duracion} a «${nombre}»: no podrá crear ni editar contenido mientras dure.\n\nRecibirá una notificación y un correo con el motivo.`;
  }
  return `Se suspenderá la cuenta de «${nombre}» ${duracion}: no podrá iniciar sesión ni usar la plataforma.\n\nRecibirá un correo con el motivo.`;
}

// `referencia` = { tipo, id } del contenido reportado, si el panel se abre
// desde un reporte; permite asociar la sanción a ese contenido.
export default function AutorPanel({
  autor,
  referencia = null,
  titulo = 'Autor',
}) {
  const [verHistorial, setVerHistorial] = useState(false);
  const [sancionando, setSancionando] = useState(false);
  const [pendiente, setPendiente] = useState(null);
  const { data, isPending, isError, refetch } = useSancionesDeUsuario(
    autor?.id,
  );
  const aplicar = useAplicarSancion();

  // contenido sin autor identificable: no hay a quién consultar
  if (!autor?.id) {
    return (
      <section className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'>
        <p className='text-[12px] text-neutral-500'>Autor: Usuario</p>
      </section>
    );
  }

  const nombre = nombreDeUsuario(autor);
  const resumen = resumirSanciones(data);

  function aplicarSancion(payload) {
    aplicar.mutate(
      { usuarioId: autor.id, payload },
      {
        onSuccess: () => {
          setPendiente(null);
          setSancionando(false);
          setVerHistorial(true);
          mostrarToast('Sanción aplicada');
        },
        // el error se muestra en el formulario, que sigue abierto
        onError: () => setPendiente(null),
      },
    );
  }

  // la advertencia no limita la cuenta: se aplica directo. Restricción y
  // suspensión piden confirmación.
  function handleEnviar(payload) {
    if (payload.tipo === TIPOS_SANCION.ADVERTENCIA) aplicarSancion(payload);
    else setPendiente(payload);
  }

  function cerrarFormulario() {
    aplicar.reset();
    setSancionando(false);
  }

  return (
    <section className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
            {titulo}
          </p>
          <p className='truncate text-[13px] font-semibold text-neutral-100'>
            {nombre}
          </p>
        </div>
        <div className='flex flex-shrink-0 items-center gap-2'>
          <Button
            size='sm'
            icon={verHistorial ? 'ti-chevron-up' : 'ti-history'}
            onClick={() => setVerHistorial((v) => !v)}
          >
            {verHistorial ? 'Ocultar historial' : 'Ver historial'}
          </Button>
          {!sancionando && (
            <Button
              size='sm'
              variant='primary'
              icon='ti-gavel'
              onClick={() => setSancionando(true)}
            >
              Sancionar
            </Button>
          )}
        </div>
      </div>

      <div className='mt-2.5 flex flex-wrap items-center gap-2'>
        {isPending && (
          <i className='ti ti-loader-2 animate-spin text-base text-neutral-600' />
        )}
        {isError && !data && (
          <span className='flex items-center gap-2 text-[12px] text-red-400'>
            No se pudo cargar el historial.
            <button
              type='button'
              onClick={() => refetch()}
              className='font-semibold underline-offset-2 hover:underline'
            >
              Reintentar
            </button>
          </span>
        )}
        {data && (
          <>
            {resumen.suspension && <ChipVigente sancion={resumen.suspension} />}
            {resumen.restriccion && (
              <ChipVigente sancion={resumen.restriccion} />
            )}
            <span className='text-[12px] text-neutral-500'>
              {resumen.total === 0
                ? 'Sin sanciones'
                : `${resumen.total} ${resumen.total === 1 ? 'sanción' : 'sanciones'} en total`}
            </span>
          </>
        )}
      </div>

      {verHistorial && data && (
        <div className='mt-3'>
          <SancionesHistorial
            sanciones={data}
            acciones={(s) => (
              <RevocarSancion
                usuarioId={autor.id}
                sancion={s}
              />
            )}
          />
        </div>
      )}

      {sancionando && (
        <div className='mt-4'>
          <SancionForm
            referencia={referencia}
            enviando={aplicar.isPending}
            error={
              aplicar.isError
                ? mensajeDeError(aplicar.error, 'No se pudo aplicar la sanción.')
                : null
            }
            onSubmit={handleEnviar}
            onCancel={cerrarFormulario}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!pendiente}
        danger={pendiente?.tipo === TIPOS_SANCION.SUSPENSION}
        loading={aplicar.isPending}
        title={
          pendiente?.tipo === TIPOS_SANCION.SUSPENSION
            ? 'Suspender cuenta'
            : 'Aplicar restricción'
        }
        message={pendiente ? mensajeConfirmacion(nombre, pendiente) : ''}
        confirmLabel='Aplicar'
        onConfirm={() => aplicarSancion(pendiente)}
        onCancel={() => setPendiente(null)}
      />
    </section>
  );
}