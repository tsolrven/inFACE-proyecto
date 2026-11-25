import { useEffect, useRef, useState } from 'react';
import GaleriaImagenes from '@/shared/post/images/GaleriaImagenes';
import { mostrarToast } from '@/shared/stores/toastStore';
import { useComentariosConfig } from '@/shared/post/comments/comentariosConfig';
import {
  COMENTARIO_MAX,
  IMAGEN_COMENTARIO,
} from '@/shared/post/comments/constants';

const MB_MAX = IMAGEN_COMENTARIO.maxBytes / (1024 * 1024);
const ACEPTA = IMAGEN_COMENTARIO.extensiones.join(',');

function extension(nombre) {
  const i = nombre.lastIndexOf('.');
  return i === -1 ? '' : nombre.slice(i).toLowerCase();
}

// primera imagen de una lista de archivos (portapapeles o arrastre)
function primeraImagen(files) {
  return [...(files ?? [])].find((f) => f.type.startsWith('image/')) ?? null;
}

// solo los arrastres de archivos (no de texto seleccionado)
const traeArchivos = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');

/**
 * Crear: texto y, opcionalmente, una imagen (botón, Ctrl+V o arrastrar).
 * Editar (`edicion`): texto, y la imagen existente (`imagenInicial`) solo se
 * puede quitar, no reemplazar.
 * onSubmit(texto, { imagen: File | null, quitarImagen: boolean })
 */
