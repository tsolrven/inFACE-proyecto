import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  listarProyectos,
  listarMisProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  postularProyecto,
  listarMisPostulaciones,
  retirarPostulacion,
  toggleFavorito,
  listarFavoritos,
  obtenerProyecto,
} from '../../services/matchingProyecto';
import { listarEtiquetas } from '../../services/etiqueta';
import {
  getInitials,
  avatarColor,
  etiquetaColor,
  ModalidadChip,
  EstadoPostulacionChip,
  formatFecha,
  tiempoRelativo,
} from '../../helpers/matchHelpers';
import ProyectoFormModal from './ProyectoFormModal';
import DetalleProyecto from './DetalleProyecto';
import PostularModal from './PostularModal';
import PostulacionesModal from './PostulacionesModal';
import IntegrantesModal from './IntegrantesModal';
import DescubrirTab from './DescubrirTab';
import ConfirmDialog from './ConfirmDialog';

const TABS = [
  { id: 'descubrir', label: 'Descubrir', icon: 'ti-flame' },
  { id: 'explorar', label: 'Explorar', icon: 'ti-compass' },
  { id: 'mis', label: 'Mis proyectos', icon: 'ti-folder' },
  { id: 'postulaciones', label: 'Mis postulaciones', icon: 'ti-inbox' },
  { id: 'guardados', label: 'Guardados', icon: 'ti-bookmark' },
];

