import { useState } from 'react';
import Modal, { ModalHeader, ModalBody } from '@/shared/components/ui/Modal';
import {
  solicitarEliminacionCuenta,
  cancelarEliminacionCuenta,
} from '@/shared/api/perfil.api';

const DIAS = 30;

function fechaLarga(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function EliminarCuenta({ programada: inicial }) {
  const [programada, setProgramada] = useState(inicial ?? null);
  const [abierto, setAbierto] = useState(false);
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  function cerrar() {
    setAbierto(false);
    setContrasena('');
    setError(null);
  }

  async function confirmar(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const r = await solicitarEliminacionCuenta(contrasena);
      setProgramada(r.eliminacion_programada_en);
      cerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function cancelar() {
    setCargando(true);
    try {
      await cancelarEliminacionCuenta();
      setProgramada(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <div className='rounded-2xl border border-red-500/20 bg-[#1E1E24] p-5'>
        <h2 className='text-[14px] font-bold text-neutral-100'>
          Eliminar mi cuenta
        </h2>

        {programada ? (
          <>
            <p className='mt-2 text-[12.5px] leading-relaxed text-amber-400'>
              Tu cuenta se eliminará el {fechaLarga(programada)}. Hasta entonces
              puedes seguir usándola y cancelar la eliminación.
            </p>
            <button
              type='button'
              onClick={cancelar}
              disabled={cargando}
              className='mt-3 rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-300 transition hover:text-neutral-100 disabled:opacity-50'
            >
              {cargando ? 'Cancelando…' : 'Cancelar eliminación'}
            </button>
          </>
        ) : (
          <>
            <p className='mt-2 text-[12.5px] leading-relaxed text-neutral-500'>
              Se borrarán tus datos personales (correo, nombre y biografía). Lo
              que hayas hecho en la plataforma quedará sin tu nombre, para
              evaluar los algoritmos de forma anónima. Tienes {DIAS} días para
              arrepentirte.
            </p>
            <button
              type='button'
              onClick={() => setAbierto(true)}
              className='mt-3 rounded-[10px] border border-red-500/30 px-4 py-2 text-[12.5px] font-medium text-red-400 transition hover:bg-red-500/10'
            >
              Eliminar mi cuenta
            </button>
          </>
        )}
        {error && !abierto && (
          <p className='mt-2 text-[12px] text-red-400'>{error}</p>
        )}
      </div>

      {abierto && (
        <Modal
          open
          onClose={cerrar}
          maxWidth='440px'
        >
          <ModalHeader
            title='Eliminar mi cuenta'
            subtitle={`Tu cuenta se eliminará en ${DIAS} días. Antes de eso puedes cancelarlo desde tu perfil.`}
            onClose={cerrar}
          />
          <ModalBody>
            <form
              onSubmit={confirmar}
              className='flex flex-col gap-4'
            >
              {error && (
                <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                  {error}
                </div>
              )}
              <label className='flex flex-col gap-1.5 text-[12.5px] text-neutral-400'>
                Escribe tu contraseña para confirmar
                <input
                  type='password'
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete='current-password'
                  className='rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3 py-2 text-[13px] text-neutral-100 outline-none focus:border-pink-500/50'
                />
              </label>
              <div className='flex justify-end gap-2 border-t border-white/[0.07] pt-4'>
                <button
                  type='button'
                  onClick={cerrar}
                  className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={cargando || !contrasena}
                  className='rounded-[10px] bg-red-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-red-600 disabled:opacity-50'
                >
                  {cargando ? 'Procesando…' : 'Eliminar mi cuenta'}
                </button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}
    </section>
  );
}