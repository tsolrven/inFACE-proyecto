import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useModalBehavior from '@/shared/hooks/useModalBehavior';
import { useEnPantalla } from '@/shared/hooks/useEnPantalla';
import {
  abrirArchivoEnPestana,
  descargarArchivo,
} from '@/shared/api/archivos.api';
import { formatearTamanio } from '@/shared/lib/archivos';
import { mostrarToast } from '@/shared/stores/toastStore';
import { abrirDocumentoPdf, dibujarPagina } from '@/shared/pdf/pdfDatos';

const ANCHO_MAX = 900;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const PASO_ZOOM = 0.25;

// Una página: se dibuja recién cuando se acerca a la pantalla, y se vuelve a
// dibujar si cambia el ancho (zoom). Antes de dibujarse ocupa su alto real
// aproximado, para que el scroll no salte.
function PaginaPdf({ doc, numero, ancho, proporcion }) {
  const cajaRef = useRef(null);
  const canvasRef = useRef(null);
  const visible = useEnPantalla(cajaRef, { margen: '800px' });

  useEffect(() => {
    if (!visible) return;
    let cancelado = false;
    let tarea = null;
    (async () => {
      const pagina = await doc.getPage(numero);
      if (cancelado || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      tarea = await dibujarPagina(pagina, canvasRef.current, ancho * dpr);
      try {
        await tarea.promise;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') throw err;
      }
    })().catch(() => { });
    return () => {
      cancelado = true;
      tarea?.cancel();
    };
  }, [visible, doc, numero, ancho]);

  return (
    <div
      ref={cajaRef}
      data-pagina={numero}
      className='bg-white shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
      style={{ width: ancho, minHeight: ancho * proporcion }}
    >
      <canvas
        ref={canvasRef}
        className='block h-auto w-full'
      />
    </div>
  );
}

// El documento de un adjunto: se monta de nuevo (key) al cambiar de adjunto,
// así su estado parte limpio sin efectos que lo reinicien.
function DocumentoPdf({ archivo, zoom, onInfo, onFondo }) {
  const [estado, setEstado] = useState({ doc: null, proporcion: 1.414 });
  const [error, setError] = useState(null);
  const [anchoBase, setAnchoBase] = useState(ANCHO_MAX);
  const contRef = useRef(null);
  const actualRef = useRef(1);
  const onInfoRef = useRef(onInfo);
  useEffect(() => {
    onInfoRef.current = onInfo;
  });

  useEffect(() => {
    let cancelado = false;
    let carga = null;
    abrirDocumentoPdf(archivo.id)
      .then(async (tarea) => {
        carga = tarea;
        if (cancelado) {
          await tarea.destroy();
          return;
        }
        const doc = await tarea.promise;
        if (cancelado) return;
        const vp = (await doc.getPage(1)).getViewport({ scale: 1 });
        if (cancelado) return;
        setEstado({ doc, proporcion: vp.height / vp.width });
        onInfoRef.current({ paginas: doc.numPages, actual: 1 });
      })
      .catch((err) => {
        if (!cancelado) setError(err.message || 'No se pudo abrir el PDF');
      });
    return () => {
      cancelado = true;
      if (carga) {
        void carga
          .destroy()
          .catch((err) => console.error('No se pudo cerrar el PDF', err));
      }
    };
  }, [archivo.id]);

  // ancho "ajustado": el del área visible, con margen, hasta ANCHO_MAX
  useEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const observador = new ResizeObserver(([e]) =>
      setAnchoBase(Math.min(e.contentRect.width - 32, ANCHO_MAX)),
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // página actual: la que ocupa el primer tercio de la pantalla
  function alDesplazar() {
    const el = contRef.current;
    if (!el) return;
    const linea = el.scrollTop + el.clientHeight / 3;
    let actual = 1;
    el.querySelectorAll('[data-pagina]').forEach((p) => {
      if (p.offsetTop <= linea) actual = Number(p.dataset.pagina);
    });
    if (actual !== actualRef.current) {
      actualRef.current = actual;
      onInfoRef.current({ actual });
    }
  }

  const ancho = Math.max(anchoBase, 200) * zoom;

  return (
    <div
      ref={contRef}
      onScroll={alDesplazar}
      // clic en el fondo oscuro (fuera de las páginas) cierra, como en Gmail
      onClick={(e) => e.target === e.currentTarget && onFondo()}
      className='relative min-h-0 flex-1 overflow-auto'
    >
      {error ? (
        <div className='flex h-full flex-col items-center justify-center gap-3 text-center text-[13px] text-neutral-300'>
          <i className='ti ti-file-alert text-4xl text-neutral-500' />
          {error}
        </div>
      ) : !estado.doc ? (
        <div className='flex h-full items-center justify-center text-neutral-400'>
          <i className='ti ti-loader-2 animate-spin text-3xl' />
        </div>
      ) : (
        <div
          onClick={(e) => e.target === e.currentTarget && onFondo()}
          className='flex w-max min-w-full flex-col items-center gap-4 px-4 py-6'
        >
          {Array.from({ length: estado.doc.numPages }, (_, i) => (
            <PaginaPdf
              key={i + 1}
              doc={estado.doc}
              numero={i + 1}
              ancho={ancho}
              proporcion={estado.proporcion}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BotonBarra({ icono, etiqueta, onClick, disabled, children }) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      title={etiqueta}
      className='flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-neutral-200 transition-colors hover:bg-white/[0.12] disabled:opacity-30 disabled:hover:bg-transparent'
    >
      {icono && <i className={`ti ${icono} text-[18px]`} />}
      {children}
    </button>
  );
}

/**
 * Visor de PDF a pantalla completa (tipo Gmail).
 * archivos: los PDF de la publicación (← → o las flechas pasan entre ellos)
 */
export default function VisorPdf({ archivos, indiceInicial = 0, onCerrar }) {
  const [indice, setIndice] = useState(indiceInicial);
  const [zoom, setZoom] = useState(1);
  const [info, setInfo] = useState({ id: null, paginas: 0, actual: 1 });
  const archivo = archivos[indice];
  const varios = archivos.length > 1;

  useModalBehavior(true, onCerrar);

  function irA(nuevo) {
    if (nuevo < 0 || nuevo >= archivos.length) return;
    setIndice(nuevo);
    setZoom(1);
  }

  function cambiarZoom(delta) {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)));
  }

  // ← → cambian de adjunto; + y − hacen zoom (Esc lo maneja useModalBehavior)
  useEffect(() => {
    function alTeclear(e) {
      if (e.key === 'ArrowLeft') irA(indice - 1);
      else if (e.key === 'ArrowRight') irA(indice + 1);
      else if (e.key === '+' || e.key === '=') cambiarZoom(PASO_ZOOM);
      else if (e.key === '-') cambiarZoom(-PASO_ZOOM);
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  });

  async function accion(fn, mensajeError) {
    try {
      await fn(archivo);
    } catch (err) {
      mostrarToast(err.message || mensajeError);
    }
  }

  const infoActual = info.id === archivo.id ? info : null;

  return (
    // portal: los eventos de React igual suben al padre (p. ej. una tarjeta
    // con onClick); se detienen aquí
    <div onClick={(e) => e.stopPropagation()}>
      {createPortal(
        <div
          role='dialog'
          aria-modal='true'
          aria-label={`Vista previa de ${archivo.nombre_archivo}`}
          className='fixed inset-0 z-[10000] flex flex-col bg-black/85 backdrop-blur-sm'
        >
          <div className='flex h-14 flex-shrink-0 items-center gap-2 bg-black/40 px-2 text-neutral-200 sm:px-4'>
            <i className='ti ti-file-type-pdf flex-shrink-0 text-[22px] text-[#E8546A]' />
            <div className='min-w-0 flex-1'>
              <div className='truncate text-[13.5px] font-semibold'>
                {archivo.nombre_archivo}
              </div>
              <div className='text-[11px] text-neutral-400'>
                {formatearTamanio(archivo.tamanio)}
                {varios && ` · adjunto ${indice + 1} de ${archivos.length}`}
              </div>
            </div>

            {infoActual?.paginas > 0 && (
              <span className='hidden text-[12px] text-neutral-300 md:inline'>
                Página {infoActual.actual} de {infoActual.paginas}
              </span>
            )}

            <div className='mx-1 hidden items-center rounded-full bg-white/[0.06] sm:flex'>
              <BotonBarra
                icono='ti-minus'
                etiqueta='Alejar'
                onClick={() => cambiarZoom(-PASO_ZOOM)}
                disabled={zoom <= ZOOM_MIN}
              />
              <BotonBarra
                etiqueta='Ajustar al ancho'
                onClick={() => setZoom(1)}
              >
                <span className='min-w-[42px] text-[12px] font-semibold'>
                  {Math.round(zoom * 100)}%
                </span>
              </BotonBarra>
              <BotonBarra
                icono='ti-plus'
                etiqueta='Acercar'
                onClick={() => cambiarZoom(PASO_ZOOM)}
                disabled={zoom >= ZOOM_MAX}
              />
            </div>

            <BotonBarra
              icono='ti-download'
              etiqueta='Descargar'
              onClick={() =>
                accion(descargarArchivo, 'No se pudo descargar el archivo')
              }
            />
            <BotonBarra
              icono='ti-external-link'
              etiqueta='Abrir en pestaña nueva (buscar e imprimir)'
              onClick={() =>
                accion(abrirArchivoEnPestana, 'No se pudo abrir el archivo')
              }
            />
            <BotonBarra
              icono='ti-x'
              etiqueta='Cerrar'
              onClick={onCerrar}
            />
          </div>

          <div className='relative flex min-h-0 flex-1'>
            <DocumentoPdf
              key={archivo.id}
              archivo={archivo}
              zoom={zoom}
              onFondo={onCerrar}
              onInfo={(parcial) =>
                setInfo((prev) => ({
                  ...(prev.id === archivo.id
                    ? prev
                    : { paginas: 0, actual: 1 }),
                  ...parcial,
                  id: archivo.id,
                }))
              }
            />

            {varios && (
              <>
                <button
                  type='button'
                  onClick={() => irA(indice - 1)}
                  disabled={indice === 0}
                  aria-label='Adjunto anterior'
                  className='absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:hidden'
                >
                  <i className='ti ti-chevron-left text-[22px]' />
                </button>
                <button
                  type='button'
                  onClick={() => irA(indice + 1)}
                  disabled={indice === archivos.length - 1}
                  aria-label='Adjunto siguiente'
                  className='absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:hidden'
                >
                  <i className='ti ti-chevron-right text-[22px]' />
                </button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}