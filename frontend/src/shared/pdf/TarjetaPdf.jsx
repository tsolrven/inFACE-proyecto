import { useRef } from 'react';
import { descargarArchivo } from '@/shared/api/archivos.api';
import { formatearTamanio } from '@/shared/lib/archivos';
import { mostrarToast } from '@/shared/stores/toastStore';
import { useEnPantalla } from '@/shared/hooks/useEnPantalla';
import { useMiniaturaPdf } from '@/shared/pdf/pdfDatos';

// Tarjeta tipo Gmail. Normal: miniatura + franja con ícono y nombre.
// Con el cursor (o el foco): nombre completo, peso y "Descargar".
// Toda la tarjeta es un botón que abre el visor; "Descargar" va aparte.
export default function TarjetaPdf({ archivo, onAbrir }) {
  const ref = useRef(null);
  const enPantalla = useEnPantalla(ref);
  const { data: miniatura } = useMiniaturaPdf(archivo, { enabled: enPantalla });

  async function descargar(e) {
    e.stopPropagation();
    try {
      await descargarArchivo(archivo);
    } catch (err) {
      mostrarToast(err.message || 'No se pudo descargar el archivo');
    }
  }

  return (
    <div
      ref={ref}
      className='group relative h-[150px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#17171B] transition-colors hover:border-white/[0.2]'
    >
      {/* el botón cubre la tarjeta; lo visual va encima sin capturar clics */}
      <button
        type='button'
        onClick={onAbrir}
        aria-label={`Ver ${archivo.nombre_archivo}`}
        className='absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400'
      />

      <div className='pointer-events-none relative h-[106px] overflow-hidden bg-white/[0.03]'>
        {miniatura ? (
          <img
            src={miniatura}
            alt=''
            className='h-full w-full bg-white object-cover object-top'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <i className='ti ti-file-type-pdf text-[40px] text-[#E8546A]/70' />
          </div>
        )}
      </div>

      <div className='pointer-events-none relative flex h-[44px] items-center gap-2 border-t border-white/[0.07] px-2.5'>
        <i className='ti ti-file-type-pdf flex-shrink-0 text-[17px] text-[#E8546A]' />
        <span className='min-w-0 flex-1 truncate text-[12px] font-medium text-neutral-200'>
          {archivo.nombre_archivo}
        </span>
        {/* sin cursor (celular): descargar siempre a mano */}
        <button
          type='button'
          onClick={descargar}
          aria-label={`Descargar ${archivo.nombre_archivo}`}
          className='pointer-events-auto relative z-10 hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-white/[0.08] [@media(hover:none)]:flex'
        >
          <i className='ti ti-download text-[15px]' />
        </button>
      </div>

      {/* capa al pasar el cursor o con foco de teclado */}
      <div className='pointer-events-none absolute inset-0 z-10 flex flex-col bg-[#26262D]/95 p-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:hidden'>
        <div className='flex min-w-0 gap-2'>
          <i className='ti ti-file-type-pdf flex-shrink-0 text-[18px] text-[#E8546A]' />
          <div className='min-w-0'>
            <p className='line-clamp-3 break-words text-[12px] font-semibold leading-snug text-neutral-100'>
              {archivo.nombre_archivo}
            </p>
            <p className='mt-1 text-[11px] text-neutral-400'>
              {formatearTamanio(archivo.tamanio)}
            </p>
          </div>
        </div>
        <button
          type='button'
          onClick={descargar}
          aria-label={`Descargar ${archivo.nombre_archivo}`}
          className='pointer-events-auto mt-auto ml-[26px] flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.15] text-neutral-200 transition-colors hover:bg-white/[0.1]'
        >
          <i className='ti ti-download text-[15px]' />
        </button>
      </div>
    </div>
  );
}