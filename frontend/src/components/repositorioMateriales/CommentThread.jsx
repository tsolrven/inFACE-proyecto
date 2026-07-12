import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { votarComentario } from '../../services/repositorioMateriales/voto.service';
import {
  crearComentario,
  editarComentario,
  eliminarComentario,
} from '../../services/repositorioMateriales/comentario.service';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';
import { fueEditado } from '../../utils/fueEditado';
import { useAuthStore } from '../../stores/authStore';
import ReportModal from '../reportes/ReportModal';
import ConfirmDialog from '../ui/ConfirmDialog';

const MAX_NIVEL = 2;
const ANCHO_MENU = 150;

export default function CommentThread({
  comentario,
  apunteId,
  onNuevaRespuesta,
  onComentarioEliminado,
}) {
  const [votoLocal, setVotoLocal] = useState(comentario.mi_voto ?? null);
  const [votosNeto, setVotosNeto] = useState(comentario.votos_neto);
  const [respondiendo, setRespondiendo] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [reportando, setReportando] = useState(false);

  const [contenidoLocal, setContenidoLocal] = useState(comentario.contenido);
  const [actualizadoEnLocal, setActualizadoEnLocal] = useState(
    comentario.actualizado_en,
  );
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(comentario.contenido);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const botonMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  const usuario = useAuthStore((s) => s.usuario);
  const esDueno = usuario && comentario.autor?.id === usuario.id;

  useEffect(() => {
    if (!menuAbierto) return;

    function handleClickOutside(e) {
      const dentroDelBoton = botonMenuRef.current?.contains(e.target);
      const dentroDelMenu = dropdownRef.current?.contains(e.target);
      if (!dentroDelBoton && !dentroDelMenu) {
        setMenuAbierto(false);
      }
    }
    function handleScrollOCerrar() {
      setMenuAbierto(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOCerrar, true);
    window.addEventListener('resize', handleScrollOCerrar);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOCerrar, true);
      window.removeEventListener('resize', handleScrollOCerrar);
    };
  }, [menuAbierto]);

  function handleAbrirMenu() {
    if (!menuAbierto && botonMenuRef.current) {
      const rect = botonMenuRef.current.getBoundingClientRect();
      const espacioAbajo = window.innerHeight - rect.bottom;
      const abrirHaciaArriba = espacioAbajo < 140;

      setMenuPos({
        top: abrirHaciaArriba ? rect.top - 4 : rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - ANCHO_MENU - 8),
        haciaArriba: abrirHaciaArriba,
      });
    }
    setMenuAbierto((a) => !a);
  }

  async function handleVotar(tipo) {
    const anterior = { votoLocal, votosNeto };
    const mismoVoto = votoLocal === tipo;
    const delta = mismoVoto
      ? tipo === 'up'
        ? -1
        : 1
      : votoLocal === null
        ? tipo === 'up'
          ? 1
          : -1
        : tipo === 'up'
          ? 2
          : -2;

    setVotoLocal(mismoVoto ? null : tipo);
    setVotosNeto((v) => v + delta);

    try {
      await votarComentario(comentario.id, tipo);
    } catch {
      setVotoLocal(anterior.votoLocal);
      setVotosNeto(anterior.votosNeto);
    }
  }

  async function handleEnviarRespuesta() {
    if (!textoRespuesta.trim()) return;
    setEnviando(true);
    try {
      const nueva = await crearComentario(apunteId, {
        contenido: textoRespuesta,
        padre_id: comentario.id,
      });
      onNuevaRespuesta(comentario.id, nueva);
      setTextoRespuesta('');
      setRespondiendo(false);
    } finally {
      setEnviando(false);
    }
  }

  function handleAbrirEdicion() {
    setTextoEditado(contenidoLocal);
    setEditando(true);
  }

  async function handleGuardarEdicion() {
    if (!textoEditado.trim()) return;
    setGuardandoEdicion(true);
    try {
      const actualizado = await editarComentario(comentario.id, textoEditado);
      setContenidoLocal(actualizado.contenido);
      setActualizadoEnLocal(actualizado.actualizado_en);
      setEditando(false);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function handleEliminar() {
    setEliminando(true);
    try {
      const resultado = await eliminarComentario(comentario.id);
      onComentarioEliminado(comentario.id, resultado.eliminado_permanente);
      setConfirmandoEliminar(false);
    } finally {
      setEliminando(false);
    }
  }

  // nodo eliminado (soft-delete): se preserva el hilo pero se oculta autor/contenido/acciones
  if (comentario.eliminado) {
    return (
      <div className='flex gap-2.5'>
        <div className='flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-[#2A2A32] text-[10px] font-semibold text-neutral-700'>
          --
        </div>
        <div className='min-w-0 flex-1'>
          <div className='mb-1.5 text-[13px] italic leading-relaxed text-neutral-600'>
            Comentario eliminado por el usuario
          </div>

          {comentario.respuestas?.length > 0 && (
            <div className='mt-1 flex flex-col gap-3 border-l border-dashed border-white/[0.08] pl-4'>
              {comentario.respuestas.map((respuesta) => (
                <CommentThread
                  key={respuesta.id}
                  comentario={respuesta}
                  apunteId={apunteId}
                  onNuevaRespuesta={onNuevaRespuesta}
                  onComentarioEliminado={onComentarioEliminado}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-2.5'>
      <div className='flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-[#2A2A32] text-[10px] font-semibold text-neutral-400'>
        {comentario.autor?.nombre_usuario?.slice(0, 2).toUpperCase() ?? '??'}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-1.5 text-xs'>
          <span className='font-semibold text-neutral-400'>
            u/{comentario.autor?.nombre_usuario}
          </span>
          <span className='text-neutral-600'>
            {formatearTiempoRelativo(comentario.creado_en)}
          </span>
          {fueEditado(comentario.creado_en, actualizadoEnLocal) && (
            <span className='text-neutral-700'>
              · editado {formatearTiempoRelativo(actualizadoEnLocal)}
            </span>
          )}
        </div>

        {editando ? (
          <div className='mb-1.5 flex flex-col gap-2'>
            <textarea
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              rows={2}
              className='w-full resize-none rounded-lg border border-white/[0.07] bg-[#111114] px-3 py-2 text-[12.5px] text-neutral-100 outline-none placeholder-neutral-600 focus:border-pink-500/40'
            />
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                onClick={() => setEditando(false)}
                className='rounded-md px-2.5 py-1 text-[11.5px] text-neutral-500 hover:text-neutral-200'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={handleGuardarEdicion}
                disabled={guardandoEdicion}
                className='rounded-md bg-pink-500 px-3 py-1 text-[11.5px] font-semibold text-white hover:bg-[#D43E56] disabled:opacity-50'
              >
                {guardandoEdicion ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className='mb-1.5 text-[13px] leading-relaxed text-neutral-100'>
            {contenidoLocal}
          </div>
        )}

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => handleVotar('up')}
              className={`flex items-center transition-colors hover:text-[#FF6B35] ${
                votoLocal === 'up' ? 'text-[#FF6B35]' : 'text-neutral-600'
              }`}
            >
              <i
                className={`ti ${votoLocal === 'up' ? 'ti-arrow-big-up-filled' : 'ti-arrow-big-up'} text-[13px]`}
              />
            </button>
            <span className='min-w-[14px] text-center text-[11.5px] font-semibold text-neutral-400'>
              {votosNeto}
            </span>
            <button
              type='button'
              onClick={() => handleVotar('down')}
              className={`flex items-center transition-colors hover:text-[#7B8CDE] ${
                votoLocal === 'down' ? 'text-[#7B8CDE]' : 'text-neutral-600'
              }`}
            >
              <i
                className={`ti ${votoLocal === 'down' ? 'ti-arrow-big-down-filled' : 'ti-arrow-big-down'} text-[13px]`}
              />
            </button>
          </div>

          {comentario.nivel < MAX_NIVEL && (
            <button
              type='button'
              onClick={() => setRespondiendo((r) => !r)}
              className='flex items-center gap-1 text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200'
            >
              <i className='ti ti-message-reply' /> Responder
            </button>
          )}

          {usuario && (
            <button
              type='button'
              ref={botonMenuRef}
              onClick={handleAbrirMenu}
              className='flex items-center text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200'
            >
              <i className='ti ti-dots' />
            </button>
          )}
        </div>

        {respondiendo && (
          <div className='mt-2 flex flex-col gap-2'>
            <textarea
              value={textoRespuesta}
              onChange={(e) => setTextoRespuesta(e.target.value)}
              rows={2}
              placeholder='Escribe tu respuesta...'
              className='w-full resize-none rounded-lg border border-white/[0.07] bg-[#111114] px-3 py-2 text-[12.5px] text-neutral-100 outline-none placeholder-neutral-600 focus:border-pink-500/40'
            />
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                onClick={() => setRespondiendo(false)}
                className='rounded-md px-2.5 py-1 text-[11.5px] text-neutral-500 hover:text-neutral-200'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={handleEnviarRespuesta}
                disabled={enviando}
                className='rounded-md bg-pink-500 px-3 py-1 text-[11.5px] font-semibold text-white hover:bg-[#D43E56] disabled:opacity-50'
              >
                {enviando ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </div>
        )}

        {comentario.respuestas?.length > 0 && (
          <div className='mt-3 flex flex-col gap-3 border-l border-dashed border-white/[0.08] pl-4'>
            {comentario.respuestas.map((respuesta) => (
              <CommentThread
                key={respuesta.id}
                comentario={respuesta}
                apunteId={apunteId}
                onNuevaRespuesta={onNuevaRespuesta}
                onComentarioEliminado={onComentarioEliminado}
              />
            ))}
          </div>
        )}

        <ReportModal
          open={reportando}
          onClose={() => setReportando(false)}
          tipoContenido='comentario'
          contenidoId={comentario.id}
        />

        <ConfirmDialog
          open={confirmandoEliminar}
          title='Eliminar comentario'
          message='Esta acción no se puede deshacer.'
          confirmLabel='Eliminar'
          danger
          loading={eliminando}
          onConfirm={handleEliminar}
          onCancel={() => setConfirmandoEliminar(false)}
        />
      </div>

      {menuAbierto &&
        menuPos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: ANCHO_MENU,
              transform: menuPos.haciaArriba ? 'translateY(-100%)' : 'none',
            }}
            className='z-[9999] overflow-hidden rounded-xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
          >
            <button
              type='button'
              onClick={() => setMenuAbierto(false)}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
            >
              <i className='ti ti-bookmark text-[13px]' /> Guardar
            </button>
            {esDueno ? (
              <>
                <button
                  type='button'
                  onClick={() => {
                    setMenuAbierto(false);
                    handleAbrirEdicion();
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
                >
                  <i className='ti ti-edit text-[13px]' /> Editar
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setMenuAbierto(false);
                    setConfirmandoEliminar(true);
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
                >
                  <i className='ti ti-trash text-[13px]' /> Eliminar
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => {
                  setMenuAbierto(false);
                  setReportando(true);
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
              >
                <i className='ti ti-flag text-[13px]' /> Reportar
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
