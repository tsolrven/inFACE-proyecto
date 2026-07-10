import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  getInitials,
  avatarColor,
  etiquetaColor,
  EstadoChip,
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

const TABS = [
  { id: 'descubrir', label: 'Descubrir', icon: 'ti-flame' },
  { id: 'explorar', label: 'Explorar', icon: 'ti-compass' },
  { id: 'mis', label: 'Mis proyectos', icon: 'ti-folder' },
  { id: 'postulaciones', label: 'Mis postulaciones', icon: 'ti-inbox' },
  { id: 'guardados', label: 'Guardados', icon: 'ti-bookmark' },
];

export default function MatchProyectos() {
  const usuario = useAuthStore((s) => s.usuario);
  //const [tab, setTab] = useState('explorar');
  const [tab, setTab] = useState('descubrir');

  // datos globales usados por varias pestañas
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosLoaded, setFavoritosLoaded] = useState(false);
  const [misPostulaciones, setMisPostulaciones] = useState([]);
  const [misPostulacionesLoaded, setMisPostulacionesLoaded] = useState(false);

  const [modalCrear, setModalCrear] = useState(null);
  const [proyectoDetalle, setProyectoDetalle] = useState(null);
  const [modalPostular, setModalPostular] = useState(null);
  const [modalPostulaciones, setModalPostulaciones] = useState(null);
  const [modalIntegrantes, setModalIntegrantes] = useState(null);

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
      if (p.estado === 'pendiente' || p.estado === 'aceptada') set.add(p.proyecto_id);
    });
    return set;
  }, [misPostulaciones]);

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

  async function handleVerDetalle(proyecto) {
    setProyectoDetalle(proyecto);
  }

  async function handleVerDetallePorId(proyectoId) {
    try {
      const p = await obtenerProyecto(proyectoId);
      setProyectoDetalle(p);
    } catch {
      // ignorar
    }
  }

  return (
    <div>
      {/* BANNER */}
      <div
        className='relative flex h-[110px] items-end overflow-hidden px-[26px] pb-[18px]'
        style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f1a35,#1a0a20)' }}
      >
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(ellipse 50% 100% at 80% 50%, rgba(232,84,106,.2) 0%, transparent 70%), radial-gradient(ellipse 30% 80% at 20% 50%, rgba(167,139,250,.15) 0%, transparent 60%)',
          }}
        />
        <div className='relative z-[1]'>
          <div className='mb-1 text-[10px] font-bold uppercase tracking-widest text-pink-500'>
            Módulo Cultural
          </div>
          <div className='text-[20px] font-bold tracking-tight text-white'>🧩 Match de proyectos</div>
        </div>
      </div>

      {/* TABS */}
      {!proyectoDetalle && (
        <div className='sticky top-0 z-10 flex items-center overflow-x-auto border-b border-white/[0.07] bg-[#17171B] px-[26px]'>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-medium transition ${tab === t.id
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

      <div className='px-[26px] pb-10 pt-[22px]'>
        {proyectoDetalle ? (
          <DetalleProyecto
            proyecto={proyectoDetalle}
            esCreador={proyectoDetalle.creador?.id === usuario?.id}
            esIntegrante={proyectoDetalle.integrantes?.some((i) => i.usuario_id === usuario?.id)}
            yaPostulado={postuladosActivos.has(proyectoDetalle.id)}
            puedePostular={proyectoDetalle.estado === 'abierto'}
            onVolver={() => setProyectoDetalle(null)}
            onPostular={handlePostular}
          />
        ) : (
          <>
            {tab === 'descubrir' && (
              <DescubrirTab
                usuario={usuario}
                favoritosIds={favoritosIds}
                postuladosActivos={postuladosActivos}
                onToggleFavorito={handleToggleFavorito}
                onVerDetalle={handleVerDetalle}
                onPostularClick={setModalPostular}
                onIrExplorar={() => setTab('explorar')}
              />
            )}
            {tab === 'explorar' && (
              <ExplorarTab
                usuario={usuario}
                favoritosIds={favoritosIds}
                postuladosActivos={postuladosActivos}
                onToggleFavorito={handleToggleFavorito}
                onVerDetalle={handleVerDetalle}
                onPostularClick={setModalPostular}
              />
            )}
            {tab === 'guardados' && (
              <GuardadosTab
                usuario={usuario}
                favoritos={favoritos}
                loaded={favoritosLoaded}
                postuladosActivos={postuladosActivos}
                onToggleFavorito={handleToggleFavorito}
                onVerDetalle={handleVerDetalle}
                onPostularClick={setModalPostular}
              />
            )}
            {tab === 'mis' && (
              <MisProyectosTab
                usuario={usuario}
                onCrear={() => setModalCrear('crear')}
                onEditar={(p) => setModalCrear(p)}
                onVerPostulaciones={(p) => setModalPostulaciones(p)}
                onVerIntegrantes={(p) => setModalIntegrantes(p)}
              />
            )}
            {tab === 'postulaciones' && (
              <MisPostulacionesTab
                postulaciones={misPostulaciones}
                loaded={misPostulacionesLoaded}
                onRecargar={recargarMisPostulaciones}
                onVerProyecto={handleVerDetallePorId}
              />
            )}
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
          onClose={() => setModalPostulaciones(null)}
          onCambio={() => window.dispatchEvent(new Event('inface:mis-proyectos-actualizados'))}
        />
      )}

      {modalIntegrantes && (
        <IntegrantesModal
          proyecto={modalIntegrantes}
          esCreador={modalIntegrantes.creador?.id === usuario?.id}
          onClose={() => setModalIntegrantes(null)}
          onCambio={() => window.dispatchEvent(new Event('inface:mis-proyectos-actualizados'))}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILA DE BÚSQUEDA + FILTROS (compartida entre pestañas)
// ─────────────────────────────────────────────────────────────────────────────

function SearchRow({ placeholder, value, onChange, children }) {
  return (
    <div className='mb-4 flex gap-2.5'>
      <div className='flex h-[38px] flex-1 items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5'>
        <i className='ti ti-search text-[15px] text-neutral-600' />
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className='w-full flex-1 bg-transparent text-[13px] text-neutral-100 outline-none placeholder:text-neutral-600'
        />
      </div>
      {children}
    </div>
  );
}

function FilterDropdown({ label, icon = 'ti-adjustments-horizontal', sections }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div
      className='relative flex-shrink-0'
      ref={ref}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className='flex h-[38px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
      >
        <i className={`ti ${icon} text-[14px]`} />
        {label}
        <i className='ti ti-chevron-down text-[13px]' />
      </button>
      {open && (
        <div className='absolute right-0 top-[calc(100%+6px)] z-[100] w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]'>
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
        </div>
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

function ExplorarTab({ usuario, favoritosIds, postuladosActivos, onToggleFavorito, onVerDetalle, onPostularClick }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [orden, setOrden] = useState('recientes');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarProyectos({
        estado: filtroEstado || undefined,
        modalidad: filtroModalidad || undefined,
        limite: 60,
      });
      setProyectos(data.datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroModalidad]);

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
      <SearchRow
        placeholder='Buscar proyectos por nombre, habilidad o descripción...'
        value={search}
        onChange={setSearch}
      >
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
      </SearchRow>

      {loading && <p className='py-10 text-center text-[13px] text-neutral-500'>Cargando proyectos…</p>}

      {error && (
        <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400'>
          No se pudieron cargar los proyectos: {error}
        </div>
      )}

      {!loading && !error && proyectosFiltrados.length === 0 && (
        <EmptyState
          icon='ti-mood-empty'
          title='No hay proyectos que coincidan'
          subtitle='Prueba con otros términos de búsqueda o cambia los filtros aplicados.'
        />
      )}

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
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

function ProyectoCard({ proyecto: p, esCreador, esFavorito, yaPostulado, onToggleFavorito, onVerDetalle, onPostularClick }) {
  const av = avatarColor(p.creador?.id);
  const cupos = p.maximo_integrantes ? p.maximo_integrantes - p.total_integrantes : null;
  const puedePostular = p.estado === 'abierto' && !esCreador;

  return (
    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24] transition hover:border-white/[0.12]'>
      <div className='h-1' style={{ background: barGradient(p.estado) }} />
      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2.5 flex items-start justify-between gap-3'>
          <div className='flex-1'>
            <div className='mb-1.5 text-[14px] font-bold leading-snug text-neutral-100'>{p.titulo}</div>
            <div className='flex flex-wrap gap-1.5'>
              <EstadoChip estado={p.estado} />
              <ModalidadChip modalidad={p.modalidad} />
            </div>
          </div>
        </div>

        <p className='mb-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-neutral-400'>
          {p.descripcion}
        </p>

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

        <Link
          to={`/perfil/usuario/${p.creador?.nombre_usuario}`}
          className='mb-2.5 flex items-center gap-2 transition hover:opacity-80'
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${av.bg} ${av.text}`}
          >
            {getInitials(p.creador?.nombre_usuario)}
          </div>
          <div className='text-[12px] text-neutral-400'>
            <strong className='text-neutral-100'>{p.creador?.nombre_usuario}</strong>
          </div>
        </Link>

        <div className='mb-3 flex items-center gap-1.5 text-[11.5px] text-neutral-600'>
          <i className='ti ti-users text-[13px]' />
          {p.maximo_integrantes ? (
            <span>
              <strong className='text-neutral-400'>{cupos > 0 ? cupos : 0} cupos</strong> disponibles de{' '}
              {p.maximo_integrantes}
            </span>
          ) : (
            <span>{p.total_integrantes} integrantes</span>
          )}
        </div>

        <div className='mt-auto flex gap-2 border-t border-white/[0.07] pt-3'>
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
          {!puedePostular && !esCreador && (
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
            <i className={`ti ${esFavorito ? 'ti-bookmark-filled' : 'ti-bookmark'} text-[13px]`} />
            {esFavorito ? 'Guardado' : 'Guardar'}
          </button>
          <button
            onClick={onVerDetalle}
            className='ml-auto inline-flex items-center gap-1.5 rounded-[10px] border border-pink-500/40 bg-pink-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-pink-500 transition hover:bg-pink-500/20'
          >
            Ver más <i className='ti ti-arrow-right text-[13px]' />
          </button>
        </div>
      </div>
    </div>
  );
}

function barGradient(estado) {
  if (estado === 'abierto') return 'linear-gradient(90deg,#34D399,#059669)';
  if (estado === 'en_progreso') return 'linear-gradient(90deg,#60A5FA,#2563AB)';
  return 'linear-gradient(90deg,#6B7280,#4B5563)';
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: GUARDADOS
// ─────────────────────────────────────────────────────────────────────────────

function GuardadosTab({ usuario, favoritos, loaded, postuladosActivos, onToggleFavorito, onVerDetalle, onPostularClick }) {
  const [search, setSearch] = useState('');

  const filtrados = useMemo(() => {
    if (!search.trim()) return favoritos;
    const q = search.trim().toLowerCase();
    return favoritos.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [favoritos, search]);

  return (
    <div>
      <SearchRow
        placeholder='Buscar en tus proyectos guardados...'
        value={search}
        onChange={setSearch}
      />

      {!loaded && <p className='py-10 text-center text-[13px] text-neutral-500'>Cargando…</p>}

      {loaded && filtrados.length === 0 && (
        <EmptyState
          icon='ti-bookmark'
          title='No tienes proyectos guardados'
          subtitle='Usa el botón "Guardar" en la pestaña Explorar para encontrarlos fácilmente después.'
        />
      )}

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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: MIS PROYECTOS
// ─────────────────────────────────────────────────────────────────────────────

function MisProyectosTab({ usuario, onCrear, onEditar, onVerPostulaciones, onVerIntegrantes }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const cargar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarMisProyectos();
      setProyectos(data.datos);
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

  async function handleEliminar(proyecto) {
    if (!confirm(`¿Eliminar el proyecto "${proyecto.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarProyecto(proyecto.id);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtrados = useMemo(() => {
    if (!search.trim()) return proyectos;
    const q = search.trim().toLowerCase();
    return proyectos.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [proyectos, search]);

  return (
    <div>
      <div className='mb-5 flex gap-2.5'>
        <div className='flex h-[38px] flex-1 items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5'>
          <i className='ti ti-search text-[15px] text-neutral-600' />
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Buscar en mis proyectos...'
            className='w-full flex-1 bg-transparent text-[13px] text-neutral-100 outline-none placeholder:text-neutral-600'
          />
        </div>
        <button
          onClick={onCrear}
          className='inline-flex flex-shrink-0 items-center gap-1.5 rounded-[10px] bg-pink-500 px-4 text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
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

      {!loading && !error && filtrados.length === 0 && (
        <EmptyState
          icon='ti-folder-plus'
          title='Todavía no has creado proyectos'
          subtitle='Crea tu primer proyecto para encontrar compañeros con las habilidades que necesitas.'
        />
      )}

      {filtrados.map((p) => (
        <MiProyectoCard
          key={p.id}
          proyecto={p}
          onEditar={() => onEditar(p)}
          onEliminar={() => handleEliminar(p)}
          onVerPostulaciones={() => onVerPostulaciones(p)}
          onVerIntegrantes={() => onVerIntegrantes(p)}
        />
      ))}
    </div>
  );
}

function MiProyectoCard({ proyecto: p, onEditar, onEliminar, onVerPostulaciones, onVerIntegrantes }) {
  const cupos = p.maximo_integrantes ? p.maximo_integrantes - p.total_integrantes : null;

  return (
    <div className='mb-3 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-[18px]'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div>
          <div className='mb-1.5 text-[14px] font-bold text-neutral-100'>{p.titulo}</div>
          <div className='flex flex-wrap gap-1.5'>
            <EstadoChip estado={p.estado} />
            <ModalidadChip modalidad={p.modalidad} />
            {p.etiquetas?.slice(0, 3).map((et) => (
              <span
                key={et.id}
                className='rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-neutral-500'
              >
                {et.nombre}
              </span>
            ))}
          </div>
        </div>
        <span className='flex-shrink-0 whitespace-nowrap text-[11px] text-neutral-600'>
          Creado {formatFecha(p.fecha_creacion)}
        </span>
      </div>

      <p className='mb-3 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400'>{p.descripcion}</p>

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
            <div className='mt-0.5 text-[10px] text-neutral-500'>Postulaciones</div>
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

      <div className='flex flex-wrap gap-2 border-t border-white/[0.07] pt-3'>
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
          className='ml-auto inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-pink-600'
        >
          <i className='ti ti-users text-[13px]' /> Ver postulaciones
          {p.total_postulaciones > 0 && (
            <span className='rounded-full bg-white/20 px-1.5 py-px text-[10px]'>{p.total_postulaciones}</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTAÑA: MIS POSTULACIONES
// ─────────────────────────────────────────────────────────────────────────────

function MisPostulacionesTab({ postulaciones, loaded, onRecargar, onVerProyecto }) {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [procesando, setProcesando] = useState(null);

  async function handleRetirar(p) {
    if (!confirm('¿Retirar esta postulación?')) return;
    setProcesando(p.id);
    try {
      await retirarPostulacion(p.proyecto_id, p.id);
      onRecargar();
    } catch (err) {
      alert(err.message);
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
      <div className='mb-5 flex gap-2.5'>
        <div className='flex-1' />
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

      {filtradas.map((p) => (
        <div
          key={p.id}
          className='mb-3 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-[18px]'
        >
          <div className='mb-2 flex items-start justify-between gap-3'>
            <div className='text-[14px] font-bold text-neutral-100'>{p.titulo_proyecto}</div>
            <EstadoPostulacionChip estado={p.estado} />
          </div>

          <div className='mb-2.5 flex items-center gap-2 text-[12px] text-neutral-500'>
            {p.creador && (
              <>
                Creado por <strong className='text-neutral-300'>{p.creador.nombre_usuario}</strong> ·{' '}
              </>
            )}
            Postulé {tiempoRelativo(p.fecha_postulacion)}
          </div>

          <StatusBanner postulacion={p} />

          {p.mensaje && (
            <p className='mt-2.5 text-[12.5px] leading-relaxed text-neutral-400'>{p.mensaje}</p>
          )}

          <div className='mt-3 flex gap-2 border-t border-white/[0.07] pt-3'>
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
          </div>
        </div>
      ))}
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