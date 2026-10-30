import { useEffect, useState } from 'react';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import Campo from '@/shared/components/form/Campo';
import { inputClasses } from '@/shared/components/form/inputClasses';
import HashtagsInput from '@/shared/components/form/HashtagsInput';
import ArchivosInput from '@/shared/components/form/ArchivosInput';
import { useArchivosForm } from '@/shared/hooks/useArchivosForm';
import { listarRamosPorCarrera } from '@/shared/api/catalog.api';
import { iconoDeAdjunto } from '@/features/materials/utils/fileMeta';
import { useEditarApunte } from '@/features/materials/hooks/useApuntes';
import CodeEditor from '@/features/materials/components/CodeEditor';
import InfoTooltip from '@/shared/components/ui/InfoTooltip';
import CharCounter from '@/shared/components/ui/CharCounter';
import { normalizarHashtags, validarHashtags } from '@/shared/lib/hashtags';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  TITULO_MIN,
  TITULO_MAX,
  DESCRIPCION_MAX,
  SNIPPET_MAX,
  LINKS_MAX,
  LINK_MAX,
  MAX_ARCHIVOS,
  MAX_TAMANIO_MB,
  MAX_TAMANIO_BYTES,
  ADJUNTOS_EXTENSIONES,
} from '@/features/materials/utils/limites';
import { normalizarLinks } from '@/features/materials/utils/normalizarLinks';

const TIPOS = [
  { value: 'file', icon: 'ti-upload', label: 'Archivo' },
  { value: 'link', icon: 'ti-link', label: 'Link' },
  { value: 'snippet', icon: 'ti-code', label: 'Snippet de código' },
];

// Envoltorio: el formulario solo existe mientras el modal está abierto.
// Así sus useState toman los datos del apunte al abrirse, y los cambios
// posteriores del caché (votos, guardados, el propio guardado) no pisan lo escrito.
export default function EditApunteModal({ open, apunte, ...props }) {
  if (!open || !apunte) return null;
  return (
    <EditApunteForm
      apunte={apunte}
      {...props}
    />
  );
}