export default function MatchProyectos() {
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // se inicializa desde la URL para que sobreviva a un remount (ej. volver de ver
  // el perfil de alguien), en vez de resetearse siempre a 'descubrir'.
  const [tab, setTabState] = useState(() => searchParams.get('tab') || 'descubrir');
  const [search, setSearch] = useState('');
  // mientras esto es true no se muestra nada (ni tabs ni detalle), para evitar el "flash"
  // de Descubrir antes de resolver un ?proyecto=ID que venga en la URL al montar.
  const [resolviendoDetalleInicial, setResolviendoDetalleInicial] = useState(() => !!searchParams.get('proyecto'));

  // datos globales usados por varias pestañas
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosLoaded, setFavoritosLoaded] = useState(false);
  const [misPostulaciones, setMisPostulaciones] = useState([]);
  const [misPostulacionesLoaded, setMisPostulacionesLoaded] = useState(false);

  const [modalCrear, setModalCrear] = useState(null);
  const [proyectoDetalle, setProyectoDetalle] = useState(null);
  const [modalPostular, setModalPostular] = useState(null);
  const [modalPostulaciones, setModalPostulaciones] = useState(null);
  const [verTodasPostulaciones, setVerTodasPostulaciones] = useState(false);
  const [modalIntegrantes, setModalIntegrantes] = useState(null);
  const [confirmEliminarDetalle, setConfirmEliminarDetalle] = useState(null);
  const [avisoError, setAvisoError] = useState(null);

  const favoritosIds = useMemo(() => new Set(favoritos.map((p) => p.id)), [favoritos]);

  const recargarFavoritos = useCallback(async () => {
    try {
      const data = await listarFavoritos();
      setFavoritos(data);
    } catch {
      // silencioso: no bloquea el resto de la página
    } finally {
      setFavoritosLoaded(true);
    }
  }, []);

  const recargarMisPostulaciones = useCallback(async () => {
    try {
      const data = await listarMisPostulaciones();
      setMisPostulaciones(data);
    } catch {
      // silencioso
    } finally {
      setMisPostulacionesLoaded(true);
    }
  }, []);

  useEffect(() => {
    recargarFavoritos();
    recargarMisPostulaciones();
  }, [recargarFavoritos, recargarMisPostulaciones]);

  const postuladosActivos = useMemo(() => {
    const set = new Set();
    misPostulaciones.forEach((p) => {
      if (p.estado === 'pendiente') set.add(p.proyecto_id);
      if (p.estado === 'aceptada' && p.sigue_siendo_integrante) set.add(p.proyecto_id);
    });
    return set;
  }, [misPostulaciones]);

  function setTab(id) {
    setTabState(id);
    const params = new URLSearchParams(searchParams);
    params.set('tab', id);
    params.delete('proyecto');
    params.delete('panel');
    setSearchParams(params, { replace: true });
  }

  async function handleToggleFavorito(proyectoId) {
    try {
      await toggleFavorito(proyectoId);
    } finally {
      recargarFavoritos();
    }
  }

  async function handlePostular(proyectoId, mensaje) {
    await postularProyecto(proyectoId, mensaje);
    recargarMisPostulaciones();
  }

  // abre el detalle de un proyecto como una navegación real (queda en el historial de
  // verdad), así "Volver" y el botón "atrás" del navegador siempre funcionan como se
  // espera, incluso después de salir a ver el perfil de alguien y regresar.
  function abrirDetalle(proyectoId, { conIntegrantes = false } = {}) {
    const params = new URLSearchParams();
    params.set('proyecto', proyectoId);
    if (conIntegrantes) params.set('panel', 'integrantes');
    navigate(`/match-proyectos?${params.toString()}`);
  }

  function handleVerDetalle(proyecto) {
    setProyectoDetalle(proyecto); // optimista: se muestra al toque, sin esperar el fetch
    abrirDetalle(proyecto.id);
  }

  function handleVerDetallePorId(proyectoId) {
    abrirDetalle(proyectoId);
  }

  function handleVerIntegrantesDesdeDetalle() {
    abrirDetalle(proyectoDetalle.id, { conIntegrantes: true });
  }

  function handleVolverDetalle() {
    navigate(-1);
  }

  function handleCerrarIntegrantes() {
    navigate(-1);
  }

  async function handleEliminarDesdeDetalle(proyecto) {
    setConfirmEliminarDetalle(proyecto);
  }

  async function ejecutarEliminarDesdeDetalle() {
    const proyecto = confirmEliminarDetalle;
    setConfirmEliminarDetalle(null);
    try {
      await eliminarProyecto(proyecto.id);
      window.dispatchEvent(new Event('inface:mis-proyectos-actualizados'));
      navigate(-1);
    } catch (err) {
      setAvisoError(err.message);
    }
  }

  // vuelve a pedir el proyecto y refresca lo que esté mostrando ahora mismo (detalle
  // y/o modal de integrantes), sin navegar a ningún lado — para usar después de editar,
  // aceptar/rechazar postulaciones, o expulsar/agregar integrantes.
  async function refrescarDetalle(proyectoId) {
    try {
      const p = await obtenerProyecto(proyectoId);
      p._completo = true;
      setProyectoDetalle((actual) => (actual?.id === proyectoId ? p : actual));
      setModalIntegrantes((actual) => (actual?.id === proyectoId ? p : actual));
    } catch {
      // ignorar
    }
  }

  // el estado de la vista (qué detalle está abierto, si el modal de integrantes está
  // abierto encima) vive en la URL en vez de solo en memoria, así sobrevive a salir a
  // ver el perfil de alguien y volver con "atrás" (o remontar el componente).
  useEffect(() => {
    const proyectoId = searchParams.get('proyecto');
    const panel = searchParams.get('panel');

    if (!proyectoId) {
      setProyectoDetalle(null);
      setModalIntegrantes(null);
      setResolviendoDetalleInicial(false);
      return;
    }

    (async () => {
      let detalle = null;
      setProyectoDetalle((actual) => {
        detalle = actual?.id === proyectoId && actual?._completo ? actual : null;
        return actual;
      });

      if (!detalle) {
        try {
          detalle = await obtenerProyecto(proyectoId);
          detalle._completo = true;
          setProyectoDetalle(detalle);
        } catch {
          detalle = null;
        }
      }

      setModalIntegrantes(panel === 'integrantes' && detalle ? detalle : null);
      setResolviendoDetalleInicial(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div>
      {/* HEADER (mismo estilo que Repositorio de materiales) */}
      <div className='px-4 pt-6 sm:px-[26px]'>
        <div className='mb-4 flex items-center gap-1.5 text-[12px] text-neutral-500'>
          <span>Inicio</span>
          <i className='ti ti-chevron-right text-[12px]' />
          <span>Cultural</span>
          <i className='ti ti-chevron-right text-[12px]' />
          <span className='text-neutral-300'>Match de proyectos</span>
        </div>

        <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] bg-pink-500/10'>
              <i className='ti ti-puzzle text-[22px] text-pink-400' />
            </div>
            <div>
              <h1 className='text-[19px] font-bold text-neutral-50'>Match de proyectos</h1>
              <p className='hidden text-[12.5px] text-neutral-500 sm:block'>
                Encuentra o forma equipos para proyectos académicos y de emprendimiento
              </p>
            </div>
          </div>

          <div className='relative w-full sm:w-auto'>
            <i className='ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-neutral-600' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar en Match de proyectos...'
              className='w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] py-2 pl-9 pr-3 text-[12.5px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50 sm:w-64'
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      {!proyectoDetalle && !resolviendoDetalleInicial && (
        <div className='sticky top-0 z-20 flex items-center overflow-x-auto border-b border-white/[0.07] bg-[#17171B] px-4 sm:px-[26px]'>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[12.5px] font-medium transition sm:px-4 sm:py-3 sm:text-[13px] ${tab === t.id
                ? 'border-pink-500 font-semibold text-pink-500'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
            >
              <i className={`ti ${t.icon} text-[15px]`} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className='px-4 pb-10 pt-[22px] sm:px-[26px]'>
        {resolviendoDetalleInicial ? (
          <p className='py-16 text-center text-[13px] text-neutral-500'>Cargando…</p>
        ) : proyectoDetalle ? (
          <DetalleProyecto
            proyecto={proyectoDetalle}
            esCreador={proyectoDetalle.creador?.id === usuario?.id}
            esIntegrante={proyectoDetalle.integrantes?.some((i) => i.usuario_id === usuario?.id)}
            yaPostulado={postuladosActivos.has(proyectoDetalle.id)}
            puedePostular={proyectoDetalle.estado === 'abierto'}
            onVolver={handleVolverDetalle}
            onPostular={handlePostular}
            onEditar={() => setModalCrear(proyectoDetalle)}
            onEliminar={() => handleEliminarDesdeDetalle(proyectoDetalle)}
            onVerIntegrantes={handleVerIntegrantesDesdeDetalle}
            onVerPostulaciones={() => setModalPostulaciones(proyectoDetalle)}
            onVerHistorialPostulaciones={() => {
              setVerTodasPostulaciones(true);
              setModalPostulaciones(proyectoDetalle);
            }}
          />
        ) : (
          <>
            {/* las 5 pestañas quedan siempre montadas (solo se ocultan con CSS) para que su estado
                y sus datos ya cargados no se pierdan/reinicien al cambiar de pestaña o volver a Descubrir */}
            <div style={{ display: tab === 'descubrir' ? 'block' : 'none' }}>
              <DescubrirTab
                usuario={usuario}
                favoritosIds={favoritosIds}
                postuladosActivos={postuladosActivos}
                onToggleFavorito={handleToggleFavorito}
                onVerDetalle={handleVerDetalle}
                onPostularClick={setModalPostular}
                onIrExplorar={() => setTab('explorar')}
                search={search}
              />
            </div>
            <div style={{ display: tab === 'explorar' ? 'block' : 'none' }}>
              <ExplorarTab
                usuario={usuario}
                favoritosIds={favoritosIds}
                postuladosActivos={postuladosActivos}
                onToggleFavorito={handleToggleFavorito}
                onVerDetalle={handleVerDetalle}
                onPostularClick={setModalPostular}
                search={search}
              />
            </div>
            <div style={{ display: tab === 'guardados' ? 'block' : 'none' }}>
              <GuardadosTab
                usuario={usuario}
                favoritos={favoritos}
                loaded={favoritosLoaded}
                postuladosActivos={postuladosActivos}
                onToggleFavorito={handleToggleFavorito}
                onVerDetalle={handleVerDetalle}
                onPostularClick={setModalPostular}
                search={search}
              />
            </div>
            <div style={{ display: tab === 'mis' ? 'block' : 'none' }}>
              <MisProyectosTab
                usuario={usuario}
                onCrear={() => setModalCrear('crear')}
                onEditar={(p) => setModalCrear(p)}
                onVerPostulaciones={(p) => setModalPostulaciones(p)}
                onVerIntegrantes={(p) => abrirDetalle(p.id, { conIntegrantes: true })}
                onVerDetalle={handleVerDetalle}
                search={search}
              />
            </div>
            <div style={{ display: tab === 'postulaciones' ? 'block' : 'none' }}>
              <MisPostulacionesTab
                postulaciones={misPostulaciones}
                loaded={misPostulacionesLoaded}
                onRecargar={recargarMisPostulaciones}
                onVerProyecto={handleVerDetallePorId}
              />
            </div>
          </>
        )}
      </div>

      {/* MODALES */}
      {modalCrear && (
        <ProyectoFormModal
          proyecto={modalCrear === 'crear' ? null : modalCrear}
          onClose={() => setModalCrear(null)}
          onSubmit={async (payload) => {
            if (modalCrear === 'crear') {
              await crearProyecto(payload);
            } else {
              await actualizarProyecto(modalCrear.id, payload);
              if (proyectoDetalle?.id === modalCrear.id) refrescarDetalle(modalCrear.id);
            }
            setModalCrear(null);
            window.dispatchEvent(new Event('inface:mis-proyectos-actualizados'));
          }}
        />
      )}

      {modalPostular && (
        <PostularModal
          proyecto={modalPostular}
          onClose={() => setModalPostular(null)}
          onPostular={handlePostular}
        />
      )}

      {modalPostulaciones && (
        <PostulacionesModal
          proyecto={modalPostulaciones}
          verTodas={verTodasPostulaciones}
          onIrAVerPendientes={() => setVerTodasPostulaciones(false)}
          onClose={() => {
            setModalPostulaciones(null);
            setVerTodasPostulaciones(false);
          }}
          onCambio={() => {
            window.dispatchEvent(new Event('inface:mis-proyectos-actualizados'));
            if (proyectoDetalle?.id === modalPostulaciones.id) refrescarDetalle(modalPostulaciones.id);
          }}
        />
      )}

      {modalIntegrantes && (
        <IntegrantesModal
          proyecto={modalIntegrantes}
          esCreador={modalIntegrantes.creador?.id === usuario?.id}
          onClose={handleCerrarIntegrantes}
          onCambio={() => {
            window.dispatchEvent(new Event('inface:mis-proyectos-actualizados'));
            refrescarDetalle(modalIntegrantes.id);
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmEliminarDetalle}
        title='Eliminar proyecto'
        message={confirmEliminarDetalle ? `¿Eliminar el proyecto "${confirmEliminarDetalle.titulo}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel='Eliminar'
        danger
        onConfirm={ejecutarEliminarDesdeDetalle}
        onCancel={() => setConfirmEliminarDetalle(null)}
      />

      <ConfirmDialog
        open={!!avisoError}
        title='Ocurrió un error'
        message={avisoError || ''}
        confirmLabel='Entendido'
        danger
        soloConfirmar
        onConfirm={() => setAvisoError(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILA DE BÚSQUEDA + FILTROS (compartida entre pestañas)
// ─────────────────────────────────────────────────────────────────────────────

function FilterRow({ children }) {
  return <div className='mb-4 flex flex-wrap gap-2.5'>{children}</div>;
}

function FilterDropdown({ label, icon = 'ti-adjustments-horizontal', sections }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_WIDTH = 220;

  function calcularPosicion() {
    const rect = btnRef.current.getBoundingClientRect();
    // por defecto se alinea a la derecha del botón, pero si el botón está muy cerca
    // del borde izquierdo (ej. con el sidebar colapsado) eso deja el menú con
    // coordenada negativa y se corta; en ese caso se alinea a la izquierda del botón.
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = rect.left;
    // tampoco debe salirse por la derecha de la ventana
    if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
    return { top: rect.bottom + 6, left };
  }

  function abrir() {
    setCoords(calcularPosicion());
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onScrollOrResize() {
      if (!btnRef.current) return;
      setCoords(calcularPosicion());
    }
    document.addEventListener('mousedown', onClick);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  return (
    <div className='flex-shrink-0'>
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : abrir())}
        className='flex h-[38px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
      >
        <i className={`ti ${icon} text-[14px]`} />
        {label}
        <i className='ti ti-chevron-down text-[13px]' />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className='fixed z-[300] w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]'
            style={{ top: coords.top, left: coords.left }}
          >
            {sections.map((sec, i) => (
              <div key={i}>
                {sec.title && (
                  <div className='px-3.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-600'>
                    {sec.title}
                  </div>
                )}
                {sec.options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      sec.onSelect(opt.value);
                      setOpen(false);
                    }}
                    className={`flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[13px] transition hover:bg-white/[0.04] ${sec.selected === opt.value ? 'text-pink-500' : 'text-neutral-400'
                      }`}
                  >
                    {opt.label}
                    {sec.selected === opt.value && <i className='ti ti-check ml-auto text-[14px]' />}
                  </div>
                ))}
                {i < sections.length - 1 && <div className='my-1 h-px bg-white/[0.07]' />}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

function EtiquetaFilterDropdown({ selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [etiquetas, setEtiquetas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_WIDTH = 260;

  useEffect(() => {
    listarEtiquetas().then(setEtiquetas).catch(() => setEtiquetas([]));
  }, []);

  function calcularPosicion() {
    const rect = btnRef.current.getBoundingClientRect();
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = rect.left;
    if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
    return { top: rect.bottom + 6, left };
  }

  function abrir() {
    setCoords(calcularPosicion());
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onScrollOrResize() {
      if (!btnRef.current) return;
      setCoords(calcularPosicion());
    }
    document.addEventListener('mousedown', onClick);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  function toggle(id) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((i) => i !== id));
    else onChange([...selectedIds, id]);
  }

  const filtradas = etiquetas.filter((et) => et.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));
  const porTipo = filtradas.reduce((acc, et) => {
    const tipo = et.tipo || 'Otras';
    (acc[tipo] ||= []).push(et);
    return acc;
  }, {});

  return (
    <div className='flex-shrink-0'>
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : abrir())}
        className='flex h-[38px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
      >
        <i className='ti ti-tag text-[14px]' />
        Etiquetas
        {selectedIds.length > 0 && (
          <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white'>
            {selectedIds.length}
          </span>
        )}
        <i className='ti ti-chevron-down text-[13px]' />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className='fixed z-[300] flex max-h-[380px] w-[260px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_32px_rgba(0,0,0,0.5)]'
            style={{ top: coords.top, left: coords.left }}
          >
            <div className='p-3 pb-2'>
              <div className='relative'>
                <i className='ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-neutral-600' />
                <input
                  autoFocus
                  type='text'
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder='Buscar etiqueta...'
                  className='w-full rounded-[8px] border border-white/[0.07] bg-[#232329] py-1.5 pl-8 pr-2.5 text-[12px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-pink-500/50'
                />
              </div>
            </div>

            <div className='flex-1 overflow-y-auto px-3 pb-2'>
              {filtradas.length === 0 && (
                <p className='py-3 text-center text-[12px] text-neutral-600'>Sin resultados</p>
              )}
              {Object.entries(porTipo).map(([tipo, ets]) => (
                <div
                  key={tipo}
                  className='mb-2.5'
                >
                  <div className='mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-600'>
                    {tipo}
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {ets.map((et) => {
                      const c = etiquetaColor(et.nombre);
                      const seleccionada = selectedIds.includes(et.id);
                      return (
                        <button
                          key={et.id}
                          onClick={() => toggle(et.id)}
                          className={`rounded-full border px-2 py-1 text-[11px] font-medium transition ${seleccionada
                            ? `${c.bg} ${c.text} ${c.border}`
                            : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.16] hover:text-neutral-100'
                            }`}
                        >
                          {seleccionada && <i className='ti ti-check mr-1 text-[10px]' />}
                          {et.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={() => onChange([])}
                className='m-3 mt-1 rounded-[8px] border border-white/[0.07] py-1.5 text-[11.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
              >
                Limpiar selección
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className='flex flex-col items-center px-5 py-14 text-center'>
      <i className={`ti ${icon} mb-3 text-5xl text-neutral-700`} />
      <h3 className='mb-1 text-[15px] font-bold text-neutral-400'>{title}</h3>
      <p className='max-w-[280px] text-[13px] leading-relaxed text-neutral-600'>{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: EXPLORAR
// ─────────────────────────────────────────────────────────────────────────────

function ExplorarTab({ usuario, favoritosIds, postuladosActivos, onToggleFavorito, onVerDetalle, onPostularClick, search }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroEtiquetas, setFiltroEtiquetas] = useState([]);
  const [orden, setOrden] = useState('recientes');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarProyectos({
        estado: filtroEstado || undefined,
        modalidad: filtroModalidad || undefined,
        etiquetas: filtroEtiquetas.length ? filtroEtiquetas : undefined,
        limite: 60,
      });
      setProyectos(data.datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroModalidad, filtroEtiquetas]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    window.addEventListener('inface:mis-proyectos-actualizados', cargar);
    return () => window.removeEventListener('inface:mis-proyectos-actualizados', cargar);
  }, [cargar]);

  const proyectosFiltrados = useMemo(() => {
    let lista = proyectos;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      lista = lista.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.etiquetas?.some((e) => e.nombre.toLowerCase().includes(q)),
      );
    }
    lista = [...lista];
    if (orden === 'integrantes') {
      lista.sort((a, b) => b.total_integrantes - a.total_integrantes);
    } else {
      lista.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    }
    return lista;
  }, [proyectos, search, orden]);

  return (
    <div>
      <FilterRow>
        <FilterDropdown
          label='Filtrar'
          sections={[
            {
              title: 'Estado',
              selected: filtroEstado,
              onSelect: setFiltroEstado,
              options: [
                { value: '', label: 'Todos' },
                { value: 'abierto', label: 'Abiertos' },
                { value: 'en_progreso', label: 'En progreso' },
                { value: 'cerrado', label: 'Cerrados' },
              ],
            },
            {
              title: 'Modalidad',
              selected: filtroModalidad,
              onSelect: setFiltroModalidad,
              options: [
                { value: '', label: 'Todas' },
                { value: 'remoto', label: 'Remoto' },
                { value: 'presencial', label: 'Presencial' },
                { value: 'hibrido', label: 'Híbrido' },
              ],
            },
            {
              title: 'Ordenar por',
              selected: orden,
              onSelect: setOrden,
              options: [
                { value: 'recientes', label: 'Más recientes' },
                { value: 'integrantes', label: 'Más integrantes' },
              ],
            },
          ]}
        />
        <EtiquetaFilterDropdown
          selectedIds={filtroEtiquetas}
          onChange={setFiltroEtiquetas}
        />
      </FilterRow>

      {loading && <p className='py-10 text-center text-[13px] text-neutral-500'>Cargando proyectos…</p>}

      {error && (
        <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400'>
          No se pudieron cargar los proyectos: {error}
        </div>
      )}

      {!loading && !error && (search.trim() || filtroEstado || filtroModalidad || filtroEtiquetas.length > 0) && (
        <p className='mb-3 text-[12.5px] text-neutral-500'>
          {proyectosFiltrados.length} coincidencia{proyectosFiltrados.length === 1 ? '' : 's'} encontrada{proyectosFiltrados.length === 1 ? '' : 's'}
        </p>
      )}

      {!loading && !error && proyectosFiltrados.length === 0 && (
        <EmptyState
          icon='ti-mood-empty'
          title='No hay proyectos que coincidan'
          subtitle='Prueba con otros términos de búsqueda o cambia los filtros aplicados.'
        />
      )}

      <div className='flex flex-col gap-4'>
        {proyectosFiltrados.map((p) => (
          <ProyectoCard
            key={p.id}
            proyecto={p}
            esCreador={p.creador?.id === usuario?.id}
            esFavorito={favoritosIds.has(p.id)}
            yaPostulado={postuladosActivos.has(p.id)}
            onToggleFavorito={() => onToggleFavorito(p.id)}
            onVerDetalle={() => onVerDetalle(p)}
            onPostularClick={() => onPostularClick(p)}
          />
        ))}
      </div>
    </div>
  );
}

function iconoYColorEstado(estado) {
  if (estado === 'abierto') return { icono: 'ti-lock-open', clase: 'bg-emerald-400/10 text-emerald-400', titulo: 'Abierto' };
  if (estado === 'en_progreso') return { icono: 'ti-progress', clase: 'bg-sky-400/10 text-sky-400', titulo: 'En progreso' };
  return { icono: 'ti-lock', clase: 'bg-white/[0.06] text-neutral-500', titulo: 'Cerrado' };
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA BASE (estilo "post" de feed): columna de acento a la izquierda + contenido
// a lo ancho + footer con meta a la izquierda y acciones a la derecha. La misma
// estructura se reutiliza en Explorar, Guardados, Mis proyectos y Mis postulaciones.
// ─────────────────────────────────────────────────────────────────────────────

function TarjetaProyectoBase({ proyecto: p, extra, accionesDerecha }) {
  const cupos = p.maximo_integrantes ? p.maximo_integrantes - p.total_integrantes : null;
  const { icono, clase, titulo } = iconoYColorEstado(p.estado);

  return (
    <div className='flex overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24] transition hover:border-white/[0.12]'>
      {/* columna de acento */}
      <div className='flex w-[54px] flex-shrink-0 flex-col items-center gap-2 border-r border-white/[0.06] bg-white/[0.015] py-4'>
        <div
          title={titulo}
          className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${clase}`}
        >
          <i className={`ti ${icono} text-[17px]`} />
        </div>
      </div>

      <div className='min-w-0 flex-1 p-4'>
        {/* meta: modalidad · creador · tiempo */}
        <div className='mb-2.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-neutral-500'>
          <ModalidadChip modalidad={p.modalidad} />
          <span>·</span>
          <Link
            to={`/perfil/usuario/${p.creador?.nombre_usuario}`}
            className='font-semibold text-neutral-300 transition hover:text-pink-400 hover:underline'
          >
            u/{p.creador?.nombre_usuario}
          </Link>
          {p.creador?.carrera && <span>· {p.creador.carrera.nombre}</span>}
          <span>· {tiempoRelativo(p.fecha_creacion)}</span>
        </div>

        <div className='mb-1 text-[15px] font-bold leading-snug text-neutral-100'>{p.titulo}</div>

        <p className='mb-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400'>{p.descripcion}</p>

        {p.etiquetas?.length > 0 && (
          <div className='mb-3 flex flex-wrap gap-1.5'>
            {p.etiquetas.slice(0, 6).map((et) => {
              const c = etiquetaColor(et.nombre);
              return (
                <span
                  key={et.id}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text} ${c.border}`}
                >
                  {et.nombre}
                </span>
              );
            })}
          </div>
        )}

        {extra}

        <div className='flex flex-wrap items-center justify-between gap-2.5 border-t border-white/[0.06] pt-3'>
          <div className='flex items-center gap-4 text-[11.5px] text-neutral-600'>
            <span
              title='Comentarios: próximamente'
              className='inline-flex items-center gap-1'
            >
              <i className='ti ti-message-circle text-[14px]' /> 0
            </span>
            <span className='inline-flex items-center gap-1'>
              <i className='ti ti-users text-[14px]' />
              {p.maximo_integrantes ? `${cupos > 0 ? cupos : 0}/${p.maximo_integrantes} cupos` : `${p.total_integrantes} integrantes`}
            </span>
            {p.integrantes?.length > 0 && (
              <div className='flex items-center'>
                {p.integrantes.slice(0, 4).map((i, idx) => {
                  const iav = avatarColor(i.usuario_id);
                  return (
                    <div
                      key={i.usuario_id}
                      title={i.nombre_usuario}
                      style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 5 - idx }}
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#1E1E24] text-[7.5px] font-bold ${iav.bg} ${iav.text}`}
                    >
                      {getInitials(i.nombre_usuario)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className='flex flex-wrap items-center gap-2'>{accionesDerecha}</div>
        </div>
      </div>
    </div>
  );
}

function ProyectoCard({ proyecto: p, esCreador, esIntegrante = false, esFavorito, yaPostulado, onToggleFavorito, onVerDetalle, onPostularClick }) {
  const puedePostular = p.estado === 'abierto' && !esCreador && !esIntegrante;

  return (
    <TarjetaProyectoBase
      proyecto={p}
      accionesDerecha={
        <>
          {puedePostular && (
            <button
              onClick={onPostularClick}
              disabled={yaPostulado}
              className='inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <i className='ti ti-send text-[13px]' />
              {yaPostulado ? 'Ya postulaste' : 'Postularme'}
            </button>
          )}
          {esIntegrante && !esCreador && (
            <span className='inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-400'>
              <i className='ti ti-circle-check text-[13px]' /> Eres integrante
            </span>
          )}
          {!puedePostular && !esCreador && !esIntegrante && (
            <span className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3.5 py-1.5 text-[12px] text-neutral-600'>
              <i className='ti ti-lock text-[13px]' /> No acepta postulaciones
            </span>
          )}
          <button
            onClick={onToggleFavorito}
            className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-1.5 text-[12px] font-medium transition ${esFavorito
              ? 'border-pink-500/40 bg-pink-500/10 text-pink-500'
              : 'border-white/[0.07] text-neutral-400 hover:text-neutral-100'
              }`}
          >
            <i className='ti ti-bookmark text-[13px]' />
            {esFavorito ? 'Guardado' : 'Guardar'}
          </button>
          <button
            onClick={onVerDetalle}
            className='inline-flex items-center gap-1.5 rounded-[10px] border border-pink-500/40 bg-pink-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-pink-500 transition hover:bg-pink-500/20'
          >
            Ver más <i className='ti ti-arrow-right text-[13px]' />
          </button>
        </>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: GUARDADOS
// ─────────────────────────────────────────────────────────────────────────────

function GuardadosTab({ usuario, favoritos, loaded, postuladosActivos, onToggleFavorito, onVerDetalle, onPostularClick, search }) {
  const filtrados = useMemo(() => {
    if (!search.trim()) return favoritos;
    const q = search.trim().toLowerCase();
    return favoritos.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [favoritos, search]);

  return (
    <div>
      {loaded && filtrados.length > 0 && (
        <div className='mb-4 text-[12.5px] text-neutral-500'>
          {search.trim()
            ? `${filtrados.length} coincidencia${filtrados.length === 1 ? '' : 's'} encontrada${filtrados.length === 1 ? '' : 's'}`
            : `${filtrados.length} proyecto${filtrados.length === 1 ? '' : 's'} guardado${filtrados.length === 1 ? '' : 's'}`}
        </div>
      )}

      {!loaded && <p className='py-10 text-center text-[13px] text-neutral-500'>Cargando…</p>}

      {loaded && filtrados.length === 0 && (
        <EmptyState
          icon='ti-bookmark'
          title='No tienes proyectos guardados'
          subtitle='Usa el botón "Guardar" en la pestaña Explorar para encontrarlos fácilmente después.'
        />
      )}

      <div className='flex flex-col gap-3'>
        {filtrados.map((p) => (
          <ProyectoCard
            key={p.id}
            proyecto={p}
            esCreador={p.creador?.id === usuario?.id}
            esFavorito
            yaPostulado={postuladosActivos.has(p.id)}
            onToggleFavorito={() => onToggleFavorito(p.id)}
            onVerDetalle={() => onVerDetalle(p)}
            onPostularClick={() => onPostularClick(p)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: MIS PROYECTOS
// ─────────────────────────────────────────────────────────────────────────────

function MisProyectosTab({ usuario, onCrear, onEditar, onVerPostulaciones, onVerIntegrantes, onVerDetalle, search }) {
  const [sub, setSub] = useState('creados');
  const [creados, setCreados] = useState([]);
  const [participa, setParticipa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [misCreados, misParticipaciones] = await Promise.all([
        listarMisProyectos(),
        listarProyectos({ integrante_id: usuario.id, limite: 50 }),
      ]);
      setCreados(misCreados.datos);
      setParticipa(misParticipaciones.datos.filter((p) => p.creador?.id !== usuario.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    window.addEventListener('inface:mis-proyectos-actualizados', cargar);
    return () => window.removeEventListener('inface:mis-proyectos-actualizados', cargar);
  }, [cargar]);

  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [avisoError, setAvisoError] = useState(null);

  function handleEliminar(proyecto) {
    setConfirmEliminar(proyecto);
  }

  async function ejecutarEliminar() {
    const proyecto = confirmEliminar;
    setConfirmEliminar(null);
    try {
      await eliminarProyecto(proyecto.id);
      cargar();
    } catch (err) {
      setAvisoError(err.message);
    }
  }

  const lista = sub === 'creados' ? creados : participa;

  const filtrados = useMemo(() => {
    if (!search.trim()) return lista;
    const q = search.trim().toLowerCase();
    return lista.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [lista, search]);

  return (
    <div>
      <div className='mb-4 flex items-center justify-between gap-2.5'>
        <div className='flex gap-1 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] p-1'>
          <button
            onClick={() => setSub('creados')}
            className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-medium transition ${sub === 'creados' ? 'bg-pink-500 text-white' : 'text-neutral-400 hover:text-neutral-100'
              }`}
          >
            Creados <span className='opacity-70'>({creados.length})</span>
          </button>
          <button
            onClick={() => setSub('participa')}
            className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-medium transition ${sub === 'participa' ? 'bg-pink-500 text-white' : 'text-neutral-400 hover:text-neutral-100'
              }`}
          >
            Participo <span className='opacity-70'>({participa.length})</span>
          </button>
        </div>
        <button
          onClick={onCrear}
          className='inline-flex flex-shrink-0 items-center gap-1.5 rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
        >
          <i className='ti ti-plus text-[14px]' /> Crear proyecto
        </button>
      </div>

      {loading && <p className='py-10 text-center text-[13px] text-neutral-500'>Cargando…</p>}

      {error && (
        <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400'>
          {error}
        </div>
      )}

      {!loading && !error && filtrados.length === 0 && sub === 'creados' && (
        <EmptyState
          icon='ti-folder-plus'
          title='Todavía no has creado proyectos'
          subtitle='Crea tu primer proyecto para encontrar compañeros con las habilidades que necesitas.'
        />
      )}

      {!loading && !error && filtrados.length === 0 && sub === 'participa' && (
        <EmptyState
          icon='ti-users'
          title='Aún no participas en otros proyectos'
          subtitle='Postúlate a proyectos en la pestaña "Explorar" para unirte a un equipo.'
        />
      )}

      {sub === 'creados' && (
        <div className='flex flex-col gap-3'>
          {filtrados.map((p) => (
            <MiProyectoCard
              key={p.id}
              proyecto={p}
              onVerDetalle={() => onVerDetalle(p)}
              onEditar={() => onEditar(p)}
              onEliminar={() => handleEliminar(p)}
              onVerPostulaciones={() => onVerPostulaciones(p)}
              onVerIntegrantes={() => onVerIntegrantes(p)}
            />
          ))}
        </div>
      )}

      {sub === 'participa' && (
        <div className='flex flex-col gap-3'>
          {filtrados.map((p) => (
            <ProyectoCard
              key={p.id}
              proyecto={p}
              esCreador={false}
              esIntegrante
              esFavorito={false}
              yaPostulado={false}
              onToggleFavorito={() => { }}
              onVerDetalle={() => onVerDetalle(p)}
              onPostularClick={() => { }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmEliminar}
        title='Eliminar proyecto'
        message={confirmEliminar ? `¿Eliminar el proyecto "${confirmEliminar.titulo}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel='Eliminar'
        danger
        onConfirm={ejecutarEliminar}
        onCancel={() => setConfirmEliminar(null)}
      />

      <ConfirmDialog
        open={!!avisoError}
        title='Ocurrió un error'
        message={avisoError || ''}
        confirmLabel='Entendido'
        danger
        soloConfirmar
        onConfirm={() => setAvisoError(null)}
      />
    </div>
  );
}

function MiProyectoCard({ proyecto: p, onVerDetalle, onEditar, onEliminar, onVerPostulaciones, onVerIntegrantes }) {
  const cupos = p.maximo_integrantes ? p.maximo_integrantes - p.total_integrantes : null;

  return (
    <TarjetaProyectoBase
      proyecto={p}
      extra={
        <div className='mb-3 flex gap-3 rounded-[10px] bg-[#2A2A32] px-3.5 py-2.5'>
          <div className='flex flex-1 items-center gap-2.5'>
            <i className='ti ti-armchair text-xl text-pink-500' />
            <div>
              <div className='text-[16px] font-bold leading-none text-neutral-100'>
                {cupos !== null ? Math.max(cupos, 0) : '∞'}
              </div>
              <div className='mt-0.5 text-[10px] text-neutral-500'>Cupos disponibles</div>
            </div>
          </div>
          <div className='flex flex-1 items-center gap-2.5'>
            <i className='ti ti-inbox text-xl text-pink-500' />
            <div>
              <div className='text-[16px] font-bold leading-none text-neutral-100'>{p.total_postulaciones}</div>
              <div className='mt-0.5 text-[10px] text-neutral-500'>Pendientes</div>
            </div>
          </div>
          <div className='flex flex-1 items-center gap-2.5'>
            <i className='ti ti-users text-xl text-pink-500' />
            <div>
              <div className='text-[16px] font-bold leading-none text-neutral-100'>{p.total_integrantes}</div>
              <div className='mt-0.5 text-[10px] text-neutral-500'>Integrantes</div>
            </div>
          </div>
        </div>
      }
      accionesDerecha={
        <>
          <button
            onClick={onVerDetalle}
            className='inline-flex items-center gap-1.5 rounded-[10px] border border-pink-500/40 bg-pink-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-pink-500 transition hover:bg-pink-500/20'
          >
            <i className='ti ti-eye text-[13px]' /> Ver más
          </button>
          <button
            onClick={onEditar}
            className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:text-neutral-100'
          >
            <i className='ti ti-pencil text-[13px]' /> Editar
          </button>
          <button
            onClick={onVerIntegrantes}
            className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:text-neutral-100'
          >
            <i className='ti ti-users text-[13px]' /> Integrantes
          </button>
          <button
            onClick={onEliminar}
            className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:border-red-500/30 hover:text-red-400'
          >
            <i className='ti ti-trash text-[13px]' /> Eliminar
          </button>
          <button
            onClick={onVerPostulaciones}
            className='inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-pink-600'
          >
            <i className='ti ti-users text-[13px]' /> Ver postulaciones
            {p.total_postulaciones > 0 && (
              <span className='rounded-full bg-white/20 px-1.5 py-px text-[10px]'>{p.total_postulaciones}</span>
            )}
          </button>
        </>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: MIS POSTULACIONES
// ─────────────────────────────────────────────────────────────────────────────

function MisPostulacionesTab({ postulaciones, loaded, onRecargar, onVerProyecto }) {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [procesando, setProcesando] = useState(null);
  const [confirmRetirar, setConfirmRetirar] = useState(null);
  const [avisoError, setAvisoError] = useState(null);

  function handleRetirar(p) {
    setConfirmRetirar(p);
  }

  async function ejecutarRetirar() {
    const p = confirmRetirar;
    setConfirmRetirar(null);
    setProcesando(p.id);
    try {
      await retirarPostulacion(p.proyecto_id, p.id);
      onRecargar();
    } catch (err) {
      setAvisoError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  const filtradas = useMemo(() => {
    if (!filtroEstado) return postulaciones;
    return postulaciones.filter((p) => p.estado === filtroEstado);
  }, [postulaciones, filtroEstado]);

  return (
    <div>
      <div className='mb-5 flex items-center justify-between gap-2.5'>
        <span className='text-[12.5px] text-neutral-500'>
          {filtradas.length} postulaci{filtradas.length === 1 ? 'ón' : 'ones'}
        </span>
        <FilterDropdown
          label='Estado'
          sections={[
            {
              selected: filtroEstado,
              onSelect: setFiltroEstado,
              options: [
                { value: '', label: 'Todas' },
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'aceptada', label: 'Aceptada' },
                { value: 'rechazada', label: 'Rechazada' },
              ],
            },
          ]}
        />
      </div>

      {!loaded && <p className='py-10 text-center text-[13px] text-neutral-500'>Cargando…</p>}

      {loaded && filtradas.length === 0 && (
        <EmptyState
          icon='ti-inbox'
          title='No tienes postulaciones'
          subtitle='Explora proyectos en la pestaña "Explorar" y postúlate a los que te interesen.'
        />
      )}

      <div className='flex flex-col gap-3'>
        {filtradas.map((p) => {
          const { icono, clase, titulo } =
            p.estado === 'aceptada'
              ? { icono: 'ti-circle-check', clase: 'bg-emerald-400/10 text-emerald-400', titulo: 'Aceptada' }
              : p.estado === 'rechazada'
                ? { icono: 'ti-x', clase: 'bg-red-500/10 text-red-400', titulo: 'Rechazada' }
                : { icono: 'ti-clock', clase: 'bg-amber-400/10 text-amber-400', titulo: 'Pendiente' };

          return (
            <div
              key={p.id}
              className='flex overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24] transition hover:border-white/[0.12]'
            >
              <div className='flex w-[54px] flex-shrink-0 flex-col items-center gap-2 border-r border-white/[0.06] bg-white/[0.015] py-4'>
                <div
                  title={titulo}
                  className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${clase}`}
                >
                  <i className={`ti ${icono} text-[17px]`} />
                </div>
              </div>

              <div className='min-w-0 flex-1 p-4'>
                <div className='mb-1.5 flex items-start justify-between gap-3'>
                  <div className='text-[15px] font-bold leading-snug text-neutral-100'>{p.titulo_proyecto}</div>
                  <EstadoPostulacionChip estado={p.estado} />
                </div>

                <div className='mb-2.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-neutral-500'>
                  {p.creador && (
                    <>
                      <Link
                        to={`/perfil/usuario/${p.creador.nombre_usuario}`}
                        className='font-semibold text-neutral-300 transition hover:text-pink-400 hover:underline'
                      >
                        u/{p.creador.nombre_usuario}
                      </Link>
                      {p.creador.carrera && <span>· {p.creador.carrera.nombre}</span>}
                      <span>·</span>
                    </>
                  )}
                  <span>Postulé {tiempoRelativo(p.fecha_postulacion)}</span>
                </div>

                <StatusBanner postulacion={p} />

                {p.mensaje && (
                  <p className='mt-2.5 text-[12.5px] leading-relaxed text-neutral-400'>{p.mensaje}</p>
                )}

                <div className='mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3'>
                  <button
                    onClick={() => onVerProyecto(p.proyecto_id)}
                    className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:text-neutral-100'
                  >
                    <i className='ti ti-eye text-[13px]' /> Ver proyecto
                  </button>
                  {p.estado === 'pendiente' && (
                    <button
                      onClick={() => handleRetirar(p)}
                      disabled={procesando === p.id}
                      className='inline-flex items-center gap-1.5 rounded-[10px] border border-red-500/25 px-3.5 py-1.5 text-[12px] font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50'
                    >
                      <i className='ti ti-x text-[13px]' /> Retirar postulación
                    </button>
                  )}
                  {(p.estado === 'aceptada' || p.estado === 'rechazada') && (
                    <button
                      onClick={() => handleRetirar(p)}
                      disabled={procesando === p.id}
                      className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:text-red-400 disabled:opacity-50'
                    >
                      <i className='ti ti-trash text-[13px]' /> Quitar de la lista
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmRetirar}
        title={confirmRetirar?.estado === 'pendiente' ? 'Retirar postulación' : 'Quitar de la lista'}
        message={
          confirmRetirar?.estado === 'pendiente'
            ? '¿Retirar esta postulación?'
            : '¿Quitar esta postulación de tu lista?'
        }
        confirmLabel={confirmRetirar?.estado === 'pendiente' ? 'Retirar' : 'Quitar'}
        danger
        onConfirm={ejecutarRetirar}
        onCancel={() => setConfirmRetirar(null)}
      />

      <ConfirmDialog
        open={!!avisoError}
        title='Ocurrió un error'
        message={avisoError || ''}
        confirmLabel='Entendido'
        danger
        soloConfirmar
        onConfirm={() => setAvisoError(null)}
      />
    </div>
  );
}

function StatusBanner({ postulacion: p }) {
  if (p.estado === 'pendiente') {
    return (
      <div className='flex items-center gap-2.5 rounded-[10px] bg-[#2A2A32] px-3 py-2'>
        <i className='ti ti-clock text-amber-400' />
        <div>
          <div className='text-[12.5px] font-semibold text-neutral-100'>Esperando revisión del creador</div>
          <div className='mt-0.5 text-[11px] text-neutral-500'>
            Tu postulación fue enviada el {formatFecha(p.fecha_postulacion)}
          </div>
        </div>
      </div>
    );
  }
  if (p.estado === 'aceptada') {
    return (
      <div className='flex items-center gap-2.5 rounded-[10px] bg-emerald-400/[0.08] px-3 py-2'>
        <i className='ti ti-circle-check text-emerald-400' />
        <div>
          <div className='text-[12.5px] font-semibold text-emerald-400'>¡Postulación aceptada!</div>
          <div className='mt-0.5 text-[11px] text-neutral-500'>Ya eres parte del equipo.</div>
        </div>
      </div>
    );
  }
  return (
    <div className='flex items-center gap-2.5 rounded-[10px] bg-red-500/[0.06] px-3 py-2'>
      <i className='ti ti-x text-red-400' />
      <div>
        <div className='text-[12.5px] font-semibold text-red-400'>Postulación no seleccionada</div>
        <div className='mt-0.5 text-[11px] text-neutral-500'>Puedes explorar otros proyectos.</div>
      </div>
    </div>
  );
}