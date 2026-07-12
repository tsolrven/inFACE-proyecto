import { useEffect, useState } from 'react';
import Modal, { ModalHeader } from '../ui/Modal';
import Button from '../ui/Button';
import { listarRamosPorCarrera } from '../../services/repositorioMateriales/ramo.service';
import { crearApunte } from '../../services/repositorioMateriales/apunte.service';
import { subirArchivos } from '../../services/repositorioMateriales/archivo.service';
import { useRepositorioStore } from '../../stores/repositorioStore';
import CodeEditor from './CodeEditor';

const TIPOS = [
  { value: 'file', icon: 'ti-upload', label: 'Archivo' },
  { value: 'github', icon: 'ti-brand-github', label: 'GitHub' },
  { value: 'snippet', icon: 'ti-code', label: 'Snippet de código' },
];

const FUENTES_INICIALES = { file: false, github: false, snippet: false };

export default function UploadModal({ open, onClose, carreraId }) {
  const [fuentes, setFuentes] = useState(FUENTES_INICIALES);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ramoId, setRamoId] = useState('');
  const [ramosOpciones, setRamosOpciones] = useState([]);
  const [hashtagsTexto, setHashtagsTexto] = useState('');
  const [linkRepositorio, setLinkRepositorio] = useState('');
  const [codigoSnippet, setCodigoSnippet] = useState('');
  const [lenguajeSnippet, setLenguajeSnippet] = useState('texto');
  const [archivos, setArchivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const fetchApuntes = useRepositorioStore((s) => s.fetchApuntes);

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

  function resetForm() {
    setFuentes(FUENTES_INICIALES);
    setTitulo('');
    setDescripcion('');
    setRamoId('');
    setHashtagsTexto('');
    setLinkRepositorio('');
    setCodigoSnippet('');
    setLenguajeSnippet('texto');
    setArchivos([]);
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

    if (!titulo.trim() || !ramoId) {
      setError('Título y ramo son obligatorios.');
      return;
    }
    if (!fuentes.file && !fuentes.github && !fuentes.snippet) {
      setError(
        'Selecciona al menos un tipo de contenido: archivo, link o snippet.',
      );
      return;
    }
    if (fuentes.file && archivos.length === 0) {
      setError('Selecciona al menos un archivo.');
      return;
    }
    if (fuentes.github && !linkRepositorio.trim()) {
      setError('Ingresa el link del repositorio.');
      return;
    }
    if (fuentes.snippet && !codigoSnippet.trim()) {
      setError('Pega el código del snippet.');
      return;
    }

    setEnviando(true);
    try {
      const hashtags = hashtagsTexto
        .split(/[\s,]+/)
        .map((t) => t.replace('#', '').trim())
        .filter(Boolean);

      const apunte = await crearApunte({
        titulo,
        descripcion,
        ramo_id: ramoId,
        hashtags,
        link_repositorio: fuentes.github ? linkRepositorio : undefined,
        codigo_snippet: fuentes.snippet ? codigoSnippet : undefined,
        lenguaje_snippet: fuentes.snippet ? lenguajeSnippet : undefined,
      });

      if (fuentes.file && archivos.length > 0) {
        const { fallidos } = await subirArchivos(apunte.id, archivos);
        if (fallidos.length > 0) {
          setError(
            `El material se creó, pero ${fallidos.length} archivo(s) no se pudieron subir. Puedes agregarlos después.`,
          );
        }
      }

      await fetchApuntes();
      if (!error) {
        resetForm();
        onClose();
      }
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
          Puedes combinar más de uno (ej: archivo + link de GitHub).
        </p>

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

        {fuentes.file && (
          <Campo label='Archivos (puedes seleccionar varios)'>
            <input
              type='file'
              multiple
              onChange={(e) => setArchivos(Array.from(e.target.files))}
              className='text-[12.5px] text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-pink-500/10 file:px-3 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-pink-500'
            />
            {archivos.length > 0 && (
              <p className='mt-1 text-[11px] text-neutral-500'>
                {archivos.length} archivo(s) seleccionado(s)
              </p>
            )}
          </Campo>
        )}

        {fuentes.github && (
          <Campo label='Link del repositorio'>
            <input
              value={linkRepositorio}
              onChange={(e) => setLinkRepositorio(e.target.value)}
              placeholder='https://github.com/usuario/repo'
              className={inputClasses}
            />
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
