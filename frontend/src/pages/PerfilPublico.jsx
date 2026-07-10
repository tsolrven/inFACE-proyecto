import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    obtenerPerfilPublico
} from '../services/perfil';
import { listarProyectos } from '../services/matchingProyecto';
import { getInitials, avatarColor, etiquetaColor } from '../helpers/matchHelpers';
import PerfilTabs from '../components/PerfilTabs'
// TODO(Silvana): importar aquí su servicio, ej:
// import { listarApuntesDeUsuario, listarRespuestasDeUsuario } from '../services/apunte';;

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatMesAnio(fecha) {
    if (!fecha) return null;
    const d = new Date(fecha);
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PerfilPublico() {
    const { nombreUsuario } = useParams();
    const navigate = useNavigate();
    const usuarioSesion = useAuthStore((s) => s.usuario);

    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [proyectosCreados, setProyectosCreados] = useState([]);
    const [proyectosParticipa, setProyectosParticipa] = useState([]);
    // TODO(Silvana): volver a agregar acá, ej:
    // const [apuntes, setApuntes] = useState([]);
    // const [respuestas, setRespuestas] = useState([]);
    const [cargandoTabs, setCargandoTabs] = useState(true);

    useEffect(() => {
        // si es el propio usuario, se manda directo a /perfil (versión editable)
        if (usuarioSesion?.nombre_usuario === nombreUsuario) {
            navigate('/perfil', { replace: true });
            return;
        }

        let activo = true;
        setCargando(true);
        setError(null);

        obtenerPerfilPublico(nombreUsuario)
            .then((data) => {
                if (!activo) return;
                setPerfil(data);
            })
            .catch((err) => {
                if (!activo) return;
                setError(err.message);
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nombreUsuario]);

    useEffect(() => {
        if (!perfil?.id) return;
        let activo = true;
        setCargandoTabs(true);

        Promise.allSettled([
            listarProyectos({ creador_id: perfil.id, limite: 50 }),
            listarProyectos({ integrante_id: perfil.id, limite: 50 }),
            // TODO(Silvana): agregar tus promesas, ej:
            // listarApuntesDeUsuario(nombreUsuario),
            // listarRespuestasDeUsuario(nombreUsuario),

        ]).then(([creados, participa /* TODO(Dilvana): agregar misApuntes, misRespuestas */]) => {
            if (!activo) return;
            setProyectosCreados(creados.status === 'fulfilled' ? creados.value.datos : []);
            setProyectosParticipa(
                participa.status === 'fulfilled'
                    ? participa.value.datos.filter((p) => p.creador?.id !== perfil.id)
                    : [],
            );
            // TODO(Silvana): agregar tus setters, ej:
            // setApuntes(misApuntes.status === 'fulfilled' ? misApuntes.value : []);
            // setRespuestas(misRespuestas.status === 'fulfilled' ? misRespuestas.value : []);
            setCargandoTabs(false);
        });

        return () => {
            activo = false;
        };
    }, [perfil?.id, nombreUsuario]);

    if (cargando) {
        return <p className='py-16 text-center text-[13px] text-neutral-500'>Cargando perfil…</p>;
    }

    if (error || !perfil) {
        return (
            <div className='mx-auto mt-10 max-w-md rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-400'>
                No se pudo cargar este perfil{error ? `: ${error}` : ''}.
            </div>
        );
    }

    const av = avatarColor(perfil.id);
    const nombreVisible = perfil.nombre_completo || perfil.nombre_usuario;

    return (
        <div>
            {/* BANNER */}
            <div
                className='relative h-[190px] overflow-hidden'
                style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 70%,#1a1a2e 100%)' }}
            >
                <div
                    className='pointer-events-none absolute inset-0'
                    style={{
                        background:
                            'radial-gradient(ellipse 60% 80% at 70% 50%, rgba(232,84,106,.18) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 30%, rgba(99,102,241,.15) 0%, transparent 60%), radial-gradient(ellipse 30% 50% at 85% 20%, rgba(52,211,153,.10) 0%, transparent 60%)',
                    }}
                />
                <button
                    onClick={() => navigate(-1)}
                    className='absolute left-3 top-3 flex items-center gap-1.5 rounded-[10px] border border-white/[0.15] bg-black/45 px-3 py-1.5 text-[11.5px] font-medium text-white/80 backdrop-blur transition hover:bg-black/65 hover:text-white'
                >
                    <i className='ti ti-arrow-left text-[14px]' /> Volver
                </button>
            </div>

            {/* AVATAR (sin acciones de edición: es de solo lectura) */}
            <div className='relative z-10 -mt-11 flex items-end gap-4 px-[28px]'>
                <div className='relative flex-shrink-0'>
                    <div
                        className={`flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-neutral-950 text-[28px] font-bold ${av.bg} ${av.text}`}
                    >
                        {getInitials(nombreVisible)}
                    </div>
                </div>
            </div>

            {/* INFO */}
            <div className='px-[28px] pb-10 pt-3.5'>
                <div className='text-[20px] font-bold tracking-tight text-neutral-100'>{nombreVisible}</div>
                <div className='mt-px text-[13px] text-neutral-500'>u/{perfil.nombre_usuario}</div>

                {perfil.biografia && (
                    <p className='mt-2.5 max-w-xl text-[13px] leading-relaxed text-neutral-400'>
                        {perfil.biografia}
                    </p>
                )}

                <div className='mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5'>
                    {perfil.creado_en && (
                        <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                            <i className='ti ti-calendar text-[14px]' /> Se unió en{' '}
                            <strong className='font-medium text-neutral-400'>{formatMesAnio(perfil.creado_en)}</strong>
                        </span>
                    )}
                    {perfil.campus && (
                        <span className='inline-flex items-center gap-1.5 text-[12px] text-neutral-500'>
                            <i className='ti ti-map-pin text-[14px]' /> {perfil.campus}
                        </span>
                    )}
                    <span className='inline-flex items-center gap-1.5 text-[12px] capitalize text-neutral-500'>
                        <i className='ti ti-id-badge-2 text-[14px]' /> {perfil.rol}
                    </span>
                </div>

                {/* ESTADÍSTICAS */}
                <div className='mt-3.5 flex max-w-xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1E24]'>
                    <div className='flex-1 border-r border-white/[0.07] px-4 py-3 text-center'>
                        <div className='text-[18px] font-bold text-neutral-100'>{perfil.stats.proyectos_creados}</div>
                        <div className='mt-0.5 text-[10.5px] font-medium tracking-wide text-neutral-600'>
                            Proyectos creados
                        </div>
                    </div>
                    <div className='flex-1 px-4 py-3 text-center'>
                        <div className='text-[18px] font-bold text-pink-500'>{perfil.intereses.length}</div>
                        <div className='mt-0.5 text-[10.5px] font-medium tracking-wide text-neutral-600'>
                            Intereses
                        </div>
                    </div>
                </div>

                {/* INTERESES */}
                {perfil.intereses.length > 0 && (
                    <div className='mt-4 max-w-xl rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-[18px]'>
                        <h2 className='mb-3 flex items-center gap-1.5 text-[13px] font-bold text-neutral-100'>
                            <i className='ti ti-tag text-[15px] text-pink-500' /> Intereses
                        </h2>
                        <div className='flex flex-wrap gap-1.5'>
                            {perfil.intereses.map((et) => {
                                const c = etiquetaColor(et.nombre);
                                return (
                                    <span
                                        key={et.id}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}
                                    >
                                        {et.nombre}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PESTAÑAS: conexión con los demás módulos */}
                <PerfilTabs
                    proyectosCreados={proyectosCreados}
                    proyectosParticipa={proyectosParticipa}
                    cargando={cargandoTabs}
                />
            </div>
        </div>
    );
}
