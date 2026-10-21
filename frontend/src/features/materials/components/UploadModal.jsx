import { useEffect, useState } from 'react';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import { listarRamosPorCarrera } from '@/shared/api/catalog.api';
import { crearApunte } from '@/features/materials/api/materials.api';
import { useQueryClient } from '@tanstack/react-query';
import CodeEditor from '@/features/materials/components/CodeEditor';
import BadgeSelector, {
  InfoTooltip,
} from '@/features/materials/components/BadgeSelector';
import { normalizarHashtags } from '@/features/materials/utils/normalizarHashtags';
import CharCounter from '@/shared/components/ui/CharCounter';
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
} from '@/features/materials/utils/limites';
import {
  agregarArchivosSinDuplicar,
  claveArchivo,
} from '@/features/materials/utils/archivos';
import { normalizarLinks } from '@/features/materials/utils/normalizarLinks';

const TIPOS = [
  { value: 'file', icon: 'ti-upload', label: 'Archivo' },
  { value: 'link', icon: 'ti-link', label: 'Link' },
  { value: 'snippet', icon: 'ti-code', label: 'Snippet de código' },
];

const FUENTES_INICIALES = { file: false, link: false, snippet: false };

export default function UploadModal({ open, onClose, carreraId }) {
  const [fuentes, setFuentes] = useState(FUENTES_INICIALES);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ramoId, setRamoId] = useState('');
  const [ramosOpciones, setRamosOpciones] = useState([]);
  const [hashtagsTexto, setHashtagsTexto] = useState('');
  const [links, setLinks] = useState(['']);
  const [codigoSnippet, setCodigoSnippet] = useState('');
  const [lenguajeSnippet, setLenguajeSnippet] = useState('texto');
  const [archivos, setArchivos] = useState([]);
  const [etiquetasVisuales, setEtiquetasVisuales] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const qc = useQueryClient();

  useEffect(() => {
    if (!open || !carreraId) return;
    listarRamosPorCarrera(carreraId).then((porSemestre) => {
      const flatten = Object.values(porSemestre).flat();
      setRamosOpciones(flatten);
    });
  }, [open, carreraId]);

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

  function handleSeleccionarArchivos(e) {
    const nuevos = Array.from(e.target.files); // primero capturar, después vaciar
    setArchivos((prev) => agregarArchivosSinDuplicar(prev, nuevos));
    e.target.value = ''; // permite volver a elegir el mismo archivo
  }

  function quitarArchivo(index) {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setFuentes(FUENTES_INICIALES);
    setTitulo('');
    setDescripcion('');
    setRamoId('');
    setHashtagsTexto('');
    setLinks(['']);
    setCodigoSnippet('');
    setLenguajeSnippet('texto');
    setArchivos([]);
    setEtiquetasVisuales([]);
    setError(null);
  }

  function handleClose() {
    if (enviando) return;
    resetForm();
    onClose();
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
    if (!fuentes.file && !fuentes.link && !fuentes.snippet) {
      setError(
        'Selecciona al menos un tipo de contenido: archivo, link o snippet.',
      );
      return;
    }
    if (fuentes.file && archivos.length > MAX_ARCHIVOS) {
      setError(`No puedes subir más de ${MAX_ARCHIVOS} archivos.`);
      return;
    }
    const archivoDemasiadoGrande = archivos.find(
      (f) => f.size > MAX_TAMANIO_BYTES,
    );
    if (fuentes.file && archivoDemasiadoGrande) {
      setError(
        `"${archivoDemasiadoGrande.name}" supera el límite de ${MAX_TAMANIO_MB}MB por archivo.`,
      );
      return;
    }
    if (fuentes.file && archivos.length === 0) {
      setError('Selecciona al menos un archivo.');
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

    setEnviando(true);
    try {
      await crearApunte(
        {
          titulo,
          descripcion,
          ramo_id: ramoId,
          hashtags: normalizarHashtags(hashtagsTexto),
          links: fuentes.link ? normalizarLinks(links) : undefined,
          codigo_snippet: fuentes.snippet ? codigoSnippet : undefined,
          lenguaje_snippet: fuentes.snippet ? lenguajeSnippet : undefined,
          etiquetas_visuales: etiquetasVisuales,
        },
        fuentes.file ? archivos : [],
      );

      await qc.invalidateQueries({ queryKey: ['apunte', 'list'] });
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al publicar el material.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      maxWidth='560px'
    >
      <ModalHeader onClose={handleClose}>
        <span className='text-[15px] font-semibold text-neutral-100'>
          Subir material
        </span>
      </ModalHeader>

      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-3.5 p-5'
      >
        {/* selector de tipo (múltiple: se puede combinar más de uno) */}
        <div className='flex gap-2'>
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type='button'
              aria-pressed={fuentes[t.value]}
              onClick={() => toggleFuente(t.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border py-2.5 text-[11.5px] font-medium transition-colors ${
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

        <Campo label='Tags (separados por espacio o coma)'>
          <input
            value={hashtagsTexto}
            onChange={(e) => setHashtagsTexto(e.target.value)}
            placeholder='#certamen1 #derivadas #integrales'
            className={inputClasses}
          />
        </Campo>

        <BadgeSelector
          value={etiquetasVisuales}
          onChange={setEtiquetasVisuales}
          disabled={enviando}
        />

        {fuentes.file && (
          <Campo
            label={
              <span className='flex items-center gap-1.5'>
                Archivos (puedes seleccionar varios)
                <InfoTooltip texto='¿No ves tu tipo de archivo? Comprímelo en .zip y súbelo.' />
              </span>
            }
          >
            <input
              type='file'
              multiple
              onChange={handleSeleccionarArchivos}
              className='text-[12.5px] text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-pink-500/10 file:px-3 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-pink-500'
            />
            <p className='mt-1 text-[11px] text-neutral-600'>
              Mantén Ctrl (Windows/Linux) o Cmd (Mac) presionado para
              seleccionar varios archivos a la vez.
            </p>
            {archivos.length > 0 && (
              <div className='mt-2 flex flex-col gap-1.5'>
                <p className='text-[11px] text-neutral-500'>
                  {archivos.length}/{MAX_ARCHIVOS} archivo(s) seleccionado(s)
                </p>
                {archivos.map((archivo, i) => (
                  <div
                    key={claveArchivo(archivo)}
                    className='flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5'
                  >
                    <i className='ti ti-file text-[13px] text-neutral-500' />
                    <span className='flex-1 truncate text-[11.5px] text-neutral-300'>
                      {archivo.name}
                    </span>
                    <button
                      type='button'
                      onClick={() => quitarArchivo(i)}
                      className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-red-400'
                      title='Quitar archivo'
                    >
                      <i className='ti ti-x text-[13px]' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Campo>
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
            onClick={handleClose}
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
  );
}

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
