import { lazy, Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { listarRamosPorCarrera } from '@/shared/api/catalog.api';
import { normalizarHashtags, validarHashtags } from '@/shared/lib/hashtags';
import {
  agregarArchivosSinDuplicar,
  claveArchivo,
  extensionDe,
} from '@/shared/lib/archivos';
import { useCrearHilo } from '@/features/forum/hooks/useHilos';
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

const inputClasses =
  'w-full rounded-[10px] border border-white/[0.07] bg-[#111114] px-3 py-2 text-[13px] text-neutral-100 outline-none transition-colors placeholder-neutral-600 focus:border-pink-500/40';

function Campo({ label, extra, children }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between'>
        <span className='text-[11.5px] font-semibold text-neutral-500'>
          {label}
        </span>
        {extra}
      </div>
      {children}
    </div>
  );
}

function formatearTamanio(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// El backend responde { message, details: [{ field, message }] } en validaciones
function mensajeDeError(err) {
  const detalles = err.details?.map((d) => d.message).filter(Boolean);
  return detalles?.length
    ? detalles.join(' · ')
    : err.message || 'No se pudo publicar el hilo.';
}

export default function HiloFormModal({
  carreraId,
  ramoInicial = null,
  onClose,
  onCreado,
}) {
  const crear = useCrearHilo();

  const { data: ramosPorSemestre } = useQuery({
    queryKey: ['ramos', carreraId],
    queryFn: () => listarRamosPorCarrera(carreraId),
    enabled: !!carreraId,
    staleTime: Infinity,
  });
  const ramos = useMemo(
    () => Object.values(ramosPorSemestre ?? {}).flat(),
    [ramosPorSemestre],
  );

  const [titulo, setTitulo] = useState('');
  const [ramoId, setRamoId] = useState(ramoInicial ?? '');
  const [contenido, setContenido] = useState('');
  const [hashtagsTexto, setHashtagsTexto] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [avisosArchivos, setAvisosArchivos] = useState([]);
  const [error, setError] = useState(null);
  const [confirmandoSalir, setConfirmandoSalir] = useState(false);

  const hashtags = normalizarHashtags(hashtagsTexto);
  const errorHashtags = validarHashtags(hashtags);
  const ramoValido = ramos.some((r) => r.id === ramoId);
  const enviando = crear.isPending;
  const hayCambios =
    titulo.trim() !== '' ||
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
    if (combinados.length > ADJUNTOS_MAX) {
      avisos.push(
        `Máximo ${ADJUNTOS_MAX} imágenes: se descartaron las que sobraban`,
      );
    }
    setArchivos(combinados.slice(0, ADJUNTOS_MAX));
    setAvisosArchivos(avisos);
  }

  function quitarArchivo(index) {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
    setAvisosArchivos([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!ramoValido) {
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

    try {
      const hilo = await crear.mutateAsync({
        payload: {
          ramo_id: ramoId,
          titulo: titulo.trim(),
          contenido, // '' es válido: el backend lo guarda como null
          hashtags,
        },
        archivos,
      });
      onCreado(hilo);
    } catch (err) {
      setError(mensajeDeError(err));
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
            Nuevo hilo
          </span>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-3.5 p-5'
        >
          <Campo label='Ramo'>
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
                {archivos.length}/{ADJUNTOS_MAX}
              </span>
            }
          >
            <input
              type='file'
              multiple
              accept={ADJUNTOS_EXTENSIONES.join(',')}
              disabled={archivos.length >= ADJUNTOS_MAX}
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
                {archivos.map((archivo, i) => (
                  <div
                    key={claveArchivo(archivo)}
                    className='flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5'
                  >
                    <i className='ti ti-photo text-[13px] text-neutral-500' />
                    <span className='flex-1 truncate text-[11.5px] text-neutral-300'>
                      {archivo.name}
                    </span>
                    <span className='text-[10.5px] text-neutral-600'>
                      {formatearTamanio(archivo.size)}
                    </span>
                    <button
                      type='button'
                      onClick={() => quitarArchivo(i)}
                      title='Quitar imagen'
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
              Publicar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmandoSalir}
        title='¿Descartar el hilo?'
        message='Tienes cambios sin publicar. Si sales ahora, se perderán.'
        confirmLabel='Descartar'
        cancelLabel='Seguir editando'
        danger
        onConfirm={onClose}
        onCancel={() => setConfirmandoSalir(false)}
      />
    </>
  );
}
