import { useNavigate, useLocation } from 'react-router-dom';
import { useRepositorioStore } from '../../stores/repositorioStore';
import { colorPorRamo } from '../../utils/ramoColors';
import {
  metaPrincipal,
  metaDeArchivo,
  formatearTamanio,
} from '../../utils/fileMeta';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';
import { descargarArchivo } from '../../services/repositorioMateriales/archivo.service';

export default function MaterialCard({ apunte }) {
  const navigate = useNavigate();
  const location = useLocation();
  const votar = useRepositorioStore((s) => s.votar);

  const iconMeta = metaPrincipal(apunte);
  const ramoColor = colorPorRamo(apunte.ramo?.id);

  function abrirDetalle() {
    navigate(`/repositorio-materiales/${apunte.id}`, {
      state: { backgroundLocation: location },
    });
  }

  function handleVotar(e, tipo) {
    e.stopPropagation();
    votar(apunte.id, tipo);
  }

  return (
    <div
      onClick={abrirDetalle}
      className='mb-2 flex cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.12]'
    >
      {/* columna ícono de archivo */}
      <div className='flex w-[52px] flex-shrink-0 items-center justify-center border-r border-white/[0.07]'>
        <div
          className='flex h-[34px] w-[34px] items-center justify-center rounded-[10px]'
          style={{ background: iconMeta.bg }}
        >
          <i
            className={`ti ${iconMeta.icon} text-lg`}
            style={{ color: iconMeta.color }}
          />
        </div>
      </div>

      {/* columna votos */}
      <div
        onClick={(e) => e.stopPropagation()}
        className='flex min-w-[40px] flex-col items-center gap-0.5 border-r border-white/[0.07] bg-white/[0.02] px-1.5 py-2.5'
      >
        <button
          type='button'
          onClick={(e) => handleVotar(e, 'up')}
          className={`flex h-[26px] w-[26px] items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,107,53,0.1)] hover:text-[#FF6B35] ${
            apunte.mi_voto === 'up' ? 'text-[#FF6B35]' : 'text-neutral-600'
          }`}
        >
          <i
            className={`ti ${apunte.mi_voto === 'up' ? 'ti-arrow-big-up-filled' : 'ti-arrow-big-up'} text-base`}
          />
        </button>
        <span
          className={`text-xs font-bold leading-none ${
            apunte.mi_voto === 'up'
              ? 'text-[#FF6B35]'
              : apunte.mi_voto === 'down'
                ? 'text-[#7B8CDE]'
                : 'text-neutral-400'
          }`}
        >
          {apunte.votos_neto}
        </span>
        <button
          type='button'
          onClick={(e) => handleVotar(e, 'down')}
          className={`flex h-[26px] w-[26px] items-center justify-center rounded-md transition-colors hover:bg-[rgba(123,140,222,0.1)] hover:text-[#7B8CDE] ${
            apunte.mi_voto === 'down' ? 'text-[#7B8CDE]' : 'text-neutral-600'
          }`}
        >
          <i
            className={`ti ${apunte.mi_voto === 'down' ? 'ti-arrow-big-down-filled' : 'ti-arrow-big-down'} text-base`}
          />
        </button>
      </div>

      {/* cuerpo */}
      <div className='min-w-0 flex-1 p-3'>
        <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
          <span
            className='rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
            style={{ background: `${ramoColor}22`, color: ramoColor }}
          >
            {apunte.ramo?.nombre}
          </span>
          <span className='text-[11.5px] text-neutral-600'>
            por{' '}
            <b className='text-neutral-400'>u/{apunte.autor?.nombre_usuario}</b>
          </span>
          <span className='text-[11px] text-neutral-600'>
            · {formatearTiempoRelativo(apunte.creado_en)}
          </span>
        </div>

        <div className='mb-1 cursor-pointer text-sm font-semibold leading-snug text-neutral-100 hover:text-blue-400'>
          {apunte.titulo}
        </div>

        {apunte.descripcion && (
          <p className='mb-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400'>
            {apunte.descripcion}
          </p>
        )}

        <ArchivosPreview apunte={apunte} />

        {apunte.hashtags?.length > 0 && (
          <div className='mb-1.5 flex flex-wrap gap-1.5'>
            {apunte.hashtags.map((tag) => (
              <span
                key={tag}
                className='text-[11px] text-blue-400'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className='flex flex-wrap items-center gap-3 border-t border-white/[0.05] pt-1.5 text-[11.5px] text-neutral-500'>
          <button
            type='button'
            onClick={(e) => e.stopPropagation()}
            className='flex items-center gap-1 transition-colors hover:text-neutral-200'
          >
            <i className='ti ti-message-circle-2 text-[13px]' />{' '}
            {apunte.comentarios_count} comentarios
          </button>
          <span className='flex items-center gap-1'>
            <i className='ti ti-download text-[13px]' />{' '}
            {apunte.descargas ?? '—'} descargas
          </span>
          <button
            type='button'
            onClick={(e) => e.stopPropagation()}
            className='flex items-center gap-1 transition-colors hover:text-neutral-200'
          >
            <i className='ti ti-share-3 text-[13px]' /> Compartir
          </button>
          <button
            type='button'
            onClick={(e) => e.stopPropagation()}
            className='flex items-center gap-1 transition-colors hover:text-neutral-200'
          >
            <i className='ti ti-bookmark text-[13px]' /> Guardar
          </button>
          <button
            type='button'
            onClick={(e) => e.stopPropagation()}
            className='ml-auto flex items-center gap-1 transition-colors hover:text-red-400'
          >
            <i className='ti ti-flag text-[13px]' /> Reportar
          </button>
        </div>
      </div>
    </div>
  );
}

function ArchivosPreview({ apunte }) {
  if (apunte.link_repositorio) {
    return (
      <div className='mb-1.5 flex items-center gap-2 rounded-md border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.05)] px-2 py-1.5'>
        <i className='ti ti-brand-github text-[15px] text-[#818CF8]' />
        <span className='flex-1 truncate text-[11.5px] font-medium text-[#818CF8]'>
          {apunte.link_repositorio}
        </span>
      </div>
    );
  }

  if (apunte.codigo_snippet) {
    return (
      <pre className='mb-1.5 max-h-24 overflow-hidden rounded-md border border-white/[0.07] bg-black/30 px-2.5 py-2 text-[11px] text-emerald-300'>
        <code>{apunte.codigo_snippet.slice(0, 220)}</code>
      </pre>
    );
  }

  if (!apunte.archivos?.length) return null;

  return (
    <div className='mb-1.5 flex flex-col gap-1'>
      {apunte.archivos.map((archivo) => {
        const meta = metaDeArchivo(archivo);
        return (
          <div
            key={archivo.id}
            className='flex items-center gap-2.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1.5'
          >
            <i
              className={`ti ${meta.icon} flex-shrink-0 text-sm`}
              style={{ color: meta.color }}
            />
            <span className='flex-1 truncate text-[11.5px] font-medium text-neutral-300'>
              {archivo.nombre_archivo}
            </span>
            <span className='flex-shrink-0 text-[10.5px] text-neutral-600'>
              {formatearTamanio(archivo.tamanio)}
            </span>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                descargarArchivo(archivo);
              }}
              className='flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-400 hover:opacity-75'
            >
              <i className='ti ti-download text-[13px]' /> Descargar
            </button>
          </div>
        );
      })}
    </div>
  );
}
