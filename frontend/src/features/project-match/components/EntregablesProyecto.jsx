import { useEffect, useState } from 'react';
import Modal, { ModalHeader, ModalBody } from '@/shared/components/ui/Modal';
import { apiFetch } from '@/shared/api/client';
import { guardarEntregables } from '@/features/project-match/api/matchingProyecto.api';
import {
    descargarArchivo,
    sincronizarArchivos,
} from '@/shared/api/archivos.api';
import { mostrarToast } from '@/shared/stores/toastStore';

const MAX_PDF_MB = 20;
const HOSTS_YOUTUBE = [
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
];
const HOSTS_GITHUB = ['github.com', 'www.github.com'];

const esHostLinkedin = (host) =>
    host === 'linkedin.com' || host.endsWith('.linkedin.com');

function parsearUrlWeb(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
    } catch {
        return null;
    }
}

const esLinkYoutube = (texto) => {
    const url = parsearUrlWeb(texto);
    return Boolean(url && HOSTS_YOUTUBE.includes(url.hostname.toLowerCase()));
};
const esLinkGithub = (texto) => {
    const url = parsearUrlWeb(texto);
    return Boolean(url && HOSTS_GITHUB.includes(url.hostname.toLowerCase()));
};
const esLinkLinkedin = (texto) => {
    const url = parsearUrlWeb(texto);
    return Boolean(url && esHostLinkedin(url.hostname.toLowerCase()));
};

