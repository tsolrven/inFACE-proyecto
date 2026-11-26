import { Link } from 'react-router-dom';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';

const CARGO_UI = {
  cee: { icono: 'ti-building-community', etiqueta: 'CEE' },
  tutor: { icono: 'ti-school', etiqueta: 'Tutor' },
};

// "COMUNICADO OFICIAL · CEE ICINF" con el ícono del cargo: el emisor es lo
// importante; u/autor queda como dato secundario
export default function EncabezadoOficial({ anuncio, grande = false }) {
  const cargo = CARGO_UI[anuncio.autor?.cargo];

  return (
    <div className='flex min-w-0 items-center gap-3'>
      <div
        className={`flex flex-shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 ${grande ? 'h-12 w-12 text-[24px]' : 'h-10 w-10 text-[20px]'
          }`}
      >
        <i className={`ti ${cargo?.icono ?? 'ti-speakerphone'}`} />
      </div>
      <div className='min-w-0'>
        <div className='truncate text-[11px] font-bold uppercase tracking-wide text-amber-400'>
          Comunicado oficial · {cargo?.etiqueta ?? 'Anuncio'}{' '}
          {anuncio.carrera?.codigo}
        </div>
        <div className='flex flex-wrap items-center gap-x-1 text-[11.5px] text-neutral-500'>
          <Link
            to={`/perfil/usuario/${anuncio.autor?.nombre_usuario}`}
            onClick={(e) => e.stopPropagation()}
            className='transition hover:text-neutral-200 hover:underline'
          >
            u/{anuncio.autor?.nombre_usuario}
          </Link>
          <span>· {formatearTiempoRelativo(anuncio.creado_en)}</span>
          {anuncio.editado_en && (
            <span className='text-neutral-600'>· editado</span>
          )}
        </div>
      </div>
    </div>
  );
}