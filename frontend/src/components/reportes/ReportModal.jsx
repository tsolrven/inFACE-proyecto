import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal, { ModalHeader } from '../ui/Modal';
import Button from '../ui/Button';
import { MOTIVOS_REPORTE, obtenerMotivo } from '../../constants/reportMotivos';
import { reportar } from '../../services/reportes/reporte.service';

export default function ReportModal({
  open,
  onClose,
  tipoContenido,
  contenidoId,
}) {
  const [paso, setPaso] = useState('categorias'); // 'categorias' | 'objetivo'
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(null);
  const [objetivo, setObjetivo] = useState(null);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  function resetYCerrar() {
    onClose();
    setTimeout(() => {
      setPaso('categorias');
      setMotivoSeleccionado(null);
      setObjetivo(null);
      setDetalle('');
      setError(null);
      setEnviado(false);
    }, 200);
  }

  function handleSeleccionarMotivo(value) {
    setMotivoSeleccionado(value);
    setError(null);
  }

  function handleContinuar() {
    const motivo = obtenerMotivo(motivoSeleccionado);
    if (motivo?.requiereObjetivo) {
      setPaso('objetivo');
    } else {
      handleEnviar();
    }
  }

  async function handleEnviar(objetivoElegido = objetivo) {
    const motivo = obtenerMotivo(motivoSeleccionado);
    if (motivo?.requiereDetalle && !detalle.trim()) {
      setError('Cuéntanos brevemente qué pasó para poder revisarlo.');
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      await reportar(tipoContenido, contenidoId, {
        motivo: motivoSeleccionado,
        detalle: detalle.trim() || undefined,
        objetivo: objetivoElegido || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setError(
        err.message || 'No se pudo enviar el reporte. Intenta de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  const motivoActivo = obtenerMotivo(motivoSeleccionado);
  const puedeContinuar = !!motivoSeleccionado;

  return (
    <Modal
      open={open}
      onClose={resetYCerrar}
      maxWidth='460px'
    >
      <ModalHeader onClose={resetYCerrar}>
        <span className='text-[15px] font-semibold text-neutral-100'>
          {enviado ? 'Reporte enviado' : 'Reportar contenido'}
        </span>
      </ModalHeader>

      <div className='flex flex-col gap-4 p-5'>
        {enviado && (
          <div className='flex flex-col items-center gap-2 py-4 text-center'>
            <i className='ti ti-circle-check text-3xl text-emerald-400' />
            <p className='text-[13px] text-neutral-300'>
              Gracias por avisarnos. Nuestro equipo va a revisar este contenido.
            </p>
            <Button
              variant='secondary'
              onClick={resetYCerrar}
              className='mt-2'
            >
              Cerrar
            </Button>
          </div>
        )}

        {!enviado && paso === 'categorias' && (
          <>
            <div className='flex flex-col gap-1.5'>
              {MOTIVOS_REPORTE.map((motivo) => (
                <button
                  key={motivo.value}
                  type='button'
                  onClick={() => handleSeleccionarMotivo(motivo.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                    motivoSeleccionado === motivo.value
                      ? 'border-pink-500/50 bg-pink-500/[0.08] text-neutral-100'
                      : 'border-white/[0.07] text-neutral-300 hover:border-white/[0.15] hover:bg-white/[0.03]'
                  }`}
                >
                  {motivo.label}
                </button>
              ))}
            </div>

            {motivoActivo && (
              <div className='rounded-lg bg-white/[0.03] px-3 py-2.5 text-[12.5px] leading-relaxed text-neutral-400'>
                <span className='font-semibold text-neutral-200'>
                  {motivoActivo.label}
                </span>
                <br />
                {motivoActivo.descripcion}
              </div>
            )}

            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder={
                motivoActivo?.requiereDetalle
                  ? 'Cuéntanos qué pasó (obligatorio para este motivo)...'
                  : 'Detalles adicionales (opcional)...'
              }
              className='w-full resize-none rounded-lg border border-white/[0.07] bg-[#111114] px-3 py-2 text-[12.5px] text-neutral-100 outline-none placeholder-neutral-600 focus:border-pink-500/40'
            />

            <p className='text-[11.5px] text-neutral-600'>
              ¿No estás seguro si esto infringe las reglas?{' '}
              <Link
                to='/reglas'
                onClick={resetYCerrar}
                className='text-blue-400 hover:underline'
              >
                Revisa las Reglas de InFACE
              </Link>
              .
            </p>

            {error && <p className='text-[12.5px] text-red-400'>{error}</p>}

            <div className='flex justify-end gap-2'>
              <Button
                variant='ghost'
                onClick={resetYCerrar}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={handleContinuar}
                disabled={!puedeContinuar}
                loading={enviando}
              >
                {motivoActivo?.requiereObjetivo ? 'Siguiente' : 'Enviar'}
              </Button>
            </div>
          </>
        )}

        {!enviado && paso === 'objetivo' && (
          <>
            <p className='text-[13px] text-neutral-300'>
              ¿Hacia quién es el acoso?
            </p>
            <div className='flex flex-col gap-1.5'>
              {[
                { value: 'propio', label: 'Hacia mí' },
                { value: 'tercero', label: 'Hacia otra persona' },
              ].map((opcion) => (
                <button
                  key={opcion.value}
                  type='button'
                  onClick={() => setObjetivo(opcion.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                    objetivo === opcion.value
                      ? 'border-pink-500/50 bg-pink-500/[0.08] text-neutral-100'
                      : 'border-white/[0.07] text-neutral-300 hover:border-white/[0.15] hover:bg-white/[0.03]'
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>

            {error && <p className='text-[12.5px] text-red-400'>{error}</p>}

            <div className='flex justify-end gap-2'>
              <Button
                variant='ghost'
                onClick={() => setPaso('categorias')}
                disabled={enviando}
              >
                Atrás
              </Button>
              <Button
                variant='primary'
                onClick={() => handleEnviar(objetivo)}
                disabled={!objetivo}
                loading={enviando}
              >
                Enviar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
