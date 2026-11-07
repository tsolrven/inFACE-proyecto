import { useEffect, useId, useMemo } from 'react';
import Campo from '@/shared/components/form/Campo';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import {
  ADJUNTO_MAX_BYTES,
  ADJUNTO_MAX_MB,
  EXT_IMAGENES,
} from '@/features/creative-space/utils/limites';
import { normalizarImagen } from '@/features/creative-space/utils/normalizarImagen';
import { extensionDe } from '@/shared/lib/archivos';

export default function ImagenUnicaInput({
  label,
  ayuda,
  existenteId = null,
  file = null,
  quitada = false,
  onFile,
  onQuitarExistente,
  onError,
  compacta = false,
}) {
  const inputId = useId();
  const vistaPrevia = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(
    () => () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    },
    [vistaPrevia],
  );

  async function elegir(e) {
    const elegido = e.target.files?.[0];
    e.target.value = '';
    if (!elegido) return;
    const f = await normalizarImagen(elegido);
    if (!EXT_IMAGENES.includes(extensionDe(f.name))) {
      onError?.(`"${f.name}" no es un formato permitido`);
      return;
    }
    if (f.size > ADJUNTO_MAX_BYTES) {
      onError?.(`"${f.name}" supera ${ADJUNTO_MAX_MB} MB`);
      return;
    }
    onFile(f);
  }

  const hayExistente = !!existenteId && !quitada && !file;
  const hayAlgo = !!file || hayExistente;
  const tam = compacta ? 'h-16 w-16' : 'h-28 w-28';

  const cuerpo = (
    <div className='flex items-center gap-3'>
      <div
        className={`${tam} flex-shrink-0 overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#17171B]`}
      >
        {vistaPrevia ? (
          <img
            src={vistaPrevia}
            alt='Vista previa'
            className='h-full w-full object-cover'
          />
        ) : hayExistente ? (
          <ImagenObra
            archivoId={existenteId}
            className='h-full w-full'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-neutral-700'>
            <i className='ti ti-photo-plus text-2xl' />
          </div>
        )}
      </div>
      <div className='flex flex-col items-start gap-1.5'>
        <label
          htmlFor={inputId}
          className='cursor-pointer rounded-full bg-white/[0.07] px-3 py-1.5 text-[12px] font-semibold text-neutral-200 hover:bg-white/[0.12]'
        >
          {hayAlgo ? 'Cambiar' : 'Elegir imagen'}
        </label>
        <input
          id={inputId}
          type='file'
          accept={EXT_IMAGENES.join(',')}
          onChange={elegir}
          className='hidden'
        />
        {hayAlgo && (
          <button
            type='button'
            onClick={() => (file ? onFile(null) : onQuitarExistente?.())}
            className='text-[11.5px] text-neutral-500 hover:text-red-400'
          >
            Quitar
          </button>
        )}
        {ayuda && <p className='text-[11px] text-neutral-600'>{ayuda}</p>}
      </div>
    </div>
  );

  return label ? <Campo label={label}>{cuerpo}</Campo> : cuerpo;
}
