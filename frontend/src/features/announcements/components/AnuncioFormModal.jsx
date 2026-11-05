import { lazy, Suspense, useState } from 'react';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Campo from '@/shared/components/form/Campo';
import HashtagsInput from '@/shared/components/form/HashtagsInput';
import { inputClasses } from '@/shared/components/form/inputClasses';
import ArchivosInput from '@/shared/components/form/ArchivosInput';
import { useArchivosForm } from '@/shared/hooks/useArchivosForm';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { extensionDe } from '@/shared/lib/archivos';
import { normalizarHashtags, validarHashtags } from '@/shared/lib/hashtags';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useCrearAnuncio,
  useEditarAnuncio,
} from '@/features/announcements/hooks/useAnuncios';
import { useFlairs } from '@/features/announcements/hooks/useFlairs';
import { clasesFlair } from '@/features/announcements/utils/flairColors';
import {
  TITULO_MIN,
  TITULO_MAX,
  CONTENIDO_MAX,
  ADJUNTOS_MAX,
  ADJUNTOS_EXTENSIONES,
  ADJUNTO_MAX_MB,
  ADJUNTO_MAX_BYTES,
} from '@/features/announcements/utils/limites';

// Tiptap + ProseMirror + lowlight solo se descargan al abrir el formulario
const MarkdownEditor = lazy(() => import('@/shared/editor/MarkdownEditor'));

// Recibe un archivo ya guardado ({ nombre_archivo }) o uno nuevo (File: { name })
function iconoDeAdjunto(archivo) {
  const nombre = archivo.nombre_archivo ?? archivo.name ?? '';
  return extensionDe(nombre) === '.pdf' ? 'ti-file-type-pdf' : 'ti-photo';
}

/**
 * Formulario de anuncio. Sin `anuncio` = crear en `carreraId`; con `anuncio`
 * (detalle COMPLETO, no el de la lista, que viene recortado) = editar. Para
 * editar se usa EditarAnuncioModal. La carrera nunca se elige ni se envía: el
 * backend usa la del usuario.
 */
