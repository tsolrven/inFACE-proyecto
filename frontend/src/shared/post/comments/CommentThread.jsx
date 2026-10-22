import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { esStaff, puedeEditar, puedeEliminar } from '@/shared/auth/roles';
import {
  COMENTARIO_MAX,
  COMENTARIO_MAX_NIVEL,
} from '@/shared/post/comments/constants';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useAuthStore } from '@/shared/auth/authStore';
import ReportModal from '@/shared/moderation/ReportModal';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';

const MAX_NIVEL_INDENTADO = 6;
const ANCHO_MENU = 150;

export default function CommentThread({ comentario, acciones }) {
  const [respondiendo, setRespondiendo] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [reportando, setReportando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(comentario.contenido);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const botonMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  const usuario = useAuthStore((s) => s.usuario);
  const esAutor = puedeEditar(usuario, comentario.autor?.id);
  const puedeBorrar = puedeEliminar(usuario, comentario.autor?.id);
  const esModerador = esStaff(usuario?.rol);

  const enviando = acciones.crear.isPending;
  const guardandoEdicion = acciones.editar.isPending;
  const eliminando = acciones.eliminar.isPending;

  const respuestasCargadas = comentario.respuestas?.length ?? 0;
  const faltanRespuestas = Math.max(
    0,
    (comentario.respuestas_count ?? 0) - respuestasCargadas,
  );
  // cursor_respuestas === null: ya se pidieron todas
  const hayMasPorCargar =
    faltanRespuestas > 0 && comentario.cursor_respuestas !== null;

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

  function handleVotar(tipo) {
    acciones.votar.mutate({ id: comentario.id, tipo });
  }

  function handleGuardar() {
    setMenuAbierto(false);
    acciones.guardar.mutate({
      id: comentario.id,
      guardar: !comentario.esta_guardado,
    });
  }

  function handleEnviarRespuesta() {
    const texto = textoRespuesta.trim();
    if (!texto) return;
    acciones.crear.mutate(
      { contenido: texto, padre_id: comentario.id },
      {
        onSuccess: () => {
          setTextoRespuesta('');
          setRespondiendo(false);
        },
      },
    );
  }

  function handleAbrirEdicion() {
    setTextoEditado(comentario.contenido);
    setEditando(true);
  }

  function handleGuardarEdicion() {
    const texto = textoEditado.trim();
    if (!texto) return;
    acciones.editar.mutate(
      { id: comentario.id, contenido: texto },
      { onSuccess: () => setEditando(false) },
    );
  }

  function handleEliminar() {
    acciones.eliminar.mutate(comentario.id, {
      onSuccess: () => setConfirmandoEliminar(false),
    });
  }

  function handleVerMasRespuestas() {
    acciones.masRespuestas.mutate({
      comentarioId: comentario.id,
      cursor: comentario.cursor_respuestas ?? undefined,
    });
  }

  if (comentario.eliminado) {
    return (
      <div className='flex gap-2.5'>
        <div className='flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-[#2A2A32] text-[10px] font-semibold text-neutral-700'>
          --
        </div>
        <div className='min-w-0 flex-1'>
          <div className='mb-1.5 text-[13px] italic leading-relaxed text-neutral-600'>
            {comentario.eliminado_por === 'moderacion'
              ? 'Comentario eliminado por moderación'
              : 'Comentario eliminado por el usuario'}
          </div>

          {comentario.respuestas?.length > 0 && (
            <div
              className={`mt-1 flex flex-col gap-3 ${
                comentario.nivel < MAX_NIVEL_INDENTADO
                  ? 'border-l border-dashed border-white/[0.08] pl-4'
                  : ''
              }`}
            >
              {comentario.respuestas.map((respuesta) => (
                <CommentThread
                  key={respuesta.id}
                  comentario={respuesta}
                  acciones={acciones}
                />
              ))}
            </div>
          )}

          {hayMasPorCargar && (
            <button
              type='button'
              onClick={handleVerMasRespuestas}
              disabled={acciones.masRespuestas.isPending}
              className='mt-2 flex items-center gap-1 text-[11.5px] font-medium text-blue-400 hover:underline disabled:opacity-50'
            >
              <i className='ti ti-corner-down-right' />
              {acciones.masRespuestas.isPending
                ? 'Cargando...'
                : `Ver ${faltanRespuestas} ${
                    respuestasCargadas > 0 ? 'más ' : ''
                  }${faltanRespuestas === 1 ? 'respuesta' : 'respuestas'}`}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-2.5'>
      <Link
        to={`/perfil/usuario/${comentario.autor?.nombre_usuario}`}
        className='flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-[#2A2A32] text-[10px] font-semibold text-neutral-400 transition hover:opacity-80'
      >
        {comentario.autor?.nombre_usuario?.slice(0, 2).toUpperCase() ?? '??'}
      </Link>

      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-1.5 text-xs'>
          <Link
            to={`/perfil/usuario/${comentario.autor?.nombre_usuario}`}
            className='font-semibold text-neutral-400 transition hover:text-neutral-100 hover:underline'
          >
            u/{comentario.autor?.nombre_usuario}
          </Link>
          <span className='text-neutral-600'>
            {formatearTiempoRelativo(comentario.creado_en)}
          </span>
          {comentario.editado_en && (
            <span className='text-neutral-700'>
              · editado {formatearTiempoRelativo(comentario.editado_en)}
            </span>
          )}
        </div>

        {editando ? (
          <div className='mb-1.5 flex flex-col gap-2'>
            <textarea
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              maxLength={COMENTARIO_MAX}
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
            {comentario.contenido}
          </div>
        )}

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => handleVotar('up')}
              className={`flex items-center transition-colors hover:text-[#FF6B35] ${
                comentario.mi_voto === 'up'
                  ? 'text-[#FF6B35]'
                  : 'text-neutral-600'
              }`}
            >
              <i className='ti ti-arrow-big-up text-[13px]' />
            </button>
            <span className='min-w-[14px] text-center text-[11.5px] font-semibold text-neutral-400'>
              {comentario.votos_neto}
            </span>
            <button
              type='button'
              onClick={() => handleVotar('down')}
              className={`flex items-center transition-colors hover:text-[#7B8CDE] ${
                comentario.mi_voto === 'down'
                  ? 'text-[#7B8CDE]'
                  : 'text-neutral-600'
              }`}
            >
              <i className='ti ti-arrow-big-down text-[13px]' />
            </button>
          </div>

          {comentario.nivel < COMENTARIO_MAX_NIVEL && (
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
              maxLength={COMENTARIO_MAX}
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
          <div
            className={`mt-3 flex flex-col gap-3 ${
              comentario.nivel < MAX_NIVEL_INDENTADO
                ? 'border-l border-dashed border-white/[0.08] pl-4'
                : ''
            }`}
          >
            {comentario.respuestas.map((respuesta) => (
              <CommentThread
                key={respuesta.id}
                comentario={respuesta}
                acciones={acciones}
              />
            ))}
          </div>
        )}

        {hayMasPorCargar && (
          <button
            type='button'
            onClick={handleVerMasRespuestas}
            disabled={acciones.masRespuestas.isPending}
            className='mt-2 flex items-center gap-1 text-[11.5px] font-medium text-blue-400 hover:underline disabled:opacity-50'
          >
            <i className='ti ti-corner-down-right' />
            {acciones.masRespuestas.isPending
              ? 'Cargando...'
              : `Ver ${faltanRespuestas} ${
                  respuestasCargadas > 0 ? 'más ' : ''
                }${faltanRespuestas === 1 ? 'respuesta' : 'respuestas'}`}
          </button>
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
              onClick={handleGuardar}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
            >
              <BookmarkIcon
                filled={comentario.esta_guardado}
                className={`text-[13px] ${
                  comentario.esta_guardado ? 'text-white' : ''
                }`}
              />{' '}
              {comentario.esta_guardado ? 'Quitar de guardados' : 'Guardar'}
            </button>
            {esAutor && (
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
            )}
            {puedeBorrar && (
              <button
                type='button'
                onClick={() => {
                  setMenuAbierto(false);
                  setConfirmandoEliminar(true);
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
              >
                <i className='ti ti-trash text-[13px]' />{' '}
                {esAutor ? 'Eliminar' : 'Eliminar (moderación)'}
              </button>
            )}
            {!esAutor && !esModerador && (
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
