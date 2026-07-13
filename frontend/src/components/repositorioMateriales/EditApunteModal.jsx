import { useEffect, useState } from 'react';
import Modal, { ModalHeader } from '../ui/Modal';
import Button from '../ui/Button';
import { listarRamosPorCarrera } from '../../services/repositorioMateriales/ramo.service';
import {
  subirArchivos,
  eliminarArchivo,
} from '../../services/repositorioMateriales/archivo.service';
import { metaDeArchivo, formatearTamanio } from '../../utils/fileMeta';
import { useRepositorioStore } from '../../stores/repositorioStore';
import CodeEditor from './CodeEditor';
import BadgeSelector, { InfoTooltip } from './BadgeSelector';

const TIPOS = [
  { value: 'file', icon: 'ti-upload', label: 'Archivo' },
  { value: 'link', icon: 'ti-link', label: 'Link' },
  { value: 'snippet', icon: 'ti-code', label: 'Snippet de código' },
];

const MAX_ARCHIVOS = 10; //debe coincidir con MAX_ARCHIVOS_POR_APUNTE en el backend
const MAX_TAMANIO_MB = 20; //debe coincidir con el límite de multer.helper.js
const MAX_TAMANIO_BYTES = MAX_TAMANIO_MB * 1024 * 1024;

