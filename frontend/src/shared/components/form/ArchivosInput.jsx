import Campo from '@/shared/components/form/Campo';
import { claveArchivo, formatearTamanio } from '@/shared/lib/archivos';

const FILA =
  'flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5';
const BOTON =
  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06]';

// Campo de archivos de un formulario. Solo dibuja: el estado viene de useArchivosForm.
//   control:    lo que devuelve useArchivosForm
//   ayuda:      texto bajo el selector (formatos y tamaño, propios de cada módulo)
//   iconoDe:    (archivo) => clase del icono Tabler, ej. 'ti-photo'
export default function ArchivosInput({
  control,
  label,
  ayuda = null,
  iconoDe = () => 'ti-file',
  textoOrden = 'Se publicarán en este orden. Usa las flechas para cambiarlo.',
}) {
  const {
    existentes,
    nuevos,
    quitarIds,
    avisos,
    total,
    max,
    cupo,
    extensiones,
    singular,
    agregar,
    quitarNuevo,
    mover,
    alternarExistente,
  } = control;

  function handleChange(e) {
    const elegidos = Array.from(e.target.files); // primero capturar, después vaciar
    e.target.value = ''; // permite volver a elegir el mismo archivo
    agregar(elegidos);
  }

  return (
    <Campo
      label={label}
      extra={
        <span className='text-[10.5px] tabular-nums text-neutral-600'>
          {total}/{max}
        </span>
      }
    >
      {existentes.length > 0 && (
        <div className='flex flex-col gap-1.5'>
          {existentes.map((a) => {
            const quitado = quitarIds.includes(a.id);
            return (
              <div
                key={a.id}
                className={FILA}
              >
                <i
                  className={`ti ${iconoDe(a)} text-[13px] text-neutral-500`}
                />
                <span
                  className={`flex-1 truncate text-[11.5px] ${
                    quitado
                      ? 'text-neutral-600 line-through'
                      : 'text-neutral-300'
                  }`}
                >
                  {a.nombre_archivo}
                </span>
                {a.tamanio > 0 && (
                  <span className='text-[10.5px] text-neutral-600'>
                    {formatearTamanio(a.tamanio)}
                  </span>
                )}
                <button
                  type='button'
                  onClick={() => alternarExistente(a.id)}
                  title={
                    quitado ? `Conservar ${singular}` : `Quitar ${singular}`
                  }
                  aria-label={
                    quitado ? `Conservar ${singular}` : `Quitar ${singular}`
                  }
                  className={`${BOTON} hover:text-red-400`}
                >
                  <i
                    className={`ti ${quitado ? 'ti-arrow-back-up' : 'ti-trash'} text-[13px]`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <input
        type='file'
        multiple
        accept={extensiones?.join(',')}
        disabled={cupo - nuevos.length <= 0}
        onChange={handleChange}
        className='text-[12.5px] text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-pink-500/10 file:px-3 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-pink-500 disabled:opacity-50'
      />
      {ayuda && <p className='text-[11px] text-neutral-600'>{ayuda}</p>}
      {avisos.length > 0 && (
        <p className='text-[11px] text-amber-400'>{avisos.join(' · ')}</p>
      )}

      {nuevos.length > 0 && (
        <div className='mt-1 flex flex-col gap-1.5'>
          {nuevos.length > 1 && (
            <p className='text-[11px] text-neutral-600'>{textoOrden}</p>
          )}
          {nuevos.map((archivo, i) => (
            <div
              key={claveArchivo(archivo)}
              className={FILA}
            >
              <span className='w-4 text-center text-[10.5px] tabular-nums text-neutral-600'>
                {i + 1}
              </span>
              <i
                className={`ti ${iconoDe(archivo)} text-[13px] text-pink-500`}
              />
              <span className='flex-1 truncate text-[11.5px] text-neutral-300'>
                {archivo.name}
              </span>
              <span className='text-[10.5px] text-neutral-600'>
                {formatearTamanio(archivo.size)}
              </span>
              {nuevos.length > 1 && (
                <>
                  <button
                    type='button'
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    title='Subir'
                    aria-label={`Subir ${singular}`}
                    className={`${BOTON} hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`}
                  >
                    <i className='ti ti-chevron-up text-[13px]' />
                  </button>
                  <button
                    type='button'
                    onClick={() => mover(i, 1)}
                    disabled={i === nuevos.length - 1}
                    title='Bajar'
                    aria-label={`Bajar ${singular}`}
                    className={`${BOTON} hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`}
                  >
                    <i className='ti ti-chevron-down text-[13px]' />
                  </button>
                </>
              )}
              <button
                type='button'
                onClick={() => quitarNuevo(i)}
                title={`Quitar ${singular}`}
                aria-label={`Quitar ${singular}`}
                className={`${BOTON} hover:text-red-400`}
              >
                <i className='ti ti-x text-[13px]' />
              </button>
            </div>
          ))}
        </div>
      )}
    </Campo>
  );
}
