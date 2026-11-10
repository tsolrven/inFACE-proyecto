import { useState } from 'react';
import Campo from '@/shared/components/form/Campo';
import ArchivosInput from '@/shared/components/form/ArchivosInput';
import { inputClasses } from '@/shared/components/form/inputClasses';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import { useArchivosForm } from '@/shared/hooks/useArchivosForm';
import { extensionDe } from '@/shared/lib/archivos';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import { useCrearSolicitud } from '@/features/cargos/hooks/useSolicitudesCargo';
import { TIPOS_SOLICITABLES } from '@/features/cargos/utils/cargosUi';
import {
  MENSAJE_MIN,
  MENSAJE_MAX,
  MAX_RESPALDOS,
  MAX_BYTES_RESPALDO,
  EXTENSIONES_RESPALDO,
  DIAS_RENOVACION,
} from '@/features/cargos/utils/limites';

// Recibe un archivo nuevo (File: { name })
function iconoDeRespaldo(archivo) {
  const nombre = archivo.nombre_archivo ?? archivo.name ?? '';
  return extensionDe(nombre) === '.pdf' ? 'ti-file-type-pdf' : 'ti-photo';
}

// Solo se puede solicitar en una carrera propia (usuario.carreras).
export default function SolicitudForm({ carreras = [] }) {
  const crear = useCrearSolicitud();
  const [tipo, setTipo] = useState(TIPOS_SOLICITABLES[0].valor);
  const [carreraId, setCarreraId] = useState(carreras[0]?.id ?? '');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(null);
  const respaldos = useArchivosForm({
    max: MAX_RESPALDOS,
    maxBytes: MAX_BYTES_RESPALDO,
    extensiones: EXTENSIONES_RESPALDO,
    singular: 'respaldo',
    plural: 'respaldos',
  });

  const mensajeLimpio = mensaje.trim();
  const puedeEnviar =
    !!carreraId && mensajeLimpio.length >= MENSAJE_MIN && !crear.isPending;

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    if (!puedeEnviar) return;
    try {
      const { fallidos } = await crear.mutateAsync({
        payload: { tipo, carrera_id: carreraId, mensaje: mensajeLimpio },
        archivos: respaldos.nuevos,
      });
      setMensaje('');
      respaldos.reiniciar();
      mostrarToast(
        fallidos.length > 0
          ? `Solicitud enviada, pero ${fallidos.length} respaldo(s) no se subieron. Puedes cancelarla y enviarla de nuevo.`
          : 'Solicitud enviada',
      );
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar la solicitud.'));
    }
  }

  if (carreras.length === 0) {
    return (
      <p className='text-[12.5px] text-neutral-500'>
        Necesitas tener una carrera asociada para solicitar un cargo.
      </p>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className='flex flex-col gap-4'
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        <Campo label='Cargo'>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={inputClasses}
          >
            {TIPOS_SOLICITABLES.map((t) => (
              <option
                key={t.valor}
                value={t.valor}
              >
                {t.etiqueta}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label='Carrera'>
          <select
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value)}
            className={inputClasses}
          >
            {carreras.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo
        label='Mensaje para el equipo de moderación'
        extra={
          <CharCounter
            value={mensaje}
            max={MENSAJE_MAX}
          />
        }
      >
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={5}
          maxLength={MENSAJE_MAX}
          placeholder='Cuéntanos por qué solicitas el cargo y cómo se puede verificar.'
          className={`${inputClasses} resize-y`}
        />
      </Campo>

      <ArchivosInput
        control={respaldos}
        label='Respaldos (opcional)'
        ayuda={`PDF, JPG, PNG o WEBP · hasta ${MAX_BYTES_RESPALDO / (1024 * 1024)} MB cada uno. Solo los ven tú y la moderación, y se eliminan 30 días después de resolverse la solicitud.`}
        iconoDe={iconoDeRespaldo}
        textoOrden='Se subirán en este orden. Usa las flechas para cambiarlo.'
      />

      <p className='text-[11.5px] text-neutral-600'>
        Si ya tienes este cargo, solo puedes renovarlo cuando falten{' '}
        {DIAS_RENOVACION} días o menos para su vencimiento.
      </p>

      {error && (
        <p className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-400'>
          {error}
        </p>
      )}

      <div className='flex justify-end'>
        <Button
          type='submit'
          variant='primary'
          loading={crear.isPending}
          disabled={!puedeEnviar}
        >
          Enviar solicitud
        </Button>
      </div>
    </form>
  );
}