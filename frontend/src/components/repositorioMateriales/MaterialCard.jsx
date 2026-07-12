import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRepositorioStore } from '../../stores/repositorioStore';
import { useAuthStore } from '../../stores/authStore';
import { colorPorRamo } from '../../utils/ramoColors';
import {
  metaPrincipal,
  metaDeArchivo,
  formatearTamanio,
} from '../../utils/fileMeta';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';
import { descargarArchivo } from '../../services/repositorioMateriales/archivo.service';
import { alternarGuardadoApunte } from '../../services/repositorioMateriales/guardado.service';
import { mostrarToast } from '../../stores/toastStore';
import EditApunteModal from './EditApunteModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import ReportModal from '../reportes/ReportModal';
import VotePill from './VotePill';
import { fueEditado } from '../../utils/fueEditado';

export default function MaterialCard({ apunte, onQuitarDeGuardados }) {
  const navigate = useNavigate();
  const location = useLocation();
  const votar = useRepositorioStore((s) => s.votar);
  const eliminarApunteDelFeed = useRepositorioStore(
    (s) => s.eliminarApunteDelFeed,
  );
  const actualizarApunteEnFeed = useRepositorioStore(
    (s) => s.actualizarApunteEnFeed,
  );
  const usuario = useAuthStore((s) => s.usuario);

  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [estaGuardado, setEstaGuardado] = useState(
    apunte.esta_guardado ?? false,
  );
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const esDueno =
    usuario &&
    (apunte.autor?.id === usuario.id ||
      usuario.rol === 'admin' ||
      usuario.rol === 'moderador');

  const iconMeta = metaPrincipal(apunte);
  const ramoColor = colorPorRamo(apunte.ramo?.id);

  function abrirDetalle() {
    navigate(`/repositorio-materiales/${apunte.id}`, {
      state: { backgroundLocation: location },
    });
  }

  function handleVotar(e, tipo) {
    e.stopPropagation();
    votar(apunte.id, tipo);
  }

  async function handleGuardar(e) {
    e.stopPropagation();
    setMenuAbierto(false);
    const anterior = estaGuardado;
    setEstaGuardado(!anterior);
    try {
      const { guardado } = await alternarGuardadoApunte(apunte.id);
      setEstaGuardado(guardado);
      actualizarApunteEnFeed(apunte.id, { esta_guardado: guardado });
      if (guardado) {
        mostrarToast('Publicación guardada');
      } else {
        mostrarToast('Quitado de guardados');
        onQuitarDeGuardados?.(apunte.id);
      }
    } catch {
      setEstaGuardado(anterior);
    }
  }

  async function handleEliminar() {
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarApunteDelFeed(apunte.id);
      setConfirmandoEliminar(false);
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el material.');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div
      onClick={abrirDetalle}
      className='relative mb-2 flex cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.12]'
    >
      {/* menú de tres puntos: guardar / reportar */}
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        className='absolute right-2 top-2 z-10'
      >
        <button
          type='button'
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          className='flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-200'
        >
          <i className='ti ti-dots text-base' />
        </button>

        {menuAbierto && (
          <div className='absolute right-0 top-[32px] w-[168px] overflow-hidden rounded-xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'>
            <button
              type='button'
              onClick={handleGuardar}
              className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
            >
              <i
                className={`ti ${estaGuardado ? 'ti-bookmark-filled text-pink-500' : 'ti-bookmark'} text-[14px]`}
              />{' '}
              {estaGuardado ? 'Quitar de guardados' : 'Guardar'}
            </button>
            {esDueno ? (
              <>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAbierto(false);
                    setEditando(true);
                  }}
                  className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
                >
                  <i className='ti ti-edit text-[14px]' /> Editar
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAbierto(false);
                    setConfirmandoEliminar(true);
                  }}
                  className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
                >
                  <i className='ti ti-trash text-[14px]' /> Eliminar
                </button>
              </>
            ) : (
              usuario && (
                <button
                  type='button'
                  onClick={() => {
                    setMenuAbierto(false);
                    setReportando(true);
                  }}
                  className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
                >
                  <i className='ti ti-flag text-[14px]' /> Reportar
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* columna ícono de archivo */}
      <div className='flex w-[52px] flex-shrink-0 items-center justify-center border-r border-white/[0.07]'>
        <div
          className='flex h-[34px] w-[34px] items-center justify-center rounded-[10px]'
          style={{ background: iconMeta.bg }}
        >
          <i
            className={`ti ${iconMeta.icon} text-lg`}
            style={{ color: iconMeta.color }}
          />
        </div>
      </div>

      {/* cuerpo */}
      <div className='min-w-0 flex-1 p-3'>
        <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
          <span
            className='rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
            style={{ background: `${ramoColor}22`, color: ramoColor }}
          >
            {apunte.ramo?.nombre}
          </span>
          <span className='text-[11.5px] text-neutral-600'>
            por{' '}
            <b className='text-neutral-400'>u/{apunte.autor?.nombre_usuario}</b>
          </span>
          <span className='text-[11px] text-neutral-600'>
            · {formatearTiempoRelativo(apunte.creado_en)}
          </span>
          {fueEditado(apunte.creado_en, apunte.actualizado_en) && (
            <span className='text-[11px] text-neutral-700'>
              · editado {formatearTiempoRelativo(apunte.actualizado_en)}
            </span>
          )}
        </div>

        <div className='mb-1 cursor-pointer text-sm font-semibold leading-snug text-neutral-100 hover:text-blue-400'>
          {apunte.titulo}
        </div>

        {apunte.descripcion && (
          <p className='mb-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400'>
            {apunte.descripcion}
          </p>
        )}

        <ArchivosPreview apunte={apunte} />

        {apunte.hashtags?.length > 0 && (
          <div className='mb-1.5 flex flex-wrap gap-1.5'>
            {apunte.hashtags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/repositorio-materiales/tag/${tag}`);
                }}
                className='text-[11px] text-blue-400 hover:underline'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-2 text-[11.5px] text-neutral-500'>
          <VotePill
            miVoto={apunte.mi_voto}
            votosNeto={apunte.votos_neto}
            onVotar={handleVotar}
          />

          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              abrirDetalle();
            }}
            className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
          >
            <i className='ti ti-message-circle-2 text-[13px]' />{' '}
            {apunte.comentarios_count}
          </button>

          <button
            type='button'
            onClick={(e) => e.stopPropagation()}
            className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
          >
            <i className='ti ti-share-3 text-[13px]' /> Compartir
          </button>

          <span
            onClick={(e) => e.stopPropagation()}
            className='ml-auto flex items-center gap-1'
          >
            <i className='ti ti-download text-[13px]' />{' '}
            {apunte.descargas ?? '—'} descargas
          </span>
        </div>
      </div>

      {!esDueno && (
        <div onClick={(e) => e.stopPropagation()}>
          <ReportModal
            open={reportando}
            onClose={() => setReportando(false)}
            tipoContenido='apunte'
            contenidoId={apunte.id}
          />
        </div>
      )}

      {esDueno && (
        <div onClick={(e) => e.stopPropagation()}>
          <EditApunteModal
            open={editando}
            onClose={() => setEditando(false)}
            apunte={apunte}
            carreraId={usuario?.carrera_id}
          />
          <ConfirmDialog
            open={confirmandoEliminar}
            title='Eliminar material'
            message={
              errorEliminar ||
              'Esta acción no se puede deshacer. Se eliminarán también sus archivos, comentarios y votos.'
            }
            confirmLabel='Eliminar'
            danger
            loading={eliminando}
            onConfirm={handleEliminar}
            onCancel={() => {
              setConfirmandoEliminar(false);
              setErrorEliminar(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ArchivosPreview({ apunte }) {
  if (apunte.link_repositorio) {
    return (
      <div className='mb-1.5 flex items-center gap-2 rounded-md border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.05)] px-2 py-1.5'>
        <i className='ti ti-brand-github text-[15px] text-[#818CF8]' />
        <span className='flex-1 truncate text-[11.5px] font-medium text-[#818CF8]'>
          {apunte.link_repositorio}
        </span>
      </div>
    );
  }

  if (apunte.codigo_snippet) {
    return (
      <pre className='mb-1.5 max-h-24 overflow-hidden rounded-md border border-white/[0.07] bg-black/30 px-2.5 py-2 text-[11px] text-emerald-300'>
        <code>{apunte.codigo_snippet.slice(0, 220)}</code>
      </pre>
    );
  }

  if (!apunte.archivos?.length) return null;

  return (
    <div className='mb-1.5 flex flex-col gap-1'>
      {apunte.archivos.map((archivo) => {
        const meta = metaDeArchivo(archivo);
        return (
          <div
            key={archivo.id}
            className='flex items-center gap-2.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1.5'
          >
            <i
              className={`ti ${meta.icon} flex-shrink-0 text-sm`}
              style={{ color: meta.color }}
            />
            <span className='flex-1 truncate text-[11.5px] font-medium text-neutral-300'>
              {archivo.nombre_archivo}
            </span>
            <span className='flex-shrink-0 text-[10.5px] text-neutral-600'>
              {formatearTamanio(archivo.tamanio)}
            </span>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                descargarArchivo(archivo);
              }}
              className='flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-400 hover:opacity-75'
            >
              <i className='ti ti-download text-[13px]' /> Descargar
            </button>
          </div>
        );
      })}
    </div>
  );
}
