import { lazy, Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Campo from '@/shared/components/form/Campo';
import HashtagsInput from '@/shared/components/form/HashtagsInput';
import { inputClasses } from '@/shared/components/form/inputClasses';
import ArchivosInput from '@/shared/components/form/ArchivosInput';
import { useArchivosForm } from '@/shared/hooks/useArchivosForm';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { listarRamosPorCarrera } from '@/shared/api/catalog.api';
import { normalizarHashtags, validarHashtags } from '@/shared/lib/hashtags';
import { mensajeDeError } from '@/shared/lib/errores';
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
  const imagenes = useArchivosForm({
    existentes: original.archivos,
    max: ADJUNTOS_MAX,
    maxBytes: ADJUNTO_MAX_BYTES,
    extensiones: ADJUNTOS_EXTENSIONES,
    singular: 'imagen',
    plural: 'imágenes',
  });
  const [error, setError] = useState(null);
  const [confirmandoSalir, setConfirmandoSalir] = useState(false);

  const hashtags = normalizarHashtags(hashtagsTexto);
  const errorHashtags = validarHashtags(hashtags);
  const ramoValido = ramos.some((r) => r.id === ramoId);
  const enviando = crear.isPending || editar.isPending;

  const tituloCambio = titulo.trim() !== original.titulo;
  const contenidoCambio = contenido !== original.contenido;
  const hashtagsCambiaron =
    hashtags.length !== original.hashtags.length ||
    hashtags.some((t) => !original.hashtags.includes(t));
  const archivosCambiaron = imagenes.hayCambios;

  const hayCambios = editando
    ? tituloCambio || contenidoCambio || hashtagsCambiaron || archivosCambiaron
    : titulo.trim() !== '' ||
      contenido !== '' ||
      hashtagsTexto.trim() !== '' ||
      imagenes.hayCambios;

  function intentarCerrar() {
    if (enviando) return;
    if (hayCambios) setConfirmandoSalir(true);
    else onClose();
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
    if (imagenes.total > ADJUNTOS_MAX) {
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
          archivos: imagenes.nuevos,
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
        quitar: imagenes.quitarIds,
        nuevos: imagenes.nuevos,
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
                ariaLabel='Contenido del hilo'
                placeholder='Cuenta tu duda o aporte con el detalle que puedas…'
              />
            </Suspense>
          </Campo>

          <HashtagsInput
            value={hashtagsTexto}
            onChange={setHashtagsTexto}
            error={errorHashtags}
          />

          <ArchivosInput
            control={imagenes}
            label='Imágenes (opcional)'
            ayuda={`JPG, PNG, WEBP o GIF · hasta ${ADJUNTO_MAX_MB} MB cada una.`}
            iconoDe={() => 'ti-photo'}
          />

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
