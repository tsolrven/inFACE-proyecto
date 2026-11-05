import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useCerrarReportes,
  useRespuestasPredeterminadas,
} from '@/features/admin/hooks/useModeracion';
import { ETIQUETA_TIPO } from '@/shared/moderation/reportUi';

const RESPUESTA_MIN = 5;
const RESPUESTA_MAX = 500; // igual que el backend (Reporte.nota_resolucion)

const RESULTADOS = [
  {
    id: 'descartado',
    titulo: 'Descartar',
    detalle: 'Se revisó y no incumple las normas.',
    icono: 'ti-circle-x',
  },
  {
    id: 'resuelto',
    titulo: 'Resolver sin eliminar',
    detalle: 'El problema ya se solucionó (p. ej. el autor lo corrigió).',
    icono: 'ti-circle-check',
  },
  {
    id: 'contenido_eliminado',
    titulo: 'Eliminar contenido',
    detalle: 'Se elimina de forma permanente.',
    icono: 'ti-trash',
    peligro: true,
  },
];

const ETIQUETA_RESULTADO = { descartado: 'Descartado', resuelto: 'Resuelto' };

function construirMensaje({ resultado, tipo, titulo, pendientes }) {
  const aviso = `Se cerrar${pendientes === 1 ? 'á' : 'án'} ${pendientes} reporte${pendientes === 1 ? '' : 's'
    } y cada reportante recibirá un correo con la respuesta.`;

  if (resultado !== 'contenido_eliminado') {
    return `Resultado: ${ETIQUETA_RESULTADO[resultado]}.\n\n${aviso}`;
  }
  const que =
    tipo === 'comentario'
      ? 'este comentario'
      : `este ${(ETIQUETA_TIPO[tipo] ?? 'contenido').toLowerCase()} con sus comentarios, votos y archivos`;
  const nombre = titulo ? `\n«${titulo.slice(0, 80)}»` : '';
  return `Se eliminará ${que} de forma permanente. Esta acción no se puede deshacer.${nombre}\n\n${aviso}`;
}

export default function PanelCierre({
  tipo,
  id,
  titulo,
  existe,
  pendientes,
  onCerrado,
}) {
  const [resultado, setResultado] = useState(null);
  const [modo, setModo] = useState('predeterminada');
  const [texto, setTexto] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const { data: respuestas } = useRespuestasPredeterminadas();
  const cerrar = useCerrarReportes();

  const esEliminar = resultado === 'contenido_eliminado';
  const predeterminada = resultado ? respuestas?.[resultado] : null;
  const textoLimpio = texto.trim();
  const respuestaValida =
    modo === 'predeterminada'
      ? !!predeterminada
      : textoLimpio.length >= RESPUESTA_MIN &&
      textoLimpio.length <= RESPUESTA_MAX;
  const puedeCerrar = !!resultado && respuestaValida;

  function confirmar() {
    cerrar.mutate(
      {
        tipo,
        id,
        payload: {
          resultado,
          respuesta:
            modo === 'predeterminada'
              ? { tipo: 'predeterminada' }
              : { tipo: 'personalizada', texto: textoLimpio },
        },
      },
      {
        onSuccess: (data) => {
          setConfirmando(false);
          mostrarToast(`Reportes cerrados: ${data.reportes_cerrados}`);
          onCerrado();
        },
        onError: () => setConfirmando(false),
      },
    );
  }

  return (
    <section className='border-t border-white/[0.07] pt-4'>
      <h3 className='mb-3 text-[13px] font-bold text-neutral-100'>
        Cerrar {pendientes} reporte{pendientes === 1 ? '' : 's'} pendiente
        {pendientes === 1 ? '' : 's'}
      </h3>

      <div className='mb-4 flex flex-col gap-2'>
        {RESULTADOS.map((op) => {
          const deshabilitado = op.id === 'contenido_eliminado' && !existe;
          const activo = resultado === op.id;
          return (
            <button
              key={op.id}
              type='button'
              aria-pressed={activo}
              disabled={deshabilitado}
              onClick={() => setResultado(op.id)}
              className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${activo
                ? op.peligro
                  ? 'border-red-500/50 bg-red-500/[0.06]'
                  : 'border-pink-500/50 bg-pink-500/[0.06]'
                : 'border-white/[0.07] hover:border-white/[0.18]'
                }`}
            >
              <i
                className={`ti ${op.icono} mt-0.5 text-[16px] ${op.peligro ? 'text-red-400' : 'text-neutral-400'
                  }`}
              />
              <span>
                <span className='block text-[13px] font-semibold text-neutral-100'>
                  {op.titulo}
                </span>
                <span className='block text-[12px] text-neutral-500'>
                  {deshabilitado ? 'El contenido ya no existe.' : op.detalle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {resultado && (
        <div className='mb-4'>
          <p className='mb-2 text-[12px] font-semibold text-neutral-400'>
            Respuesta para quienes reportaron (se envía por correo)
          </p>
          <div className='mb-2.5 flex gap-1.5'>
            {[
              { id: 'predeterminada', label: 'Predeterminada' },
              { id: 'personalizada', label: 'Personalizada' },
            ].map((m) => (
              <button
                key={m.id}
                type='button'
                aria-pressed={modo === m.id}
                onClick={() => setModo(m.id)}
                className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${modo === m.id
                  ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                  : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18] hover:text-neutral-100'
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {modo === 'predeterminada' ? (
            <p className='rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12.5px] leading-relaxed text-neutral-300'>
              {predeterminada ?? (
                <span className='italic text-neutral-600'>
                  No se pudo cargar el texto; escribe una respuesta
                  personalizada.
                </span>
              )}
            </p>
          ) : (
            <>
              <textarea
                rows={4}
                maxLength={RESPUESTA_MAX}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder='Escribe el mensaje que recibirán por correo…'
                className={`${inputClasses} resize-none`}
              />
              <div className='mt-1 flex items-center justify-between'>
                <span className='text-[11px] text-neutral-600'>
                  Mínimo {RESPUESTA_MIN} caracteres. Solo texto.
                </span>
                <CharCounter
                  value={texto}
                  max={RESPUESTA_MAX}
                />
              </div>
            </>
          )}
        </div>
      )}

      {cerrar.isError && (
        <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {mensajeDeError(cerrar.error, 'No se pudieron cerrar los reportes.')}
        </div>
      )}

      <div className='flex justify-end'>
        <Button
          variant={esEliminar ? 'danger' : 'primary'}
          disabled={!puedeCerrar}
          onClick={() => setConfirmando(true)}
        >
          Cerrar reportes
        </Button>
      </div>

      <ConfirmDialog
        open={confirmando}
        danger={esEliminar}
        loading={cerrar.isPending}
        title={esEliminar ? 'Eliminar contenido' : 'Cerrar reportes'}
        message={
          resultado
            ? construirMensaje({ resultado, tipo, titulo, pendientes })
            : ''
        }
        confirmLabel={esEliminar ? 'Eliminar' : 'Cerrar'}
        onConfirm={confirmar}
        onCancel={() => setConfirmando(false)}
      />
    </section>
  );
}