function idYoutube(texto) {
    const url = parsearUrlWeb(texto);
    if (!url) return null;
    const host = url.hostname.toLowerCase();
    let id = null;
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (HOSTS_YOUTUBE.includes(host)) {
        id = url.searchParams.get('v');
        if (!id) {
            const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
            id = m?.[1] ?? null;
        }
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
}

function nombreRepositorio(texto) {
    const url = parsearUrlWeb(texto);
    if (!url) return texto;
    const partes = url.pathname.split('/').filter(Boolean).slice(0, 2);
    return partes.length > 0 ? partes.join('/') : 'github.com';
}

function nombreLinkedin(texto) {
    const url = parsearUrlWeb(texto);
    if (!url) return texto;
    const ruta = url.pathname.replace(/\/+$/, '').replace(/^\//, '');
    return ruta || 'linkedin.com';
}

function formatearTamanio(bytes) {
    if (!bytes) return '';
    return bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CLASE_TARJETA =
    'group flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-[#232329] p-3 text-left transition hover:-translate-y-px hover:border-pink-500/30 hover:bg-[#26262d]';

function IconoTarjeta({ icono, clase }) {
    return (
        <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[11px] ${clase}`}
        >
            <i className={`ti ${icono} text-[22px]`} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sección "Trabajo final" del detalle de un proyecto CERRADO
// ─────────────────────────────────────────────────────────────────────────────
export default function EntregablesProyecto({
    proyecto,
    esCreador,
    onActualizado,
}) {
    const [editando, setEditando] = useState(false);
    const [verInforme, setVerInforme] = useState(false);
    const [miniaturaRota, setMiniaturaRota] = useState(false);
    const [reproduciendo, setReproduciendo] = useState(false);

    const videoValido = esLinkYoutube(proyecto.video_url ?? '');
    const githubValido = esLinkGithub(proyecto.github_url ?? '');
    const linkedinValido = esLinkLinkedin(proyecto.linkedin_url ?? '');
    const hayEntregables =
        Boolean(proyecto.informe) || videoValido || githubValido || linkedinValido;

    if (!hayEntregables && !esCreador) return null;

    const idVideo = videoValido ? idYoutube(proyecto.video_url) : null;

    return (
        <div className='mb-5'>
            {!hayEntregables ? (
                <button
                    type='button'
                    onClick={() => setEditando(true)}
                    className='group flex w-full items-center gap-3.5 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/[0.12] via-pink-500/[0.05] to-transparent px-4 py-3.5 text-left transition hover:border-pink-500/50'
                >
                    <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] bg-pink-500/15 text-pink-400 transition group-hover:scale-105'>
                        <i className='ti ti-trophy text-[22px]' />
                    </div>
                    <div className='min-w-0 flex-1'>
                        <div className='text-[13.5px] font-bold text-neutral-100'>
                            ¡Tu proyecto ya está cerrado!
                        </div>
                        <div className='mt-0.5 text-[12px] leading-relaxed text-neutral-400'>
                            Haz click para añadir el trabajo final: informe en PDF, video de
                            YouTube, GitHub o LinkedIn.
                        </div>
                    </div>
                    <i className='ti ti-arrow-right text-[18px] text-pink-400 transition group-hover:translate-x-0.5' />
                </button>
            ) : (
                <div className='overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-pink-500/[0.06] via-transparent to-transparent'>
                    <div className='flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3'>
                        <div className='flex items-center gap-2.5'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-[10px] bg-pink-500/15 text-pink-400'>
                                <i className='ti ti-trophy text-[17px]' />
                            </div>
                            <div>
                                <div className='text-[13.5px] font-bold leading-tight text-neutral-100'>
                                    Trabajo final
                                </div>
                                <div className='text-[11px] text-neutral-500'>
                                    Lo que logró el equipo
                                </div>
                            </div>
                        </div>
                        {esCreador && (
                            <button
                                type='button'
                                onClick={() => setEditando(true)}
                                className='inline-flex items-center gap-1.5 rounded-[10px] border border-pink-500/40 bg-pink-500/10 px-3 py-1.5 text-[12px] font-semibold text-pink-500 transition hover:bg-pink-500/20'
                            >
                                <i className='ti ti-pencil text-[13px]' /> Editar
                            </button>
                        )}
                    </div>

                    <div className='grid gap-3 p-4 sm:grid-cols-2'>
                        {videoValido && (
                            <div className='overflow-hidden rounded-xl border border-white/[0.07] bg-[#232329] sm:col-span-2'>
                                {idVideo && reproduciendo ? (
                                    <div className='aspect-video w-full bg-black'>
                                        <iframe
                                            src={`https://www.youtube-nocookie.com/embed/${idVideo}?autoplay=1&rel=0`}
                                            title='Video de presentación'
                                            allow='autoplay; encrypted-media; picture-in-picture; fullscreen'
                                            allowFullScreen
                                            referrerPolicy='strict-origin-when-cross-origin'
                                            className='h-full w-full'
                                        />
                                    </div>
                                ) : idVideo ? (
                                    <button
                                        type='button'
                                        onClick={() => setReproduciendo(true)}
                                        aria-label='Reproducir el video de presentación'
                                        className='group relative block aspect-video w-full overflow-hidden bg-black'
                                    >
                                        {!miniaturaRota && (
                                            <img
                                                src={`https://i.ytimg.com/vi/${idVideo}/hqdefault.jpg`}
                                                alt='Miniatura del video de presentación'
                                                loading='lazy'
                                                referrerPolicy='no-referrer'
                                                onError={() => setMiniaturaRota(true)}
                                                className='h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100'
                                            />
                                        )}
                                        <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent'>
                                            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition group-hover:scale-110'>
                                                <i className='ti ti-player-play-filled text-[26px]' />
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className='h-20 w-full bg-gradient-to-br from-red-500/20 to-transparent' />
                                )}
                                <div className='flex items-center gap-2 px-3.5 py-2.5'>
                                    <i className='ti ti-brand-youtube text-[18px] text-red-400' />
                                    <span className='text-[12.5px] font-semibold text-neutral-100'>
                                        Video de presentación
                                    </span>
                                    <a
                                        href={proyecto.video_url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='ml-auto inline-flex items-center gap-1 text-[11.5px] font-medium text-neutral-500 transition hover:text-pink-400'
                                    >
                                        Abrir en YouTube{' '}
                                        <i className='ti ti-external-link text-[13px]' />
                                    </a>
                                </div>
                            </div>
                        )}

                        {proyecto.informe && (
                            <button
                                type='button'
                                onClick={() => setVerInforme(true)}
                                className={CLASE_TARJETA}
                            >
                                <IconoTarjeta
                                    icono='ti-file-type-pdf'
                                    clase='bg-red-500/12 text-red-400'
                                />
                                <div className='min-w-0 flex-1'>
                                    <div className='text-[12.5px] font-semibold text-neutral-100'>
                                        Informe final
                                    </div>
                                    <div className='truncate text-[11.5px] text-neutral-500'>
                                        {proyecto.informe.nombre_archivo}
                                        {proyecto.informe.tamanio
                                            ? ` · ${formatearTamanio(proyecto.informe.tamanio)}`
                                            : ''}
                                    </div>
                                </div>
                                <span className='flex flex-shrink-0 items-center gap-1 text-[11.5px] font-semibold text-pink-400'>
                                    <i className='ti ti-eye text-[14px]' /> Ver
                                </span>
                            </button>
                        )}

                        {githubValido && (
                            <a
                                href={proyecto.github_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={CLASE_TARJETA}
                            >
                                <IconoTarjeta
                                    icono='ti-brand-github'
                                    clase='bg-white/[0.08] text-neutral-200'
                                />
                                <div className='min-w-0 flex-1'>
                                    <div className='text-[12.5px] font-semibold text-neutral-100'>
                                        Repositorio
                                    </div>
                                    <div className='truncate text-[11.5px] text-neutral-500'>
                                        {nombreRepositorio(proyecto.github_url)}
                                    </div>
                                </div>
                                <i className='ti ti-external-link flex-shrink-0 text-[14px] text-neutral-600 transition group-hover:text-pink-400' />
                            </a>
                        )}

                        {linkedinValido && (
                            <a
                                href={proyecto.linkedin_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={CLASE_TARJETA}
                            >
                                <IconoTarjeta
                                    icono='ti-brand-linkedin'
                                    clase='bg-sky-500/12 text-sky-400'
                                />
                                <div className='min-w-0 flex-1'>
                                    <div className='text-[12.5px] font-semibold text-neutral-100'>
                                        LinkedIn
                                    </div>
                                    <div className='truncate text-[11.5px] text-neutral-500'>
                                        {nombreLinkedin(proyecto.linkedin_url)}
                                    </div>
                                </div>
                                <i className='ti ti-external-link flex-shrink-0 text-[14px] text-neutral-600 transition group-hover:text-pink-400' />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {verInforme && proyecto.informe && (
                <InformeVistaPrevia
                    informe={proyecto.informe}
                    onClose={() => setVerInforme(false)}
                />
            )}

            {editando && (
                <EntregablesModal
                    proyecto={proyecto}
                    onClose={() => setEditando(false)}
                    onGuardado={() => onActualizado?.()}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista previa del informe (PDF) dentro de la página, sin descargarlo
// ─────────────────────────────────────────────────────────────────────────────
function InformeVistaPrevia({ informe, onClose }) {
    const [url, setUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let activo = true;
        let urlObjeto = null;

        apiFetch(`/archivos/${informe.id}/descargar`, { responseType: 'blob' })
            .then((blob) => {
                if (!activo) return;
                urlObjeto = URL.createObjectURL(
                    new Blob([blob], { type: 'application/pdf' }),
                );
                setUrl(urlObjeto);
            })
            .catch((err) => {
                if (activo) setError(err.message || 'No se pudo cargar el informe');
            });

        return () => {
            activo = false;
            if (urlObjeto) URL.revokeObjectURL(urlObjeto);
        };
    }, [informe.id]);

    async function handleDescargar() {
        try {
            await descargarArchivo(informe);
        } catch (err) {
            mostrarToast(err.message || 'No se pudo descargar el informe');
        }
    }

    return (
        <Modal
            open
            onClose={onClose}
            maxWidth='920px'
        >
            <ModalHeader
                title='Informe final'
                subtitle={informe.nombre_archivo}
                onClose={onClose}
                rightContent={
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={handleDescargar}
                            className='inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] px-3 py-1.5 text-[12px] font-medium text-neutral-400 transition hover:text-neutral-100'
                        >
                            <i className='ti ti-download text-[14px]' /> Descargar
                        </button>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex h-8 w-8 items-center justify-center rounded-[10px] text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-100'
                            aria-label='Cerrar'
                        >
                            <i className='ti ti-x text-[18px]' />
                        </button>
                    </div>
                }
            />
            <div className='bg-[#17171B]'>
                {error && (
                    <p className='px-5 py-16 text-center text-[13px] text-red-400'>
                        {error}
                    </p>
                )}
                {!error && !url && (
                    <p className='px-5 py-16 text-center text-[13px] text-neutral-500'>
                        Cargando informe…
                    </p>
                )}
                {url && (
                    <iframe
                        src={`${url}#view=FitH`}
                        title='Vista previa del informe final'
                        className='h-[75vh] w-full'
                    />
                )}
            </div>
        </Modal>
    );
}

const CLASE_INPUT =
    'w-full rounded-[10px] border border-white/[0.07] bg-[#1E1E24] py-2.5 pl-10 pr-3.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50';
const CLASE_LABEL = 'mb-1.5 block text-[11px] font-medium text-neutral-500';

function CampoLink({ icono, colorIcono, etiqueta, value, onChange, ph }) {
    return (
        <div>
            <label className={CLASE_LABEL}>{etiqueta}</label>
            <div className='relative'>
                <i
                    className={`ti ${icono} absolute left-3 top-1/2 -translate-y-1/2 text-[17px] ${colorIcono}`}
                />
                <input
                    type='url'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={ph}
                    maxLength={2048}
                    className={CLASE_INPUT}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulario para agregar o cambiar los entregables (solo el creador)
// ─────────────────────────────────────────────────────────────────────────────
export function EntregablesModal({ proyecto, onClose, onGuardado }) {
    const [video, setVideo] = useState(proyecto.video_url ?? '');
    const [github, setGithub] = useState(proyecto.github_url ?? '');
    const [linkedin, setLinkedin] = useState(proyecto.linkedin_url ?? '');
    const [quitarInforme, setQuitarInforme] = useState(false);
    const [archivoNuevo, setArchivoNuevo] = useState(null);
    const [errores, setErrores] = useState([]);
    const [guardando, setGuardando] = useState(false);

    const informeActual = quitarInforme ? null : proyecto.informe;

    function elegirArchivo(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setErrores(['El informe final debe ser un archivo PDF']);
            return;
        }
        if (file.size > MAX_PDF_MB * 1024 * 1024) {
            setErrores([`El PDF no puede pesar más de ${MAX_PDF_MB} MB`]);
            return;
        }
        setErrores([]);
        setArchivoNuevo(file);
    }

    function validar() {
        const errs = [];
        if (video.trim() && !esLinkYoutube(video.trim()))
            errs.push('El video de presentación debe ser un link de YouTube');
        if (github.trim() && !esLinkGithub(github.trim()))
            errs.push('El repositorio debe ser un link de GitHub');
        if (linkedin.trim() && !esLinkLinkedin(linkedin.trim()))
            errs.push('El link de LinkedIn debe ser de linkedin.com');
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validar();
        if (errs.length > 0) {
            setErrores(errs);
            return;
        }
        setErrores([]);
        setGuardando(true);

        try {
            await guardarEntregables(proyecto.id, {
                video_url: video.trim(),
                github_url: github.trim(),
                linkedin_url: linkedin.trim(),
            });
        } catch (err) {
            setErrores(err.details?.length ? err.details : [err.message]);
            setGuardando(false);
            return;
        }

        const quitar =
            proyecto.informe && (quitarInforme || archivoNuevo)
                ? [proyecto.informe.id]
                : [];
        if (quitar.length > 0 || archivoNuevo) {
            const r = await sincronizarArchivos('proyecto', proyecto.id, {
                quitar,
                nuevos: archivoNuevo ? [archivoNuevo] : [],
            });
            const fallos = [...r.fallidosQuitar, ...r.fallidosSubir].map(
                (f) => f.error?.message || 'No se pudo actualizar el informe',
            );
            if (fallos.length > 0) {
                onGuardado();
                setErrores([
                    'Los links se guardaron, pero el informe no se pudo actualizar:',
                    ...fallos,
                ]);
                setGuardando(false);
                return;
            }
        }

        onGuardado();
        onClose();
    }

    return (
        <Modal
            open
            onClose={onClose}
            maxWidth='560px'
        >
            <ModalHeader
                title='Trabajo final del proyecto'
                subtitle='Se muestra en el detalle del proyecto a todos los usuarios.'
                onClose={onClose}
            />
            <ModalBody>
                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-4'
                >
                    {errores.length > 0 && (
                        <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                            <ul className='list-disc space-y-0.5 pl-4'>
                                {errores.map((er, i) => (
                                    <li key={i}>{er}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label className={CLASE_LABEL}>Informe final (PDF)</label>
                        {informeActual && !archivoNuevo && (
                            <div className='flex items-center gap-2.5 rounded-[10px] border border-white/[0.07] bg-[#232329] px-3 py-2.5 text-[12.5px] text-neutral-300'>
                                <i className='ti ti-file-type-pdf text-[20px] text-red-400' />
                                <span className='min-w-0 flex-1 truncate'>
                                    {informeActual.nombre_archivo}
                                </span>
                                <button
                                    type='button'
                                    onClick={() => setQuitarInforme(true)}
                                    className='text-neutral-500 transition hover:text-red-400'
                                    title='Quitar informe'
                                >
                                    <i className='ti ti-trash text-[15px]' />
                                </button>
                            </div>
                        )}
                        {archivoNuevo && (
                            <div className='flex items-center gap-2.5 rounded-[10px] border border-pink-500/30 bg-pink-500/[0.06] px-3 py-2.5 text-[12.5px] text-neutral-200'>
                                <i className='ti ti-file-type-pdf text-[20px] text-pink-400' />
                                <span className='min-w-0 flex-1 truncate'>
                                    {archivoNuevo.name} · {formatearTamanio(archivoNuevo.size)}
                                </span>
                                <button
                                    type='button'
                                    onClick={() => setArchivoNuevo(null)}
                                    className='text-neutral-500 transition hover:text-red-400'
                                    title='Descartar'
                                >
                                    <i className='ti ti-x text-[15px]' />
                                </button>
                            </div>
                        )}
                        {!informeActual && !archivoNuevo && (
                            <label className='flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border border-dashed border-white/[0.14] px-3 py-5 text-center text-[12.5px] text-neutral-400 transition hover:border-pink-500/40 hover:bg-pink-500/[0.04] hover:text-neutral-100'>
                                <i className='ti ti-cloud-upload text-[24px] text-pink-400' />
                                Seleccionar el informe en PDF
                                <span className='text-[11px] text-neutral-600'>
                                    Máximo {MAX_PDF_MB} MB
                                </span>
                                <input
                                    type='file'
                                    accept='application/pdf,.pdf'
                                    onChange={elegirArchivo}
                                    className='hidden'
                                />
                            </label>
                        )}
                        {informeActual && !archivoNuevo && (
                            <label className='mt-1.5 inline-flex cursor-pointer items-center gap-1 text-[11.5px] text-neutral-500 transition hover:text-neutral-200'>
                                <i className='ti ti-replace text-[13px]' />
                                Reemplazar por otro PDF
                                <input
                                    type='file'
                                    accept='application/pdf,.pdf'
                                    onChange={elegirArchivo}
                                    className='hidden'
                                />
                            </label>
                        )}
                    </div>

                    <CampoLink
                        icono='ti-brand-youtube'
                        colorIcono='text-red-400'
                        etiqueta='Video de presentación (YouTube)'
                        value={video}
                        onChange={setVideo}
                        ph='https://www.youtube.com/watch?v=...'
                    />
                    <CampoLink
                        icono='ti-brand-github'
                        colorIcono='text-neutral-300'
                        etiqueta='Repositorio (GitHub)'
                        value={github}
                        onChange={setGithub}
                        ph='https://github.com/usuario/proyecto'
                    />
                    <CampoLink
                        icono='ti-brand-linkedin'
                        colorIcono='text-sky-400'
                        etiqueta='LinkedIn (opcional)'
                        value={linkedin}
                        onChange={setLinkedin}
                        ph='https://www.linkedin.com/in/usuario'
                    />

                    <div className='mt-2 flex justify-end gap-2 border-t border-white/[0.07] pt-4'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={guardando}
                            className='rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                        >
                            {guardando ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </ModalBody>
        </Modal>
    );
}