export default function CommentComposer({
  initialValue = '',
  imagenInicial = null,
  edicion = false,
  placeholder = 'Escribe un comentario...',
  submitLabel = 'Comentar',
  pending = false,
  autoFocus = false,
  rows = 3,
  onSubmit,
  onCancel,
}) {
  const { admiteImagen } = useComentariosConfig();
  const puedeAdjuntar = admiteImagen && !edicion;

  const [texto, setTexto] = useState(initialValue);
  const [imagen, setImagen] = useState(null); // { file, url } nueva, sin enviar
  const [quitarInicial, setQuitarInicial] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const textareaRef = useRef(null);
  const inputRef = useRef(null);
  const urlRef = useRef(null); // URL de la vista previa, para liberarla

  useEffect(() => {
    if (!autoFocus || !textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [autoFocus]);

  // libera la vista previa si el compositor se cierra con una imagen puesta
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  function ponerImagen(file) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file ? URL.createObjectURL(file) : null;
    setImagen(file ? { file, url: urlRef.current } : null);
  }

  // misma regla que el backend: se avisa antes de enviar
  function elegirImagen(file) {
    if (!file || !puedeAdjuntar) return;
    if (!IMAGEN_COMENTARIO.extensiones.includes(extension(file.name))) {
      mostrarToast(
        `Formato no permitido. Usa ${IMAGEN_COMENTARIO.extensiones.join(', ')}`,
      );
      return;
    }
    if (file.size > IMAGEN_COMENTARIO.maxBytes) {
      mostrarToast(`La imagen supera el máximo de ${MB_MAX} MB`);
      return;
    }
    ponerImagen(file);
  }

  const tieneImagen = Boolean(imagen) || Boolean(imagenInicial && !quitarInicial);
  const vacio = texto.trim().length === 0 && !tieneImagen;
  const cercaDelLimite = texto.length >= COMENTARIO_MAX * 0.9;

  async function enviar() {
    if (vacio || pending) return;
    try {
      await onSubmit(texto.trim(), {
        imagen: imagen?.file ?? null,
        quitarImagen: quitarInicial,
      });
      setTexto('');
      ponerImagen(null);
    } catch {
      // el toast de error ya lo muestra el hook; texto e imagen se conservan
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      enviar();
    }
  }

  // Ctrl+V con una imagen en el portapapeles (p. ej. una captura); si es
  // texto, se pega normal
  function handlePaste(e) {
    if (!puedeAdjuntar) return;
    const file = primeraImagen(e.clipboardData?.files);
    if (!file) return;
    e.preventDefault();
    elegirImagen(file);
  }

  function handleDragOver(e) {
    if (!puedeAdjuntar || !traeArchivos(e)) return;
    e.preventDefault(); // sin esto el navegador abriría la imagen
    e.dataTransfer.dropEffect = 'copy';
    if (!arrastrando) setArrastrando(true);
  }

  function handleDragLeave(e) {
    // dragleave también salta al pasar entre hijos: solo cuenta salir del cuadro
    if (!e.currentTarget.contains(e.relatedTarget)) setArrastrando(false);
  }

  function handleDrop(e) {
    if (!puedeAdjuntar || !traeArchivos(e)) return;
    e.preventDefault();
    setArrastrando(false);
    const file = primeraImagen(e.dataTransfer.files);
    if (file) elegirImagen(file);
    else mostrarToast('Solo puedes adjuntar imágenes');
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col gap-2 rounded-[10px] border p-2.5 transition-colors focus-within:border-pink-500/40 ${arrastrando
          ? 'border-pink-500/60 bg-pink-500/[0.04]'
          : 'border-white/[0.06] bg-[#111114]'
        }`}
    >
      <textarea
        ref={textareaRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        maxLength={COMENTARIO_MAX}
        rows={rows}
        placeholder={placeholder}
        aria-label={placeholder}
        className='w-full resize-none bg-transparent text-[13px] text-neutral-100 outline-none placeholder-neutral-600'
      />

      {arrastrando && (
        <p className='text-[11.5px] font-medium text-pink-300'>
          Suelta la imagen para adjuntarla
        </p>
      )}

      {imagen && (
        <div className='relative w-fit'>
          <img
            src={imagen.url}
            alt='Vista previa de la imagen'
            className='max-h-[160px] max-w-[220px] rounded-lg border border-white/[0.07] object-contain'
          />
          <button
            type='button'
            onClick={() => ponerImagen(null)}
            disabled={pending}
            aria-label='Quitar imagen'
            className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[12px] text-neutral-200 transition-colors hover:bg-black/90'
          >
            <i className='ti ti-x' />
          </button>
        </div>
      )}

      {imagenInicial &&
        (quitarInicial ? (
          <p className='flex items-center gap-2 text-[11.5px] text-neutral-500'>
            La imagen se quitará al guardar.
            <button
              type='button'
              onClick={() => setQuitarInicial(false)}
              className='font-medium text-blue-400 hover:underline'
            >
              Deshacer
            </button>
          </p>
        ) : (
          <div className='relative w-[160px]'>
            <GaleriaImagenes archivos={[imagenInicial]} />
            <button
              type='button'
              onClick={() => setQuitarInicial(true)}
              disabled={pending}
              aria-label='Quitar imagen'
              className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[12px] text-neutral-200 transition-colors hover:bg-black/90'
            >
              <i className='ti ti-x' />
            </button>
          </div>
        ))}

      <div className='flex items-center justify-between gap-2'>
        <span className='flex items-center gap-2 text-[11px] text-neutral-600'>
          {puedeAdjuntar && (
            <>
              <button
                type='button'
                onClick={() => inputRef.current?.click()}
                disabled={pending || Boolean(imagen)}
                aria-label='Adjuntar imagen'
                title={`Adjuntar imagen (máx. ${MB_MAX} MB). También puedes pegarla o arrastrarla.`}
                className='flex h-7 w-7 items-center justify-center rounded-md text-[16px] text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 disabled:opacity-40'
              >
                <i className='ti ti-photo' />
              </button>
              <input
                ref={inputRef}
                type='file'
                accept={ACEPTA}
                hidden
                onChange={(e) => {
                  elegirImagen(e.target.files?.[0]);
                  e.target.value = ''; // permite volver a elegir la misma
                }}
              />
            </>
          )}
          <span className={cercaDelLimite ? 'text-amber-400' : ''}>
            {texto.length}/{COMENTARIO_MAX}
          </span>
          <span className='hidden sm:inline'>· Ctrl + Enter para enviar</span>
        </span>
        <div className='flex items-center gap-2'>
          {onCancel && (
            <button
              type='button'
              onClick={onCancel}
              disabled={pending}
              className='rounded-md px-2.5 py-1 text-[11.5px] text-neutral-500 hover:text-neutral-200 disabled:opacity-50'
            >
              Cancelar
            </button>
          )}
          <button
            type='button'
            onClick={enviar}
            disabled={pending || vacio}
            className='rounded-md bg-pink-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#D43E56] disabled:opacity-50'
          >
            {pending ? 'Enviando...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}