export default function EditApunteModal({
  open,
  onClose,
  apunte,
  carreraId,
  onSaved,
}) {
  const fuentesIniciales = (a) => ({
    file: (a?.archivos?.length ?? 0) > 0,
    link: (a?.links?.length ?? 0) > 0,
    snippet: !!a?.codigo_snippet,
  });

  const [fuentes, setFuentes] = useState({
    file: false,
    link: false,
    snippet: false,
  });
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ramoId, setRamoId] = useState('');
  const [ramosOpciones, setRamosOpciones] = useState([]);
  const [hashtagsTexto, setHashtagsTexto] = useState('');
  const [links, setLinks] = useState(['']);
  const [codigoSnippet, setCodigoSnippet] = useState('');
  const [lenguajeSnippet, setLenguajeSnippet] = useState('texto');
  const [etiquetasVisuales, setEtiquetasVisuales] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const [archivosActuales, setArchivosActuales] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState([]);
  const [eliminandoId, setEliminandoId] = useState(null);

  const editarApunte = useRepositorioStore((s) => s.editarApunte);
  const actualizarApunteEnFeed = useRepositorioStore(
    (s) => s.actualizarApunteEnFeed,
  );

  useEffect(() => {
    if (!open || !apunte) return;
    setFuentes(fuentesIniciales(apunte));
    setTitulo(apunte.titulo ?? '');
    setDescripcion(apunte.descripcion ?? '');
    setRamoId(apunte.ramo?.id ?? '');
    setHashtagsTexto((apunte.hashtags ?? []).join(' '));
    setLinks(apunte.links?.length ? apunte.links : ['']);
    setCodigoSnippet(apunte.codigo_snippet ?? '');
    setLenguajeSnippet(apunte.lenguaje_snippet ?? 'texto');
    setEtiquetasVisuales(apunte.etiquetas_visuales ?? []);
    setArchivosActuales(apunte.archivos ?? []);
    setArchivosNuevos([]);
    setError(null);
  }, [open, apunte]);

  useEffect(() => {
    if (!open || !carreraId) return;
    listarRamosPorCarrera(carreraId).then((porSemestre) => {
      const flatten = Object.values(porSemestre).flat();
      setRamosOpciones(flatten);
    });
  }, [open, carreraId]);

  function handleClose() {
    if (enviando) return;
    setError(null);
    onClose();
  }

  function toggleFuente(value) {
    setFuentes((prev) => ({ ...prev, [value]: !prev[value] }));
  }

  function actualizarLink(index, valor) {
    setLinks((prev) => prev.map((l, i) => (i === index ? valor : l)));
  }

  function agregarLink() {
    setLinks((prev) => (prev.length >= 5 ? prev : [...prev, '']));
  }

  function quitarLink(index) {
    setLinks((prev) =>
      prev.length === 1 ? [''] : prev.filter((_, i) => i !== index),
    );
  }

  async function handleEliminarArchivoExistente(archivoId) {
    setEliminandoId(archivoId);
    setError(null);
    try {
      await eliminarArchivo(archivoId);
      setArchivosActuales((prev) => prev.filter((a) => a.id !== archivoId));
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el archivo.');
    } finally {
      setEliminandoId(null);
    }
  }

  function handleAgregarArchivos(e) {
    setArchivosNuevos((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
  }

  function handleQuitarArchivoNuevo(index) {
    setArchivosNuevos((prev) => prev.filter((_, i) => i !== index));
  }

  const perderiaArchivos =
    !fuentes.file && (archivosActuales.length > 0 || archivosNuevos.length > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !ramoId) {
      setError('Título y ramo son obligatorios.');
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
    if (
      fuentes.file &&
      archivosActuales.length === 0 &&
      archivosNuevos.length === 0
    ) {
      setError('Agrega al menos un archivo o desactiva la opción de archivo.');
      return;
    }
    if (
      fuentes.file &&
      archivosActuales.length + archivosNuevos.length > MAX_ARCHIVOS
    ) {
      setError(`No puedes tener más de ${MAX_ARCHIVOS} archivos en total.`);
      return;
    }
    const archivoDemasiadoGrande = archivosNuevos.find(
      (f) => f.size > MAX_TAMANIO_BYTES,
    );
    if (fuentes.file && archivoDemasiadoGrande) {
      setError(
        `"${archivoDemasiadoGrande.name}" supera el límite de ${MAX_TAMANIO_MB}MB por archivo.`,
      );
      return;
    }
    setEnviando(true);
    try {
      const hashtags = hashtagsTexto
        .split(/[\s,]+/)
        .map((t) => t.replace('#', '').trim())
        .filter(Boolean);

      const actualizado = await editarApunte(apunte.id, {
        titulo,
        descripcion,
        ramo_id: ramoId,
        hashtags,
        links: fuentes.link ? links.map((l) => l.trim()).filter(Boolean) : [],
        codigo_snippet: fuentes.snippet ? codigoSnippet : null,
        lenguaje_snippet: fuentes.snippet ? lenguajeSnippet : null,
        etiquetas_visuales: etiquetasVisuales,
      });

      let archivosFinales = archivosActuales;
      let huboFallidos = false;

      if (!fuentes.file) {
        if (archivosActuales.length > 0) {
          await Promise.all(archivosActuales.map((a) => eliminarArchivo(a.id)));
        }
        archivosFinales = [];
        setArchivosActuales([]);
        setArchivosNuevos([]);
      } else if (archivosNuevos.length > 0) {
        const { exitosos, fallidos } = await subirArchivos(
          apunte.id,
          archivosNuevos,
        );
        archivosFinales = [...archivosActuales, ...exitosos];
        setArchivosActuales(archivosFinales);
        setArchivosNuevos(fallidos.map((f) => f.file));
        if (fallidos.length > 0) {
          huboFallidos = true;
          setError(
            `Se guardaron los cambios, pero ${fallidos.length} archivo(s) nuevo(s) no se pudieron subir. Puedes reintentar.`,
          );
        }
      }

      const descargas = archivosFinales.reduce(
        (acc, a) => acc + (a.contador_descargas ?? 0),
        0,
      );

      actualizarApunteEnFeed(apunte.id, {
        archivos: archivosFinales,
        descargas,
      });
      onSaved?.({ ...actualizado, archivos: archivosFinales, descargas });

      if (!huboFallidos) onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar los cambios.');
    } finally {
      setEnviando(false);
    }
  }

  if (!apunte) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      maxWidth='560px'
    >
      <ModalHeader onClose={handleClose}>
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
            Al desactivar la opción de archivo se eliminarán los{' '}
            {archivosActuales.length + archivosNuevos.length} archivo(s)
            adjuntos de este apunte.
          </p>
        )}

        <Campo label='Título'>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder='Ej: Resumen completo Certamen 1...'
            className={inputClasses}
          />
        </Campo>

        <Campo label='Descripción (opcional)'>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder='Cuenta de qué se trata este material...'
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
              {links.length < 5 && (
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
          <Campo label='Código'>
            <CodeEditor
              value={codigoSnippet}
              onChange={setCodigoSnippet}
              lenguaje={lenguajeSnippet}
              onLenguajeChange={setLenguajeSnippet}
            />
          </Campo>
        )}

        {fuentes.file && (
          <Campo
            label={
              <span className='flex items-center gap-1.5'>
                Archivos adjuntos
                <InfoTooltip texto='¿No ves tu tipo de archivo? Comprímelo en .zip y súbelo.' />
              </span>
            }
          >
            <div className='flex flex-col gap-1.5'>
              {archivosActuales.length === 0 && archivosNuevos.length === 0 && (
                <p className='text-[11.5px] text-neutral-600'>
                  Sin archivos todavía.
                </p>
              )}

              {archivosActuales.map((archivo) => {
                const meta = metaDeArchivo(archivo);
                const borrando = eliminandoId === archivo.id;
                return (
                  <div
                    key={archivo.id}
                    className='flex items-center gap-2.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-2'
                  >
                    <i
                      className={`ti ${meta.icon} flex-shrink-0 text-sm`}
                      style={{ color: meta.color }}
                    />
                    <span className='flex-1 truncate text-[12px] font-medium text-neutral-300'>
                      {archivo.nombre_archivo}
                    </span>
                    <span className='flex-shrink-0 text-[10.5px] text-neutral-600'>
                      {formatearTamanio(archivo.tamanio)}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleEliminarArchivoExistente(archivo.id)}
                      disabled={borrando || enviando}
                      className='flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-red-400 hover:opacity-75 disabled:opacity-50'
                    >
                      <i
                        className={`ti ${borrando ? 'ti-loader-2 animate-spin' : 'ti-trash'} text-[13px]`}
                      />
                      {borrando ? 'Eliminando...' : 'Quitar'}
                    </button>
                  </div>
                );
              })}

              {archivosNuevos.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className='flex items-center gap-2.5 rounded-md border border-pink-500/20 bg-pink-500/[0.04] px-2.5 py-2'
                >
                  <i className='ti ti-file-upload flex-shrink-0 text-sm text-pink-500' />
                  <span className='flex-1 truncate text-[12px] font-medium text-neutral-300'>
                    {file.name}
                  </span>
                  <span className='flex-shrink-0 text-[10.5px] text-pink-500'>
                    Pendiente
                  </span>
                  <button
                    type='button'
                    onClick={() => handleQuitarArchivoNuevo(i)}
                    disabled={enviando}
                    className='flex flex-shrink-0 items-center text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 disabled:opacity-50'
                  >
                    <i className='ti ti-x text-[13px]' />
                  </button>
                </div>
              ))}

              <input
                type='file'
                multiple
                onChange={handleAgregarArchivos}
                disabled={enviando}
                className='mt-1 text-[12.5px] text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-pink-500/10 file:px-3 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-pink-500'
              />
              <p className='text-[11px] text-neutral-600'>
                Mantén Ctrl (Windows/Linux) o Cmd (Mac) presionado para
                seleccionar varios archivos a la vez.
              </p>
            </div>
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
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const inputClasses =
  'w-full rounded-[10px] border border-white/[0.07] bg-[#111114] px-3 py-2 text-[13px] text-neutral-100 outline-none transition-colors placeholder-neutral-600 focus:border-pink-500/40';

function Campo({ label, children }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-[11.5px] font-semibold text-neutral-500'>
        {label}
      </span>
      {children}
    </div>
  );
}
