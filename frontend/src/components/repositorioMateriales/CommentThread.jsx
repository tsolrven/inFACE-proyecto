import { useState } from 'react';
import { votarComentario } from '../../services/repositorioMateriales/voto.service';
import { crearComentario } from '../../services/repositorioMateriales/comentario.service';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';
import { useAuthStore } from '../../stores/authStore';
import ReportModal from '../reportes/ReportModal';

const MAX_NIVEL = 2; 

export default function CommentThread({
  comentario,
  apunteId,
  onNuevaRespuesta,
}) {
  const [votoLocal, setVotoLocal] = useState(null); 
  const [votosNeto, setVotosNeto] = useState(comentario.votos_neto);
  const [respondiendo, setRespondiendo] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [reportando, setReportando] = useState(false);
  const usuario = useAuthStore((s) => s.usuario);
  const esDueno = usuario && comentario.autor?.id === usuario.id;

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
        </div>

        <div className='mb-1.5 text-[13px] leading-relaxed text-neutral-100'>
          {comentario.contenido}
        </div>

        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => handleVotar('up')}
            className={`flex items-center gap-1 text-[11.5px] transition-colors hover:text-[#FF6B35] ${
              votoLocal === 'up' ? 'text-[#FF6B35]' : 'text-neutral-600'
            }`}
          >
            <i className='ti ti-arrow-big-up' /> {votosNeto}
          </button>
          {comentario.nivel < MAX_NIVEL && (
            <button
              type='button'
              onClick={() => setRespondiendo((r) => !r)}
              className='flex items-center gap-1 text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200'
            >
              <i className='ti ti-message-reply' /> Responder
            </button>
          )}
          {!esDueno && usuario && (
            <button
              type='button'
              onClick={() => setReportando(true)}
              className='flex items-center gap-1 text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200'
            >
              <i className='ti ti-flag' /> Reportar
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
      </div>
    </div>
  );
}
