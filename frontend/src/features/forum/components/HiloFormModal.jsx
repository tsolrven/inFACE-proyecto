import { lazy, Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Campo from '@/shared/components/form/Campo';
import { inputClasses } from '@/shared/components/form/inputClasses';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { listarRamosPorCarrera } from '@/shared/api/catalog.api';
import { normalizarHashtags, validarHashtags } from '@/shared/lib/hashtags';
import {
  agregarArchivosSinDuplicar,
  claveArchivo,
  extensionDe,
  formatearTamanio,
} from '@/shared/lib/archivos';
import { mostrarToast } from '@/shared/stores/toastStore';
import { useCrearHilo, useEditarHilo } from '@/features/forum/hooks/useHilos';
import {
  TITULO_MIN,
  TITULO_MAX,
  CONTENIDO_MAX,
  ADJUNTOS_MAX,
  ADJUNTOS_EXTENSIONES,
  ADJUNTO_MAX_MB,
  ADJUNTO_MAX_BYTES,
} from '@/features/forum/utils/limites';

// Tiptap + ProseMirror + lowlight solo se descargan al abrir el formulario
const MarkdownEditor = lazy(() => import('@/shared/editor/MarkdownEditor'));

// El backend responde { message, details: [{ field, message }] } en validaciones
function mensajeDeError(err, porDefecto) {
  const detalles = err.details?.map((d) => d.message).filter(Boolean);
  return detalles?.length ? detalles.join(' · ') : err.message || porDefecto;
}

/**
 * Formulario de hilo. Sin `hilo` = crear; con `hilo` (detalle COMPLETO, no el de
 * la lista, que viene recortado) = editar. Para editar se usa EditarHiloModal.
 */
export default function HiloFormModal({
  hilo = null,
  carreraId,
  ramoInicial = null,
  onClose,
  onGuardado,
}) {
  const editando = !!hilo;
  const crear = useCrearHilo();
  const editar = useEditarHilo();

  // Valores con los que se abrió el formulario (se fijan una sola vez)
  const [original] = useState(() => ({
    titulo: hilo?.titulo ?? '',
    contenido: (hilo?.contenido ?? '').trim(),
    hashtags: hilo?.hashtags ?? [],
    archivos: hilo?.archivos ?? [],
  }));

  // El ramo solo se elige al crear
  const { data: ramosPorSemestre } = useQuery({
    queryKey: ['ramos', carreraId],
    queryFn: () => listarRamosPorCarrera(carreraId),
    enabled: !!carreraId && !editando,
    staleTime: Infinity,
  });
  const ramos = useMemo(
    () => Object.values(ramosPorSemestre ?? {}).flat(),
    [ramosPorSemestre],
  );

  const [titulo, setTitulo] = useState(original.titulo);
  const [ramoId, setRamoId] = useState(ramoInicial ?? '');
  const [contenido, setContenido] = useState(original.contenido);
  const [hashtagsTexto, setHashtagsTexto] = useState(
    original.hashtags.map((t) => `#${t}`).join(' '),
  );
  const [archivos, setArchivos] = useState([]); // imágenes NUEVAS
  const [quitarIds, setQuitarIds] = useState([]); // ids de imágenes existentes a quitar
  const [avisosArchivos, setAvisosArchivos] = useState([]);
  const [error, setError] = useState(null);
  const [confirmandoSalir, setConfirmandoSalir] = useState(false);

  const hashtags = normalizarHashtags(hashtagsTexto);
  const errorHashtags = validarHashtags(hashtags);
  const ramoValido = ramos.some((r) => r.id === ramoId);
  const enviando = crear.isPending || editar.isPending;

  const existentesQueQuedan = original.archivos.filter(
    (a) => !quitarIds.includes(a.id),
  );
  const totalImagenes = existentesQueQuedan.length + archivos.length;
  const cupo = ADJUNTOS_MAX - existentesQueQuedan.length; // lugares para imágenes nuevas

  const tituloCambio = titulo.trim() !== original.titulo;
  const contenidoCambio = contenido !== original.contenido;
  const hashtagsCambiaron =
    hashtags.length !== original.hashtags.length ||
    hashtags.some((t) => !original.hashtags.includes(t));
  const archivosCambiaron = quitarIds.length > 0 || archivos.length > 0;

  const hayCambios = editando
    ? tituloCambio || contenidoCambio || hashtagsCambiaron || archivosCambiaron
    : titulo.trim() !== '' ||
      contenido !== '' ||
      hashtagsTexto.trim() !== '' ||
      archivos.length > 0;

  function intentarCerrar() {
    if (enviando) return;
    if (hayCambios) setConfirmandoSalir(true);
    else onClose();
  }

  function handleSeleccionarArchivos(e) {
    const elegidos = Array.from(e.target.files); // primero capturar, después vaciar
    e.target.value = ''; // permite volver a elegir el mismo archivo

    const avisos = [];
    const validos = [];
    for (const f of elegidos) {
      if (!ADJUNTOS_EXTENSIONES.includes(extensionDe(f.name))) {
        avisos.push(`"${f.name}" no es una imagen permitida`);
      } else if (f.size > ADJUNTO_MAX_BYTES) {
        avisos.push(`"${f.name}" supera ${ADJUNTO_MAX_MB} MB`);
      } else {
        validos.push(f);
      }
    }

    const combinados = agregarArchivosSinDuplicar(archivos, validos);
    if (combinados.length > cupo) {
      avisos.push(
        `Máximo ${ADJUNTOS_MAX} imágenes: se descartaron las que sobraban`,
      );
    }
    setArchivos(combinados.slice(0, Math.max(cupo, 0)));
    setAvisosArchivos(avisos);
  }

  function quitarArchivoNuevo(index) {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
    setAvisosArchivos([]);
  }

  function moverArchivoNuevo(index, delta) {
    setArchivos((prev) => {
      const destino = index + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  }

  function alternarQuitarExistente(id) {
    if (quitarIds.includes(id)) {
      // conservarla otra vez no puede pasar del máximo
      if (totalImagenes >= ADJUNTOS_MAX) {
        setAvisosArchivos([
          'Quita una imagen nueva antes de conservar esta (máximo 10).',
        ]);
        return;
      }
      setQuitarIds((prev) => prev.filter((x) => x !== id));
    } else {
      setQuitarIds((prev) => [...prev, id]);
    }
    setAvisosArchivos([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!editando && !ramoValido) {
      setError('Debes seleccionar un ramo de tu carrera.');
      return;
    }
    if (titulo.trim().length < TITULO_MIN) {
      setError(`El título debe tener al menos ${TITULO_MIN} caracteres.`);
      return;
    }
    if (contenido.length > CONTENIDO_MAX) {
      setError(
        `El contenido no puede superar ${CONTENIDO_MAX} caracteres (tiene ${contenido.length}).`,
      );
      return;
    }
    if (errorHashtags) {
      setError(errorHashtags);
      return;
    }
    if (totalImagenes > ADJUNTOS_MAX) {
      setError(`No puedes tener más de ${ADJUNTOS_MAX} imágenes.`);
      return;
    }

    try {
      if (!editando) {
        const creado = await crear.mutateAsync({
          payload: {
            ramo_id: ramoId,
            titulo: titulo.trim(),
            contenido, // '' es válido: el backend lo guarda como null
            hashtags,
          },
          archivos,
        });
        onGuardado(creado);
        return;
      }

      // Edición: solo viaja lo que cambió (el backend marca "editado" en cada PATCH)
      const payload = {};
      if (tituloCambio) payload.titulo = titulo.trim();
      if (contenidoCambio) payload.contenido = contenido;
      if (hashtagsCambiaron) payload.hashtags = hashtags;
      const hayTexto = Object.keys(payload).length > 0;

      if (!hayTexto && !archivosCambiaron) {
        onClose(); // nada que guardar
        return;
      }

      const { hilo: actualizado, fallos } = await editar.mutateAsync({
        id: hilo.id,
        payload: hayTexto ? payload : null,
        quitar: quitarIds,
        nuevos: archivos,
      });

      if (fallos.quitar > 0 || fallos.subir > 0) {
        const partes = [];
        if (fallos.quitar > 0) partes.push(`${fallos.quitar} sin quitar`);
        if (fallos.subir > 0) partes.push(`${fallos.subir} sin subir`);
        mostrarToast(
          `Se guardaron los cambios, pero algunas imágenes fallaron (${partes.join(', ')}). Revisa el hilo.`,
        );
      }
      onGuardado(actualizado);
    } catch (err) {
      setError(
        mensajeDeError(
          err,
          editando
            ? 'No se pudo guardar el hilo.'
            : 'No se pudo publicar el hilo.',
        ),
      );
    }
  }

  return (
    <>
      <Modal
        open
        onClose={intentarCerrar}
        maxWidth='680px'
      >
        <ModalHeader onClose={intentarCerrar}>
          <span className='text-[15px] font-semibold text-neutral-100'>
            {editando ? 'Editar hilo' : 'Nuevo hilo'}
          </span>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-3.5 p-5'
        >
          <Campo label='Ramo'>
            {editando ? (
              <>
                <div
                  className={`${inputClasses} cursor-not-allowed opacity-60`}
                >
                  {hilo.ramo?.nombre}
                </div>
                <p className='text-[11px] text-neutral-600'>
                  El ramo no se puede cambiar una vez publicado.
                </p>
              </>
            ) : (
              <select
                value={ramoValido ? ramoId : ''}
                onChange={(e) => setRamoId(e.target.value)}
                className={inputClasses}
              >
                <option value=''>Selecciona un ramo de tu carrera...</option>
                {Object.entries(ramosPorSemestre ?? {}).map(([sem, lista]) => (
                  <optgroup
                    key={sem}
                    label={sem === '0' ? 'Sin semestre' : `Semestre ${sem}`}
                  >
                    {lista.map((ramo) => (
                      <option
                        key={ramo.id}
                        value={ramo.id}
                      >
                        {ramo.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </Campo>

          <Campo
            label='Título'
            extra={
              <CharCounter
                value={titulo}
                max={TITULO_MAX}
              />
            }
          >
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder='Ej: ¿Cómo se resuelve una integral por partes?'
              maxLength={TITULO_MAX}
              className={inputClasses}
            />
          </Campo>

          <Campo label='Contenido (opcional)'>
            <Suspense
              fallback={
                <div className='flex h-[260px] items-center justify-center rounded-[10px] border border-white/[0.09] bg-[#17171B] text-neutral-600'>
                  <i className='ti ti-loader-2 animate-spin text-xl' />
                </div>
              }
            >
              <MarkdownEditor
                valorInicial={original.contenido}
                onChange={setContenido}
                max={CONTENIDO_MAX}
              />
            </Suspense>
          </Campo>

          <Campo label='Hashtags (opcional, separados por espacio o coma)'>
            <input
              value={hashtagsTexto}
              onChange={(e) => setHashtagsTexto(e.target.value)}
              placeholder='#calculo #integrales'
              className={inputClasses}
            />
            {errorHashtags && (
              <p className='text-[11px] text-red-400'>{errorHashtags}</p>
            )}
          </Campo>

          <Campo
            label='Imágenes (opcional)'
            extra={
              <span className='text-[10.5px] tabular-nums text-neutral-600'>
                {totalImagenes}/{ADJUNTOS_MAX}
              </span>
            }
          >
            {editando && original.archivos.length > 0 && (
              <div className='flex flex-col gap-1.5'>
                {original.archivos.map((a) => {
                  const quitada = quitarIds.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className='flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5'
                    >
                      <i className='ti ti-photo text-[13px] text-neutral-500' />
                      <span
                        className={`flex-1 truncate text-[11.5px] ${
                          quitada
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
                        onClick={() => alternarQuitarExistente(a.id)}
                        title={quitada ? 'Conservar imagen' : 'Quitar imagen'}
                        className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-red-400'
                      >
                        <i
                          className={`ti ${quitada ? 'ti-arrow-back-up' : 'ti-trash'} text-[13px]`}
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
              accept={ADJUNTOS_EXTENSIONES.join(',')}
              disabled={cupo - archivos.length <= 0}
              onChange={handleSeleccionarArchivos}
              className='text-[12.5px] text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-pink-500/10 file:px-3 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-pink-500 disabled:opacity-50'
            />
            <p className='text-[11px] text-neutral-600'>
              JPG, PNG, WEBP o GIF · hasta {ADJUNTO_MAX_MB} MB cada una.
            </p>
            {avisosArchivos.length > 0 && (
              <p className='text-[11px] text-amber-400'>
                {avisosArchivos.join(' · ')}
              </p>
            )}
            {archivos.length > 0 && (
              <div className='mt-1 flex flex-col gap-1.5'>
                {archivos.length > 1 && (
                  <p className='text-[11px] text-neutral-600'>
                    Se publicarán en este orden. Usa las flechas para cambiarlo.
                  </p>
                )}
                {archivos.map((archivo, i) => (
                  <div
                    key={claveArchivo(archivo)}
                    className='flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5'
                  >
                    <span className='w-4 text-center text-[10.5px] tabular-nums text-neutral-600'>
                      {i + 1}
                    </span>
                    <i className='ti ti-photo text-[13px] text-pink-500' />
                    <span className='flex-1 truncate text-[11.5px] text-neutral-300'>
                      {archivo.name}
                    </span>
                    <span className='text-[10.5px] text-neutral-600'>
                      {formatearTamanio(archivo.size)}
                    </span>
                    {archivos.length > 1 && (
                      <>
                        <button
                          type='button'
                          onClick={() => moverArchivoNuevo(i, -1)}
                          disabled={i === 0}
                          title='Subir'
                          aria-label='Subir imagen'
                          className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
                        >
                          <i className='ti ti-chevron-up text-[13px]' />
                        </button>
                        <button
                          type='button'
                          onClick={() => moverArchivoNuevo(i, 1)}
                          disabled={i === archivos.length - 1}
                          title='Bajar'
                          aria-label='Bajar imagen'
                          className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
                        >
                          <i className='ti ti-chevron-down text-[13px]' />
                        </button>
                      </>
                    )}
                    <button
                      type='button'
                      onClick={() => quitarArchivoNuevo(i)}
                      title='Quitar imagen'
                      aria-label='Quitar imagen'
                      className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-red-400'
                    >
                      <i className='ti ti-x text-[13px]' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Campo>

          {error && (
            <p className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-400'>
              {error}
            </p>
          )}

          <div className='mt-1 flex justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={intentarCerrar}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='primary'
              loading={enviando}
            >
              {editando ? 'Guardar cambios' : 'Publicar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmandoSalir}
        title={editando ? '¿Descartar los cambios?' : '¿Descartar el hilo?'}
        message={
          editando
            ? 'Tienes cambios sin guardar. Si sales ahora, se perderán.'
            : 'Tienes cambios sin publicar. Si sales ahora, se perderán.'
        }
        confirmLabel='Descartar'
        cancelLabel='Seguir editando'
        danger
        onConfirm={onClose}
        onCancel={() => setConfirmandoSalir(false)}
      />
    </>
  );
}
