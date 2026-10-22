import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import ReportModal from '@/shared/moderation/ReportModal';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import CommentActions from '@/shared/post/comments/CommentActions';
import CommentComposer from '@/shared/post/comments/CommentComposer';
import { COMENTARIO_MAX_NIVEL } from '@/shared/post/comments/constants';

// Desde esta profundidad (0 = raíz) las respuestas arrancan tras "Ver N respuestas".
const PROFUNDIDAD_RESPUESTAS_OCULTAS = 2;

const textoRespuestas = (n) => `${n} ${n === 1 ? 'respuesta' : 'respuestas'}`;

export default function CommentItem({
  comentario,
  acciones,
  profundidad = 0,
  maxIndent,
  onEnfocar,
}) {
  const [colapsado, setColapsado] = useState(false);
  const [mostrarRespuestas, setMostrarRespuestas] = useState(
    profundidad < PROFUNDIDAD_RESPUESTAS_OCULTAS,
  );
  const [respondiendo, setRespondiendo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [reportando, setReportando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  const respuestas = comentario.respuestas ?? [];
  const totalRespuestas = comentario.respuestas_count ?? 0;
  const faltan = Math.max(0, totalRespuestas - respuestas.length);
  // cursor_respuestas === null: ya se pidieron todas
  const hayMasPorCargar = faltan > 0 && comentario.cursor_respuestas !== null;
  // las respuestas de este comentario ya no caben en la indentación
  const alLimite = profundidad + 1 >= maxIndent;
  const hijosVisibles = mostrarRespuestas && !alLimite && respuestas.length > 0;

  const eliminado = comentario.eliminado;
  const nombre = comentario.autor?.nombre_usuario;
  const tieneToggle = !eliminado || totalRespuestas > 0;

  function cargarMasRespuestas() {
    acciones.masRespuestas.mutate({
      comentarioId: comentario.id,
      cursor: comentario.cursor_respuestas ?? undefined,
    });
  }

  function handleVerRespuestas() {
    setMostrarRespuestas(true);
    if (respuestas.length === 0) cargarMasRespuestas();
  }

  function enviarRespuesta(texto) {
    return acciones.crear
      .mutateAsync({ contenido: texto, padre_id: comentario.id })
      .then(() => {
        setRespondiendo(false);
        setMostrarRespuestas(true);
      });
  }

  function guardarEdicion(texto) {
    return acciones.editar
      .mutateAsync({ id: comentario.id, contenido: texto })
      .then(() => setEditando(false));
  }

  function confirmarEliminar() {
    acciones.eliminar.mutate(comentario.id, {
      onSuccess: () => setConfirmandoEliminar(false),
    });
  }

  return (
    <div className='flex gap-2.5'>
      {/* riel izquierdo: avatar + línea clicable para colapsar */}
      <div className='flex w-[26px] flex-shrink-0 flex-col items-center'>
        {eliminado ? (
          <div className='flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#2A2A32] text-[10px] font-semibold text-neutral-700'>
            --
          </div>
        ) : (
          <Link
            to={`/perfil/usuario/${nombre}`}
            aria-label={`Perfil de u/${nombre}`}
            className='flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#2A2A32] text-[10px] font-semibold text-neutral-400 transition hover:opacity-80'
          >
            {nombre?.slice(0, 2).toUpperCase() ?? '??'}
          </Link>
        )}

        {hijosVisibles && !colapsado && (
          <button
            type='button'
            onClick={() => setColapsado(true)}
            aria-label='Colapsar hilo'
            className='group mt-1 flex w-4 flex-1 cursor-pointer justify-center'
          >
            <span className='w-px bg-white/[0.08] transition-colors group-hover:bg-white/30' />
          </button>
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-1.5 text-xs'>
          {!eliminado && (
            <Link
              to={`/perfil/usuario/${nombre}`}
              className='font-semibold text-neutral-400 transition hover:text-neutral-100 hover:underline'
            >
              u/{nombre}
            </Link>
          )}
          <span className='text-neutral-600'>
            {formatearTiempoRelativo(comentario.creado_en)}
          </span>
          {!eliminado && comentario.editado_en && (
            <span className='text-neutral-700'>
              · editado {formatearTiempoRelativo(comentario.editado_en)}
            </span>
          )}
          {tieneToggle && (
            <button
              type='button'
              onClick={() => setColapsado((c) => !c)}
              aria-expanded={!colapsado}
              aria-label={
                colapsado ? 'Expandir comentario' : 'Colapsar comentario'
              }
              className='ml-auto flex items-center text-[14px] text-neutral-700 transition-colors hover:text-neutral-300'
            >
              <i
                className={`ti ${colapsado ? 'ti-circle-plus' : 'ti-circle-minus'}`}
              />
            </button>
          )}
        </div>

        {colapsado ? (
          totalRespuestas > 0 && (
            <p className='text-[11.5px] text-neutral-600'>
              {totalRespuestas === 1
                ? '1 respuesta oculta'
                : `${totalRespuestas} respuestas ocultas`}
            </p>
          )
        ) : (
          <>
            {eliminado && (
              <p className='mb-1.5 text-[13px] italic leading-relaxed text-neutral-600'>
                {comentario.eliminado_por === 'moderacion'
                  ? 'Comentario eliminado por moderación'
                  : 'Comentario eliminado por el usuario'}
              </p>
            )}

            {!eliminado && editando && (
              <div className='mb-1.5'>
                <CommentComposer
                  initialValue={comentario.contenido}
                  submitLabel='Guardar'
                  rows={2}
                  autoFocus
                  pending={acciones.editar.isPending}
                  onSubmit={guardarEdicion}
                  onCancel={() => setEditando(false)}
                />
              </div>
            )}

            {!eliminado && !editando && (
              <>
                <p className='mb-1.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-neutral-100'>
                  {comentario.contenido}
                </p>
                <CommentActions
                  comentario={comentario}
                  acciones={acciones}
                  puedeResponder={comentario.nivel < COMENTARIO_MAX_NIVEL}
                  onResponder={() => setRespondiendo((r) => !r)}
                  onEditar={() => setEditando(true)}
                  onEliminar={() => setConfirmandoEliminar(true)}
                  onReportar={() => setReportando(true)}
                />
              </>
            )}

            {respondiendo && (
              <div className='mt-2'>
                <CommentComposer
                  placeholder='Escribe tu respuesta...'
                  submitLabel='Responder'
                  rows={2}
                  autoFocus
                  pending={acciones.crear.isPending}
                  onSubmit={enviarRespuesta}
                  onCancel={() => setRespondiendo(false)}
                />
              </div>
            )}

            {hijosVisibles && (
              <div className='mt-3 flex flex-col gap-3'>
                {respuestas.map((respuesta) => (
                  <CommentItem
                    key={respuesta.id}
                    comentario={respuesta}
                    acciones={acciones}
                    profundidad={profundidad + 1}
                    maxIndent={maxIndent}
                    onEnfocar={onEnfocar}
                  />
                ))}
              </div>
            )}

            {alLimite && totalRespuestas > 0 && (
              <button
                type='button'
                onClick={() => onEnfocar(comentario.id)}
                className='mt-2 text-[11.5px] font-medium text-blue-400 hover:underline'
              >
                Continuar este hilo →
              </button>
            )}

            {!alLimite && !mostrarRespuestas && totalRespuestas > 0 && (
              <button
                type='button'
                onClick={handleVerRespuestas}
                disabled={acciones.masRespuestas.isPending}
                className='mt-2 flex items-center gap-1 text-[11.5px] font-medium text-blue-400 hover:underline disabled:opacity-50'
              >
                <i className='ti ti-corner-down-right' /> Ver{' '}
                {textoRespuestas(totalRespuestas)}
              </button>
            )}

            {!alLimite && mostrarRespuestas && hayMasPorCargar && (
              <button
                type='button'
                onClick={cargarMasRespuestas}
                disabled={acciones.masRespuestas.isPending}
                className='mt-2 flex items-center gap-1 text-[11.5px] font-medium text-blue-400 hover:underline disabled:opacity-50'
              >
                <i className='ti ti-corner-down-right' />
                {acciones.masRespuestas.isPending
                  ? 'Cargando...'
                  : `Ver ${respuestas.length > 0 ? 'más ' : ''}${textoRespuestas(faltan)}`}
              </button>
            )}
          </>
        )}

        {reportando && (
          <ReportModal
            open
            onClose={() => setReportando(false)}
            tipoContenido='comentario'
            contenidoId={comentario.id}
          />
        )}

        {confirmandoEliminar && (
          <ConfirmDialog
            open
            title='Eliminar comentario'
            message={
              totalRespuestas > 0
                ? 'Este comentario tiene respuestas, así que quedará como "eliminado" y su texto se borrará.'
                : 'Esta acción no se puede deshacer.'
            }
            confirmLabel='Eliminar'
            danger
            loading={acciones.eliminar.isPending}
            onConfirm={confirmarEliminar}
            onCancel={() => setConfirmandoEliminar(false)}
          />
        )}
      </div>
    </div>
  );
}