function EditApunteForm({ onClose, apunte, carreraId }) {
  // Foto de lo que se está editando: con ella se calcula qué cambió. Se toma
  // una sola vez para que el caché no mueva la comparación mientras se escribe.
  const [original] = useState(() => ({
    titulo: apunte.titulo ?? '',
    descripcion: apunte.descripcion ?? '',
    ramoId: apunte.ramo?.id ?? '',
    hashtags: apunte.hashtags ?? [],
    links: apunte.links ?? [],
    codigoSnippet: apunte.codigo_snippet ?? '',
    lenguajeSnippet: apunte.lenguaje_snippet ?? 'texto',
    archivos: apunte.archivos ?? [],
  }));

  const [fuentes, setFuentes] = useState(() => ({
    file: original.archivos.length > 0,
    link: original.links.length > 0,
    snippet: original.codigoSnippet !== '',
  }));
  const [titulo, setTitulo] = useState(original.titulo);
  const [descripcion, setDescripcion] = useState(original.descripcion);
  const [ramoId, setRamoId] = useState(original.ramoId);
  const [ramosOpciones, setRamosOpciones] = useState([]);
  const [hashtagsTexto, setHashtagsTexto] = useState(
    original.hashtags.map((t) => `#${t}`).join(' '),
  );
  const [links, setLinks] = useState(
    original.links.length ? original.links : [''],
  );
  const [codigoSnippet, setCodigoSnippet] = useState(original.codigoSnippet);
  const [lenguajeSnippet, setLenguajeSnippet] = useState(
    original.lenguajeSnippet,
  );
  const [error, setError] = useState(null);
  const [confirmandoSalir, setConfirmandoSalir] = useState(false);

  const adjuntos = useArchivosForm({
    existentes: original.archivos,
    max: MAX_ARCHIVOS,
    maxBytes: MAX_TAMANIO_BYTES,
    extensiones: ADJUNTOS_EXTENSIONES,
    singular: 'archivo',
    plural: 'archivos',
  });

  const editar = useEditarApunte();
  const enviando = editar.isPending;

  useEffect(() => {
    if (!carreraId) return;
    listarRamosPorCarrera(carreraId).then((porSemestre) => {
      const flatten = Object.values(porSemestre).flat();
      setRamosOpciones(flatten);
    });
  }, [carreraId]);

  // ── Qué cambió ────────────────────────────────────────────────────────────
  const hashtags = normalizarHashtags(hashtagsTexto);
  const errorHashtags = validarHashtags(hashtags);
  const hashtagsCambiaron =
    hashtags.length !== original.hashtags.length ||
    hashtags.some((t) => !original.hashtags.includes(t));

  const linksFinales = fuentes.link ? normalizarLinks(links) : [];
  const linksCambiaron =
    linksFinales.length !== original.links.length ||
    linksFinales.some((l, i) => l !== original.links[i]);

  const snippetCambio = fuentes.snippet
    ? codigoSnippet !== original.codigoSnippet ||
      lenguajeSnippet !== original.lenguajeSnippet
    : original.codigoSnippet !== '';

  // Solo viaja lo que cambió (el backend marca "editado" en cada PATCH).
  const payload = {};
  if (titulo.trim() !== original.titulo) payload.titulo = titulo.trim();
  if (descripcion.trim() !== original.descripcion.trim()) {
    payload.descripcion = descripcion;
  }
  if (ramoId !== original.ramoId) payload.ramo_id = ramoId;
  if (hashtagsCambiaron) payload.hashtags = hashtags;
  if (linksCambiaron) payload.links = linksFinales;
  if (snippetCambio) {
    // el backend solo lee el lenguaje junto con el código: viajan siempre juntos
    payload.codigo_snippet = fuentes.snippet ? codigoSnippet : null;
    payload.lenguaje_snippet = fuentes.snippet ? lenguajeSnippet : null;
  }
  const hayTexto = Object.keys(payload).length > 0;

  // Archivos: con el toggle apagado se quitan TODOS los existentes al guardar y
  // los nuevos no se suben. Las marcas del usuario se conservan si lo vuelve a
  // encender antes de guardar.
  const quitar = fuentes.file
    ? adjuntos.quitarIds
    : original.archivos.map((a) => a.id);
  const nuevos = fuentes.file ? adjuntos.nuevos : [];
  const archivosCambiaron = quitar.length > 0 || nuevos.length > 0;

  const hayCambios = hayTexto || archivosCambiaron;
  const perderiaArchivos = !fuentes.file && original.archivos.length > 0;

  // ── Acciones ──────────────────────────────────────────────────────────────
  function intentarCerrar() {
    if (enviando) return;
    if (hayCambios) setConfirmandoSalir(true);
    else onClose();
  }

  function toggleFuente(value) {
    setFuentes((prev) => ({ ...prev, [value]: !prev[value] }));
  }

  function actualizarLink(index, valor) {
    setLinks((prev) => prev.map((l, i) => (i === index ? valor : l)));
  }

  function agregarLink() {
    setLinks((prev) => (prev.length >= LINKS_MAX ? prev : [...prev, '']));
  }

  function quitarLink(index) {
    setLinks((prev) =>
      prev.length === 1 ? [''] : prev.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!ramoId) {
      setError('Debes seleccionar un ramo.');
      return;
    }
    if (titulo.trim().length < TITULO_MIN) {
      setError(`El título debe tener al menos ${TITULO_MIN} caracteres.`);
      return;
    }
    if (errorHashtags) {
      setError(errorHashtags);
      return;
    }
    if (!fuentes.file && !fuentes.link && !fuentes.snippet) {
      setError(
        'Selecciona al menos un tipo de contenido: archivo, link o snippet.',
      );
      return;
    }
    if (fuentes.link && links.every((l) => !l.trim())) {
      setError('Ingresa al menos un link.');
      return;
    }
    if (fuentes.snippet && !codigoSnippet.trim()) {
      setError('Pega el código del snippet.');
      return;
    }
    if (fuentes.snippet && codigoSnippet.length > SNIPPET_MAX) {
      setError(`El snippet no puede superar ${SNIPPET_MAX} caracteres.`);
      return;
    }
    // Lo que QUEDA (existentes sin marcar + nuevos) no puede ser cero.
    // Cupo, tamaño y extensión ya se validan al elegir cada archivo.
    if (fuentes.file && adjuntos.total === 0) {
      setError('Agrega al menos un archivo o desactiva la opción de archivo.');
      return;
    }

    if (!hayCambios) {
      onClose(); // nada que guardar
      return;
    }

    // Si el cupo alcanza contando los que hay hoy, primero se sube y después se
    // quita: si una subida falla, no se borró ya lo que había.
    const subirPrimero =
      original.archivos.length + nuevos.length <= MAX_ARCHIVOS;

    try {
      const { fallos } = await editar.mutateAsync({
        id: apunte.id,
        payload: hayTexto ? payload : null,
        quitar,
        nuevos,
        subirPrimero,
      });

      if (fallos.quitar > 0 || fallos.subir > 0) {
        const partes = [];
        if (fallos.quitar > 0) partes.push(`${fallos.quitar} sin quitar`);
        if (fallos.subir > 0) partes.push(`${fallos.subir} sin subir`);
        mostrarToast(
          `Se guardaron los cambios, pero algunos archivos fallaron (${partes.join(', ')}). Revisa el material.`,
        );
      }
      onClose();
    } catch (err) {
      setError(mensajeDeError(err, 'Ocurrió un error al guardar los cambios.'));
    }
  }

  return (
    <>
      <Modal
        open
        onClose={intentarCerrar}
        maxWidth='560px'
      >
        <ModalHeader onClose={intentarCerrar}>
          <span className='text-[15px] font-semibold text-neutral-100'>
            Editar material
          </span>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-3.5 p-5'
        >
          {/* selector de tipo de contenido (múltiple: se puede combinar más de uno) */}
          <div className='flex gap-2'>
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type='button'
                aria-pressed={fuentes[t.value]}
                onClick={() => toggleFuente(t.value)}
                disabled={enviando}
                className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border py-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-50 ${
                  fuentes[t.value]
                    ? 'border-pink-500/40 bg-pink-500/10 text-pink-500'
                    : 'border-white/[0.07] text-neutral-500 hover:border-white/[0.18] hover:text-neutral-200'
                }`}
              >
                <i className={`ti ${t.icon} text-lg`} />
                {t.label}
              </button>
            ))}
          </div>
          <p className='-mt-2 text-[11px] text-neutral-600'>
            Puedes combinar más de uno (ej: archivo + link).
          </p>

          {perderiaArchivos && (
            <p className='rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-400'>
              <i className='ti ti-alert-triangle mr-1 text-[13px]' />
              Al guardar se eliminarán los {original.archivos.length} archivo(s)
              adjuntos de este material.
            </p>
          )}

          <Campo label='Ramo'>
            <select
              value={ramoId}
              onChange={(e) => setRamoId(e.target.value)}
              className={inputClasses}
            >
              <option value=''>Selecciona un ramo...</option>
              {ramosOpciones.map((ramo) => (
                <option
                  key={ramo.id}
                  value={ramo.id}
                >
                  {ramo.nombre}
                </option>
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
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder='Ej: Resumen completo Certamen 1...'
              maxLength={TITULO_MAX}
              className={inputClasses}
            />
          </Campo>

          <Campo
            label='Descripción (opcional)'
            extra={
              <CharCounter
                value={descripcion}
                max={DESCRIPCION_MAX}
              />
            }
          >
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder='Cuenta de qué se trata este material...'
              maxLength={DESCRIPCION_MAX}
              className={`${inputClasses} resize-none`}
            />
          </Campo>

          <HashtagsInput
            value={hashtagsTexto}
            onChange={setHashtagsTexto}
            error={errorHashtags}
            placeholder='#certamen1 #derivadas #integrales'
          />

          {fuentes.file && (
            <ArchivosInput
              control={adjuntos}
              label={
                <span className='flex items-center gap-1.5'>
                  Archivos adjuntos
                  <InfoTooltip texto='¿No ves tu tipo de archivo? Comprímelo en .zip y súbelo.' />
                </span>
              }
              ayuda={`PDF, Word, PowerPoint, Excel, TXT, ZIP o imágenes · hasta ${MAX_TAMANIO_MB} MB cada uno. Los cambios se aplican al guardar.`}
              iconoDe={iconoDeAdjunto}
            />
          )}

          {fuentes.link && (
            <Campo label='Links'>
              <div className='flex flex-col gap-1.5'>
                {links.map((link, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-1.5'
                  >
                    <input
                      value={link}
                      onChange={(e) => actualizarLink(i, e.target.value)}
                      placeholder='https://...'
                      maxLength={LINK_MAX}
                      className={inputClasses}
                    />
                    {links.length > 1 && (
                      <button
                        type='button'
                        onClick={() => quitarLink(i)}
                        className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-200'
                      >
                        <i className='ti ti-x text-sm' />
                      </button>
                    )}
                  </div>
                ))}
                {links.length < LINKS_MAX && (
                  <button
                    type='button'
                    onClick={agregarLink}
                    className='self-start text-[11.5px] font-semibold text-pink-500 hover:opacity-75'
                  >
                    <i className='ti ti-plus text-[12px]' /> Agregar otro link
                  </button>
                )}
              </div>
            </Campo>
          )}

          {fuentes.snippet && (
            <Campo
              label='Código'
              extra={
                <CharCounter
                  value={codigoSnippet}
                  max={SNIPPET_MAX}
                />
              }
            >
              <CodeEditor
                value={codigoSnippet}
                onChange={setCodigoSnippet}
                lenguaje={lenguajeSnippet}
                onLenguajeChange={setLenguajeSnippet}
              />
            </Campo>
          )}

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
              Guardar cambios
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmandoSalir}
        title='¿Descartar los cambios?'
        message='Tienes cambios sin guardar. Si sales ahora, se perderán.'
        confirmLabel='Descartar'
        cancelLabel='Seguir editando'
        danger
        onConfirm={onClose}
        onCancel={() => setConfirmandoSalir(false)}
      />
    </>
  );
}
