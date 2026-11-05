import { useState } from 'react';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import CharCounter from '@/shared/components/ui/CharCounter';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { useAuthStore } from '@/shared/auth/authStore';
import { mensajeDeError } from '@/shared/lib/errores';
import FlairChip from '@/features/announcements/components/FlairChip';
import {
  useFlairs,
  useCrearFlair,
  useActualizarFlair,
  useEliminarFlair,
} from '@/features/announcements/hooks/useFlairs';
import {
  COLORES_FLAIR,
  clasesFlair,
} from '@/features/announcements/utils/flairColors';
import { FLAIR_NOMBRE_MAX } from '@/features/announcements/utils/limites';
import {
  puedeGestionarFlairs,
  puedeEliminarFlair,
} from '@/features/announcements/utils/permisos';

// Igual que el backend: recorta y colapsa los espacios internos
const limpiarNombre = (texto) => texto.trim().replace(/\s+/g, ' ');

function SelectorColor({ valor, onChange }) {
  return (
    <div
      role='radiogroup'
      aria-label='Color del flair'
      className='flex flex-wrap gap-1.5'
    >
      {COLORES_FLAIR.map((color) => (
        <button
          key={color}
          type='button'
          role='radio'
          aria-checked={valor === color}
          title={color}
          onClick={() => onChange(color)}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-opacity ${clasesFlair(color)} ${
            valor === color
              ? 'ring-2 ring-current'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          <span className='h-2.5 w-2.5 rounded-full bg-current' />
        </button>
      ))}
    </div>
  );
}

/**
 * Administrar los flairs de una carrera. Quien puede gestionar (CEE o tutor de
 * la carrera) crea, renombra y cambia el color; además puede eliminar. El
 * superadmin solo elimina. El backend valida lo mismo.
 */
export default function AdministrarFlairsModal({ carreraId, onClose }) {
  const usuario = useAuthStore((s) => s.usuario);
  const puedeGestionar = puedeGestionarFlairs(usuario, carreraId);
  const puedeEliminar = puedeEliminarFlair(usuario, carreraId);

  const {
    data: flairs = [],
    isPending,
    error: errorLista,
  } = useFlairs(carreraId);
  const crear = useCrearFlair();
  const actualizar = useActualizarFlair();
  const eliminar = useEliminarFlair();

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoColor, setNuevoColor] = useState(COLORES_FLAIR[0]);
  const [editando, setEditando] = useState(null); // { id, nombre, color }
  const [porEliminar, setPorEliminar] = useState(null); // flair
  const [error, setError] = useState(null);

  async function handleCrear(e) {
    e.preventDefault();
    setError(null);
    const nombre = limpiarNombre(nuevoNombre);
    if (!nombre) {
      setError('El nombre del flair es obligatorio.');
      return;
    }
    try {
      await crear.mutateAsync({ nombre, color: nuevoColor });
      setNuevoNombre('');
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear el flair.'));
    }
  }

  function empezarEdicion(flair) {
    setError(null);
    setEditando({ id: flair.id, nombre: flair.nombre, color: flair.color });
  }

  async function handleGuardarEdicion(flair) {
    setError(null);
    const nombre = limpiarNombre(editando.nombre);
    if (!nombre) {
      setError('El nombre del flair es obligatorio.');
      return;
    }

    // Solo viaja lo que cambió
    const payload = {};
    if (nombre !== flair.nombre) payload.nombre = nombre;
    if (editando.color !== flair.color) payload.color = editando.color;
    if (Object.keys(payload).length === 0) {
      setEditando(null); // nada que guardar
      return;
    }

    try {
      await actualizar.mutateAsync({ id: flair.id, payload });
      setEditando(null);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el flair.'));
    }
  }

  async function handleEliminar() {
    setError(null);
    try {
      await eliminar.mutateAsync(porEliminar.id);
      if (editando?.id === porEliminar.id) setEditando(null);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar el flair.'));
    } finally {
      setPorEliminar(null);
    }
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        maxWidth='520px'
      >
        <ModalHeader
          onClose={onClose}
          title='Flairs de la carrera'
          subtitle={
            puedeGestionar
              ? 'Etiquetas de color para clasificar los anuncios.'
              : 'Como administrador solo puedes eliminar flairs.'
          }
        />

        <div className='flex flex-col gap-4 p-5'>
          {error && (
            <p className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-400'>
              {error}
            </p>
          )}

          {puedeGestionar && (
            <form
              onSubmit={handleCrear}
              className='flex flex-col gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3'
            >
              <div className='flex items-center justify-between'>
                <span className='text-[11.5px] font-semibold text-neutral-500'>
                  Nuevo flair
                </span>
                <CharCounter
                  value={nuevoNombre}
                  max={FLAIR_NOMBRE_MAX}
                />
              </div>
              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder='Ej: Evento'
                maxLength={FLAIR_NOMBRE_MAX}
                className={inputClasses}
              />
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <SelectorColor
                  valor={nuevoColor}
                  onChange={setNuevoColor}
                />
                <Button
                  type='submit'
                  variant='primary'
                  size='sm'
                  icon='ti-plus'
                  loading={crear.isPending}
                >
                  Crear
                </Button>
              </div>
            </form>
          )}

          {isPending && (
            <div className='flex items-center justify-center py-6 text-neutral-600'>
              <i className='ti ti-loader-2 animate-spin text-xl' />
            </div>
          )}

          {errorLista && (
            <p className='text-center text-[12.5px] text-red-400'>
              {errorLista.message}
            </p>
          )}

          {!isPending && !errorLista && flairs.length === 0 && (
            <p className='py-4 text-center text-[12.5px] text-neutral-600'>
              Esta carrera aún no tiene flairs.
            </p>
          )}

          <ul className='flex flex-col gap-2'>
            {flairs.map((flair) => {
              const enEdicion = editando?.id === flair.id;
              return (
                <li
                  key={flair.id}
                  className='rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5'
                >
                  {enEdicion ? (
                    <div className='flex flex-col gap-2.5'>
                      <input
                        autoFocus
                        value={editando.nombre}
                        onChange={(e) =>
                          setEditando({ ...editando, nombre: e.target.value })
                        }
                        maxLength={FLAIR_NOMBRE_MAX}
                        className={inputClasses}
                      />
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <SelectorColor
                          valor={editando.color}
                          onChange={(color) =>
                            setEditando({ ...editando, color })
                          }
                        />
                        <div className='flex gap-1.5'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setEditando(null)}
                            disabled={actualizar.isPending}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant='primary'
                            size='sm'
                            loading={actualizar.isPending}
                            onClick={() => handleGuardarEdicion(flair)}
                          >
                            Guardar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <FlairChip flair={flair} />
                      <span className='flex-1' />
                      {puedeGestionar && (
                        <button
                          type='button'
                          title='Editar flair'
                          aria-label={`Editar flair ${flair.nombre}`}
                          onClick={() => empezarEdicion(flair)}
                          className='flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
                        >
                          <i className='ti ti-pencil text-sm' />
                        </button>
                      )}
                      {puedeEliminar && (
                        <button
                          type='button'
                          title='Eliminar flair'
                          aria-label={`Eliminar flair ${flair.nombre}`}
                          onClick={() => setPorEliminar(flair)}
                          className='flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400'
                        >
                          <i className='ti ti-trash text-sm' />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!porEliminar}
        title='Eliminar flair'
        message={`Se eliminará el flair "${porEliminar?.nombre}". Los anuncios que lo usan quedarán sin flair. Esta acción no se puede deshacer.`}
        confirmLabel='Eliminar'
        danger
        loading={eliminar.isPending}
        onConfirm={handleEliminar}
        onCancel={() => setPorEliminar(null)}
      />
    </>
  );
}