export default function AnuncioFormModal({
  anuncio = null,
  carreraId,
  onClose,
  onGuardado,
}) {
  const editando = !!anuncio;
  const crear = useCrearAnuncio();
  const editar = useEditarAnuncio();

  // Los flairs son de la carrera del anuncio (al editar) o de la del formulario
  const { data: flairs = [] } = useFlairs(anuncio?.carrera?.id ?? carreraId);

  // Valores con los que se abrió el formulario (se fijan una sola vez)
  const [original] = useState(() => ({
    titulo: anuncio?.titulo ?? '',
    contenido: (anuncio?.contenido ?? '').trim(),
    flairId: anuncio?.flair?.id ?? null,
    hashtags: anuncio?.hashtags ?? [],
    archivos: anuncio?.archivos ?? [],
  }));

  const [titulo, setTitulo] = useState(original.titulo);
  const [contenido, setContenido] = useState(original.contenido);
  const [flairId, setFlairId] = useState(original.flairId);
  const [hashtagsTexto, setHashtagsTexto] = useState(
    original.hashtags.map((t) => `#${t}`).join(' '),
  );
  const archivos = useArchivosForm({
    existentes: original.archivos,
    max: ADJUNTOS_MAX,
    maxBytes: ADJUNTO_MAX_BYTES,
    extensiones: ADJUNTOS_EXTENSIONES,
    singular: 'archivo',
    plural: 'archivos',
  });
  const [error, setError] = useState(null);
  const [confirmandoSalir, setConfirmandoSalir] = useState(false);

  const hashtags = normalizarHashtags(hashtagsTexto);
  const errorHashtags = validarHashtags(hashtags);
  const enviando = crear.isPending || editar.isPending;

  const tituloCambio = titulo.trim() !== original.titulo;
  const contenidoCambio = contenido !== original.contenido;
  const flairCambio = flairId !== original.flairId;
  const hashtagsCambiaron =
    hashtags.length !== original.hashtags.length ||
    hashtags.some((t) => !original.hashtags.includes(t));
  const archivosCambiaron = archivos.hayCambios;

  const hayCambios = editando
    ? tituloCambio ||
      contenidoCambio ||
      flairCambio ||
      hashtagsCambiaron ||
      archivosCambiaron
    : titulo.trim() !== '' ||
      contenido !== '' ||
      flairId !== null ||
      hashtagsTexto.trim() !== '' ||
      archivosCambiaron;

  function intentarCerrar() {
    if (enviando) return;
    if (hayCambios) setConfirmandoSalir(true);
    else onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

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
    if (archivos.total > ADJUNTOS_MAX) {
      setError(`No puedes tener más de ${ADJUNTOS_MAX} archivos.`);
      return;
    }

    try {
      if (!editando) {
        const creado = await crear.mutateAsync({
          payload: {
            titulo: titulo.trim(),
            contenido, // '' es válido: el backend lo guarda como null
            hashtags,
            ...(flairId && { flair_id: flairId }),
          },
          archivos: archivos.nuevos,
        });
        onGuardado(creado);
        return;
      }

      // Edición: solo viaja lo que cambió (el backend marca "editado" en cada PATCH)
      const payload = {};
      if (tituloCambio) payload.titulo = titulo.trim();
      if (contenidoCambio) payload.contenido = contenido;
      if (flairCambio) payload.flair_id = flairId; // null = quitar el flair
      if (hashtagsCambiaron) payload.hashtags = hashtags;
      const hayCampos = Object.keys(payload).length > 0;

      if (!hayCampos && !archivosCambiaron) {
        onClose(); // nada que guardar
        return;
      }

      const { anuncio: actualizado, fallos } = await editar.mutateAsync({
        id: anuncio.id,
        payload: hayCampos ? payload : null,
        quitar: archivos.quitarIds,
        nuevos: archivos.nuevos,
      });

      if (fallos.quitar > 0 || fallos.subir > 0) {
        const partes = [];
        if (fallos.quitar > 0) partes.push(`${fallos.quitar} sin quitar`);
        if (fallos.subir > 0) partes.push(`${fallos.subir} sin subir`);
        mostrarToast(
          `Se guardaron los cambios, pero algunos archivos fallaron (${partes.join(', ')}). Revisa el anuncio.`,
        );
      }
      onGuardado(actualizado);
    } catch (err) {
      setError(
        mensajeDeError(
          err,
          editando
            ? 'No se pudo guardar el anuncio.'
            : 'No se pudo publicar el anuncio.',
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
            {editando ? 'Editar anuncio' : 'Nuevo anuncio'}
          </span>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-3.5 p-5'
        >
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
              placeholder='Ej: Cambio de fecha del Certamen 2'
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
                ariaLabel='Contenido del anuncio'
                placeholder='Escribe el comunicado con el detalle que puedas…'
              />
            </Suspense>
          </Campo>

          {flairs.length > 0 && (
            <Campo label='Flair (opcional)'>
              <div className='flex flex-wrap gap-1.5'>
                <button
                  type='button'
                  onClick={() => setFlairId(null)}
                  aria-pressed={flairId === null}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    flairId === null
                      ? 'bg-white/[0.12] text-neutral-100 ring-1 ring-white/30'
                      : 'bg-white/[0.04] text-neutral-500 hover:text-neutral-200'
                  }`}
                >
                  Sin flair
                </button>
                {flairs.map((f) => (
                  <button
                    key={f.id}
                    type='button'
                    onClick={() => setFlairId(f.id)}
                    aria-pressed={flairId === f.id}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity ${clasesFlair(f.color)} ${
                      flairId === f.id
                        ? 'ring-1 ring-current/40'
                        : 'opacity-50 hover:opacity-90'
                    }`}
                  >
                    {f.nombre}
                  </button>
                ))}
              </div>
            </Campo>
          )}

          <HashtagsInput
            value={hashtagsTexto}
            onChange={setHashtagsTexto}
            error={errorHashtags}
          />

          <ArchivosInput
            control={archivos}
            label='Archivos (opcional)'
            ayuda={`JPG, PNG, WEBP, GIF o PDF · hasta ${ADJUNTO_MAX_MB} MB cada uno.`}
            iconoDe={iconoDeAdjunto}
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
        title={editando ? '¿Descartar los cambios?' : '¿Descartar el anuncio?'}
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
