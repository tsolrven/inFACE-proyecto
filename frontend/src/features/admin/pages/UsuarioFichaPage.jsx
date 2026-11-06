import { Link, useParams } from 'react-router-dom';
import AutorPanel from '@/features/admin/components/AutorPanel';
import { useFichaUsuario } from '@/features/admin/hooks/useUsuarios';
import { mensajeDeError } from '@/shared/lib/errores';
import {
  ROL_LABEL,
  ESTADO_CUENTA_LABEL,
  ESTADO_CUENTA_BADGE,
} from '@/features/admin/utils/usuarioUi';

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL', { dateStyle: 'medium' });
}

function Contador({ valor, etiqueta, detalle }) {
  return (
    <div className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'>
      <p className='text-[22px] font-bold leading-none text-neutral-100'>
        {valor}
      </p>
      <p className='mt-1.5 text-[12px] font-medium text-neutral-300'>
        {etiqueta}
      </p>
      {detalle && (
        <p className='mt-0.5 text-[11px] text-neutral-500'>{detalle}</p>
      )}
    </div>
  );
}

export default function UsuarioFichaPage() {
  const { id } = useParams();
  const { data: u, isPending, isError, error, refetch } = useFichaUsuario(id);

  return (
    <div className='mx-auto w-full max-w-[820px] px-6 py-10'>
      <Link
        to='/admin/usuarios'
        className='mb-5 inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 transition hover:text-neutral-200'
      >
        <i className='ti ti-arrow-left text-[14px]' />
        Volver a Usuarios
      </Link>

      {isPending && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {isError && (
        <div className='flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>{mensajeDeError(error, 'No se pudo cargar el usuario.')}</span>
          <button
            type='button'
            onClick={() => refetch()}
            className='flex-shrink-0 font-semibold underline-offset-2 hover:underline'
          >
            Reintentar
          </button>
        </div>
      )}

      {u && (
        <>
          <div className='mb-6'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-xl font-bold text-neutral-100'>
                @{u.nombre_usuario}
              </h1>
              <span className='rounded-full bg-pink-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-pink-400'>
                {ROL_LABEL[u.rol] ?? u.rol}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_CUENTA_BADGE[u.estado_cuenta] ?? 'bg-emerald-400/10 text-emerald-400'}`}
              >
                {ESTADO_CUENTA_LABEL[u.estado_cuenta] ?? 'Activa'}
              </span>
            </div>
            {u.nombre_completo && (
              <p className='mt-1 text-[13.5px] text-neutral-400'>
                {u.nombre_completo}
              </p>
            )}
            <p className='mt-1 text-[12px] text-neutral-500'>
              {u.carreras.length > 0
                ? u.carreras.map((c) => c.nombre).join(' · ')
                : 'Sin carrera'}
              {' · '}Registrado el {formatearFecha(u.creado_en)}
            </p>
            {u.eliminacion_programada_en && (
              <p className='mt-1 text-[12px] text-amber-400'>
                Eliminación programada para el{' '}
                {formatearFecha(u.eliminacion_programada_en)}
              </p>
            )}
          </div>

          <h2 className='mb-2.5 text-[13px] font-semibold text-neutral-300'>
            Reportes
          </h2>
          <div className='mb-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3'>
            <Contador
              valor={u.reportes.recibidos}
              etiqueta='Reportes recibidos'
              detalle={`${u.reportes.recibidos_pendientes} pendiente${u.reportes.recibidos_pendientes === 1 ? '' : 's'}`}
            />
            <Contador
              valor={u.reportes.contenido_eliminado_moderacion}
              etiqueta='Contenidos eliminados por moderación'
              detalle='Solo cuenta los que tuvieron reportes'
            />
            <Contador
              valor={u.reportes.realizados}
              etiqueta='Reportes realizados'
              detalle={`${u.reportes.realizados_descartados} descartado${u.reportes.realizados_descartados === 1 ? '' : 's'}`}
            />
          </div>
          <p className='mb-6 text-[11.5px] text-neutral-500'>
            Los números son solo contexto: por sí solos no indican un uso
            indebido.
          </p>

          <AutorPanel
            titulo='Sanciones'
            autor={{ id: u.id, perfil: { nombre_usuario: u.nombre_usuario } }}
          />
        </>
      )}
    </div>
  );
}