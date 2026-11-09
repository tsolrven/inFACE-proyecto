import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BarraDialogos from '@/features/creative-space/components/BarraDialogos';
import GuionSelector from '@/features/creative-space/components/GuionSelector';
import ImagenUnicaInput from '@/features/creative-space/components/ImagenUnicaInput';
import {
  subirPortada,
  quitarPortada,
  subirImagenPersonaje,
  quitarImagenPersonaje,
  subirAudioPista,
  quitarAudioPista,
  obtenerObra,
} from '@/features/creative-space/api/creative.api';
import {
  FUENTES,
  ESTILO_POEMA_INICIAL,
  cargarFuente,
  familiaDe,
} from '@/features/creative-space/utils/fuentes';
import { extensionDe } from '@/shared/lib/archivos';
import { renombrarEnCapitulo } from '@/features/creative-space/utils/parrafos';
import Campo from '@/shared/components/form/Campo';
import HashtagsInput from '@/shared/components/form/HashtagsInput';
import { inputClasses } from '@/shared/components/form/inputClasses';
import ArchivosInput from '@/shared/components/form/ArchivosInput';
import { useArchivosForm } from '@/shared/hooks/useArchivosForm';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { normalizarHashtags, validarHashtags } from '@/shared/lib/hashtags';
import { mensajeDeError } from '@/shared/lib/errores';
import { parchearContenido } from '@/shared/post/cache';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useCrearObra,
  useEditarObra,
} from '@/features/creative-space/hooks/useObras';
import {
  TIPOS_OBRA,
  TIPO_POR_ID,
  textosForm,
} from '@/features/creative-space/utils/tipos';
import { parsearEnlace } from '@/features/creative-space/utils/embed';
import {
  TITULO_MIN,
  TITULO_MAX,
  DESCRIPCION_MAX,
  TEXTO_MAX,
  FIRMA_MAX,
  CAPITULO_MAX,
  CAPITULOS_MAX,
  PERSONAJES_MAX,
  PISTAS_MAX,
  ADJUNTO_MAX_MB,
  ADJUNTO_MAX_BYTES,
  EXT_IMAGENES,
  EXT_AUDIO,
} from '@/features/creative-space/utils/limites';

const MarkdownEditor = lazy(() => import('@/shared/editor/MarkdownEditor'));

const Cargando = ({ alto = 200 }) => (
  <div
    style={{ height: alto }}
    className='flex items-center justify-center rounded-[10px] border border-white/[0.09] bg-[#17171B] text-neutral-600'
  >
    <i className='ti ti-loader-2 animate-spin text-xl' />
  </div>
);

let contadorClaves = 0;
const nuevaClave = () => `k${++contadorClaves}`;

const ARCHIVOS_POR_TIPO = {
  musica: {
    max: 3,
    extensiones: EXT_AUDIO,
    singular: 'audio',
    plural: 'audios',
    label: 'Audio (opcional si pegas un enlace)',
    ayuda: `MP3, WAV, OGG o M4A · hasta ${ADJUNTO_MAX_MB} MB cada uno.`,
  },
  visual: {
    max: 10,
    extensiones: EXT_IMAGENES,
    singular: 'imagen',
    plural: 'imágenes',
    label: 'Imágenes de tu obra',
    ayuda: `JPG, PNG, WEBP o GIF · hasta ${ADJUNTO_MAX_MB} MB cada una.`,
  },
};

export default function ObraForm({
  obra = null,
  tipoInicial = null,
  onCancel,
  onGuardado,
}) {
  const editando = !!obra;
  const qc = useQueryClient();
  const crear = useCrearObra();
  const editar = useEditarObra();

  const [original] = useState(() => ({
    titulo: obra?.titulo ?? '',
    descripcion: (obra?.descripcion ?? '').trim(),
    texto: (obra?.texto ?? '').trim(),
    enlace: obra?.enlace_url ?? '',
    hashtags: obra?.hashtags ?? [],
    archivos: obra?.archivos ?? [],
    capitulos: (obra?.capitulos ?? []).map((c) => ({
      id: c.id,
      titulo: c.titulo,
      contenido: c.contenido,
      borrador: !!c.borrador,
    })),
    personajes: (obra?.personajes ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      imagen_id: p.imagen_id ?? null,
    })),
    pistas: (obra?.pistas ?? []).map((p) => ({
      id: p.id,
      titulo: p.titulo,
      enlace: p.enlace_url ?? '',
    })),
    firma: obra?.firma ?? '',
    estilo: obra?.estilo ?? ESTILO_POEMA_INICIAL,
    portadaId: obra?.portada_id ?? null,
  }));

  const [tipoSel, setTipoSel] = useState(tipoInicial);
  const tipo = obra?.tipo ?? tipoSel;
  const [paso, setPaso] = useState('datos'); 
  const [esGaleria, setEsGaleria] = useState(obra?.es_galeria ?? false);
  const [guionId, setGuionId] = useState(obra?.guion?.id ?? null);
  const [titulo, setTitulo] = useState(original.titulo);
  const [descripcion, setDescripcion] = useState(original.descripcion);
  const [texto, setTexto] = useState(original.texto);
  const [enlace, setEnlace] = useState(original.enlace);
  const [hashtagsTexto, setHashtagsTexto] = useState(
    original.hashtags.map((t) => `#${t}`).join(' '),
  );
  const [capitulos, setCapitulos] = useState(() =>
    original.capitulos.map((c) => ({ ...c, key: nuevaClave(), v: 0 })),
  );
  const [personajes, setPersonajes] = useState(() =>
    original.personajes.map((p) => ({
      ...p,
      key: nuevaClave(),
      nombreBase: p.nombre, 
      imagenFile: null,
      imagenQuitada: false,
    })),
  );
  const [firma, setFirma] = useState(original.firma);
  const [estilo, setEstilo] = useState(original.estilo);
  const [portada, setPortada] = useState({ file: null, quitada: false });
  const [pistas, setPistas] = useState(() =>
    (obra?.pistas ?? []).map((p) => ({
      key: nuevaClave(),
      id: p.id,
      titulo: p.titulo,
      enlace: p.enlace_url ?? '',
      archivo_id: p.archivo_id ?? null,
      audioFile: null,
      audioQuitada: false,
    })),
  );
  const editoresRef = useRef({}); 
  const [capAbierto, setCapAbierto] = useState(null);
  const [error, setError] = useState(null);
  const [confirmandoSalir, setConfirmandoSalir] = useState(false);

  const cfgBase = ARCHIVOS_POR_TIPO[tipo];
  const cfgArchivos = (tipo === 'visual'
    ? {
        ...cfgBase,
        max: esGaleria ? 40 : 1,
        label: esGaleria ? 'Fotos de la galería' : 'Tu imagen',
      }
    : cfgBase) ?? {
    max: 1,
    extensiones: EXT_IMAGENES,
    singular: 'archivo',
    plural: 'archivos',
  };
  const archivos = useArchivosForm({
    existentes: original.archivos,
    max: cfgArchivos.max,
    maxBytes: ADJUNTO_MAX_BYTES,
    extensiones: cfgArchivos.extensiones,
    singular: cfgArchivos.singular,
    plural: cfgArchivos.plural,
  });

  const info = tipo ? TIPO_POR_ID[tipo] : null;
  const hashtags = normalizarHashtags(hashtagsTexto);
  const errorHashtags = validarHashtags(hashtags);
  const enviando = crear.isPending || editar.isPending;
  const usaArchivos = tipo === 'musica' || tipo === 'visual';
  const usaPortada = ['poema', 'historia', 'guion', 'musica', 'album'].includes(
    tipo,
  );
  const conPistas = tipo === 'album';
  const conCapitulos = tipo === 'historia' || tipo === 'guion';
  const conPersonajes =
    tipo === 'guion' || tipo === 'audiovisual' || tipo === 'historia';
  const esMusica = tipo === 'musica' || tipo === 'album';
  const unidad = tipo === 'guion' ? 'Escena' : 'Capítulo';
  const unidadPlural = tipo === 'guion' ? 'Escenas' : 'Capítulos';
  const mostrarDatos = !conCapitulos || paso === 'datos';
  const mostrarEscribir = conCapitulos && paso === 'escribir';
  const eraBorrador = editando && !!obra.borrador;
  const capSel = capitulos.find((c) => c.key === capAbierto) ?? capitulos[0];

  useEffect(() => cargarFuente(estilo.fuente), [estilo.fuente]);

  const capitulosLimpios = capitulos.map(
    ({ id, titulo: t, contenido, borrador: b }) => ({
      id,
      titulo: t.trim(),
      contenido,
      borrador: !!b,
    }),
  );
  const personajesLimpios = personajes.map(
    ({ id, nombre, descripcion: d }) => ({
      id,
      nombre: nombre.trim(),
      descripcion: d.trim(),
    }),
  );
  const imagenesPersonajesCambiaron =
    personajes.some((p) => p.imagenFile || p.imagenQuitada) ||
    pistas.some((p) => p.audioFile || p.audioQuitada);
  const pistasLimpias = pistas.map(({ id, titulo: t, enlace: e }) => ({
    id,
    titulo: t.trim(),
    enlace: e.trim(),
  }));

  const cambios = {
    titulo: titulo.trim() !== original.titulo,
    descripcion: descripcion !== original.descripcion,
    texto: texto !== original.texto,
    enlace: enlace.trim() !== original.enlace,
    hashtags:
      hashtags.length !== original.hashtags.length ||
      hashtags.some((t) => !original.hashtags.includes(t)),
    capitulos:
      JSON.stringify(capitulosLimpios) !== JSON.stringify(original.capitulos),
    personajes:
      JSON.stringify(personajesLimpios) !==
      JSON.stringify(
        original.personajes.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion.trim(),
        })),
      ),
    pistas:
      JSON.stringify(pistasLimpias) !==
      JSON.stringify(
        original.pistas.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          enlace: p.enlace,
        })),
      ),
    firma: firma.trim() !== original.firma,
    estilo:
      estilo.fuente !== original.estilo.fuente ||
      estilo.alineacion !== original.estilo.alineacion,
    imagenes:
      !!portada.file ||
      (portada.quitada && !!original.portadaId) ||
      imagenesPersonajesCambiaron,
    guion: guionId !== (obra?.guion?.id ?? null),
    archivos: archivos.hayCambios,
  };
  const hayCambios = editando
    ? Object.values(cambios).some(Boolean)
    : titulo.trim() !== '' ||
      descripcion !== '' ||
      texto !== '' ||
      enlace.trim() !== '' ||
      capitulos.length > 0 ||
      pistas.length > 0 ||
      !!portada.file ||
      imagenesPersonajesCambiaron ||
      archivos.hayCambios;

  function intentarCerrar() {
    if (enviando) return;
    if (hayCambios) setConfirmandoSalir(true);
    else onCancel();
  }

  function agregarCapitulo() {
    if (capitulos.length >= CAPITULOS_MAX) return;
    const c = {
      key: nuevaClave(),
      titulo: `${unidad} ${capitulos.length + 1}`,
      contenido: '',
      borrador: false,
      v: 0,
    };
    setCapitulos((prev) => [...prev, c]);
    setCapAbierto(c.key);
  }
  function irAPaso(destino) {
    if (destino === 'escribir') {
      if (titulo.trim().length < TITULO_MIN) {
        setError(
          `Ponle un título a tu obra (mínimo ${TITULO_MIN} caracteres).`,
        );
        return;
      }
      setError(null);
      if (capitulos.length === 0) agregarCapitulo();
    }
    setPaso(destino);
    window.scrollTo?.({ top: 0 });
  }
  const marcarTodos = (borrador) =>
    setCapitulos((prev) => prev.map((c) => ({ ...c, borrador })));
  const actualizarCapitulo = (key, campos) =>
    setCapitulos((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...campos } : c)),
    );
  const agregarPista = () =>
    pistas.length < PISTAS_MAX &&
    setPistas((prev) => [
      ...prev,
      {
        key: nuevaClave(),
        id: undefined,
        titulo: '',
        enlace: '',
        archivo_id: null,
        audioFile: null,
        audioQuitada: false,
      },
    ]);
  const actualizarPista = (key, campos) =>
    setPistas((prev) =>
      prev.map((p) => (p.key === key ? { ...p, ...campos } : p)),
    );
  const quitarPista = (key) =>
    setPistas((prev) => prev.filter((p) => p.key !== key));
  function moverPista(index, delta) {
    setPistas((prev) => {
      const destino = index + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  }
  function elegirAudio(key, e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!EXT_AUDIO.includes(extensionDe(f.name))) {
      setError(`"${f.name}" no es un audio permitido (MP3, WAV, OGG o M4A)`);
      return;
    }
    if (f.size > ADJUNTO_MAX_BYTES) {
      setError(`"${f.name}" supera ${ADJUNTO_MAX_MB} MB`);
      return;
    }
    actualizarPista(key, { audioFile: f, audioQuitada: false });
  }
  const quitarCapitulo = (key) => {
    setCapitulos((prev) => prev.filter((c) => c.key !== key));
    if (capAbierto === key) setCapAbierto(null);
  };
  function moverCapitulo(index, delta) {
    setCapitulos((prev) => {
      const destino = index + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  }
  const agregarPersonaje = () =>
    personajes.length < PERSONAJES_MAX &&
    setPersonajes((prev) => [
      ...prev,
      {
        key: nuevaClave(),
        nombre: '',
        nombreBase: '',
        descripcion: '',
        imagen_id: null,
        imagenFile: null,
        imagenQuitada: false,
      },
    ]);
  const actualizarPersonaje = (key, campos) =>
    setPersonajes((prev) =>
      prev.map((p) => (p.key === key ? { ...p, ...campos } : p)),
    );

  function renombrarPersonaje(p) {
    const nuevo = p.nombre.trim();
    const viejo = p.nombreBase;
    if (nuevo === viejo) return;
    if (viejo && nuevo) {
      setCapitulos((prev) =>
        prev.map((c) => {
          const contenido = renombrarEnCapitulo(c.contenido, viejo, nuevo);
          return contenido === c.contenido
            ? c
            : { ...c, contenido, v: c.v + 1 };
        }),
      );
    }
    actualizarPersonaje(p.key, { nombreBase: nuevo });
  }
  const quitarPersonaje = (key) =>
    setPersonajes((prev) => prev.filter((p) => p.key !== key));

  function validar(esBorrador = false) {
    if (titulo.trim().length < TITULO_MIN) {
      return `El título debe tener al menos ${TITULO_MIN} caracteres.`;
    }
    if (errorHashtags) return errorHashtags;
    if (descripcion.length > DESCRIPCION_MAX) {
      return `La descripción no puede superar ${DESCRIPCION_MAX} caracteres.`;
    }
    const url = enlace.trim();
    if (url && (tipo === 'musica' || tipo === 'audiovisual')) {
      if (!url.startsWith('https://') || !parsearEnlace(url)) {
        return 'El enlace debe ser https y de YouTube, Vimeo, Spotify o SoundCloud.';
      }
    }
    if (texto.length > TEXTO_MAX) {
      return `El texto no puede superar ${TEXTO_MAX} caracteres (tiene ${texto.length}).`;
    }
    if (firma.length > FIRMA_MAX) {
      return `La firma no puede superar ${FIRMA_MAX} caracteres.`;
    }
    for (const [i, c] of capitulosLimpios.entries()) {
      if (!c.titulo)
        return `El ${unidad.toLowerCase()} ${i + 1} necesita un título.`;
      if (c.contenido.length > CAPITULO_MAX) {
        return `El ${unidad.toLowerCase()} ${i + 1} supera ${CAPITULO_MAX} caracteres.`;
      }
    }
    if (conPersonajes && personajesLimpios.some((p) => !p.nombre)) {
      return 'Todos los personajes o participantes necesitan un nombre.';
    }
    if (esBorrador) return null;
    if (tipo === 'musica' && !url && archivos.total === 0) {
      return 'Sube un audio o pega un enlace de tu canción.';
    }
    if (tipo === 'visual' && archivos.total === 0) {
      return 'Sube al menos una imagen de tu obra.';
    }
    if (tipo === 'visual' && esGaleria && !editando && archivos.total < 2) {
      return 'Una galería necesita al menos 2 imágenes.';
    }
    if (tipo === 'audiovisual' && !url) {
      return 'Pega el enlace de tu video (YouTube o Vimeo).';
    }
    if (tipo === 'poema') {
      if (!texto.trim()) return 'Escribe tu poema.';
    }
    if (conCapitulos) {
      const publicados = capitulosLimpios.filter((c) => !c.borrador);
      if (publicados.length === 0) {
        return `Publica al menos ${tipo === 'guion' ? 'una escena' : 'un capítulo'} (o guarda tu obra como borrador).`;
      }
      const vacio = publicados.find((c) => !c.contenido.trim());
      if (vacio) {
        return `«${vacio.titulo}» está vacío: escríbelo o déjalo en borrador.`;
      }
    }
    if (conPistas) {
      if (pistas.length === 0) return 'Agrega al menos una pista.';
      for (const [i, p] of pistas.entries()) {
        const n = i + 1;
        if (!p.titulo.trim()) return `La pista ${n} necesita un título.`;
        const enlaceP = p.enlace.trim();
        if (
          enlaceP &&
          (!enlaceP.startsWith('https://') || !parsearEnlace(enlaceP))
        ) {
          return `El enlace de la pista ${n} debe ser https y de YouTube, Vimeo, Spotify o SoundCloud.`;
        }
        const tieneAudio = p.audioFile || (p.archivo_id && !p.audioQuitada);
        if (!enlaceP && !tieneAudio) {
          return `La pista ${n} necesita un audio o un enlace.`;
        }
      }
    }
    return null;
  }

  const ultimoFallo = useRef(null);
  async function aplicarImagenes(base) {
    let fallos = 0;
    const intentar = async (fn) => {
      try {
        await fn();
      } catch (err) {
        fallos += 1;
        ultimoFallo.current = err?.message || null;
      }
    };
    if (portada.file) {
      await intentar(() => subirPortada(base.id, portada.file));
    } else if (portada.quitada && original.portadaId) {
      await intentar(() => quitarPortada(base.id));
    }
    for (const [i, p] of personajes.entries()) {
      const destino = base.personajes?.[i];
      if (!destino) continue;
      if (p.imagenFile) {
        await intentar(() =>
          subirImagenPersonaje(base.id, destino.id, p.imagenFile),
        );
      } else if (p.imagenQuitada && destino.imagen_id) {
        await intentar(() => quitarImagenPersonaje(base.id, destino.id));
      }
    }
    for (const [i, p] of pistas.entries()) {
      const destino = base.pistas?.[i];
      if (!destino) continue;
      if (p.audioFile) {
        await intentar(() => subirAudioPista(base.id, destino.id, p.audioFile));
      } else if (p.audioQuitada && destino.archivo_id) {
        await intentar(() => quitarAudioPista(base.id, destino.id));
      }
    }
    return fallos;
  }

  async function terminar(base) {
    const hayImagenes =
      !!portada.file || portada.quitada || imagenesPersonajesCambiaron; 
    if (!hayImagenes) {
      onGuardado(base);
      return;
    }
    const fallos = await aplicarImagenes(base);
    if (fallos > 0) {
      mostrarToast(
        `La obra se guardó, pero una imagen no se pudo subir${ultimoFallo.current ? `: ${ultimoFallo.current}` : ''}. Edítala para reintentar.`,
      );
    }
    let final = base;
    try {
      final = await obtenerObra(base.id);
    } catch {
    }
    qc.setQueryData(['obra', 'detail', base.id], final);
    parchearContenido(qc, 'obra', base.id, final);
    await qc.invalidateQueries({ queryKey: ['obra'] });
    onGuardado(final);
  }

  async function guardar(modo) {
    setError(null);
    if (!tipo) return;
    const esBorrador = modo === 'borrador';

    const problema = validar(esBorrador);
    if (problema) {
      setError(problema);
      return;
    }

    const capitulosPayload = capitulosLimpios.map((c) => ({
      ...(c.id && { id: c.id }),
      titulo: c.titulo,
      contenido: c.contenido,
      borrador: c.borrador,
    }));
    const pistasPayload = pistasLimpias.map((p) => ({
      ...(p.id && { id: p.id }),
      titulo: p.titulo,
      enlace_url: p.enlace || null,
    }));
    const personajesPayload = personajesLimpios.map((p) => ({
      ...(p.id && { id: p.id }),
      nombre: p.nombre,
      descripcion: p.descripcion || null,
    }));
    const estiloPayload = {
      fuente: estilo.fuente,
      alineacion: estilo.alineacion,
    };

    try {
      if (!editando) {
        const creada = await crear.mutateAsync({
          payload: {
            tipo,
            titulo: titulo.trim(),
            borrador: esBorrador,
            descripcion,
            hashtags,
            ...(tipo === 'poema' && {
              texto,
              firma: firma.trim(),
              estilo: estiloPayload,
            }),
            ...((tipo === 'musica' || tipo === 'audiovisual') && {
              enlace_url: enlace.trim(),
            }),
            ...(conCapitulos && { capitulos: capitulosPayload }),
            ...(conPersonajes && { personajes: personajesPayload }),
            ...(conPistas && { pistas: pistasPayload }),
            ...(tipo === 'visual' && { es_galeria: esGaleria }),
            ...(tipo === 'audiovisual' && { guion_id: guionId }),
          },
          archivos: usaArchivos ? archivos.nuevos : [],
        });
        await terminar(creada);
        return;
      }

      const payload = {};
      if (esBorrador !== !!obra.borrador) payload.borrador = esBorrador;
      if (cambios.titulo) payload.titulo = titulo.trim();
      if (cambios.descripcion) payload.descripcion = descripcion;
      if (cambios.hashtags) payload.hashtags = hashtags;
      if (tipo === 'poema') {
        if (cambios.texto) payload.texto = texto;
        if (cambios.firma) payload.firma = firma.trim();
        if (cambios.estilo) payload.estilo = estiloPayload;
      }
      if ((tipo === 'musica' || tipo === 'audiovisual') && cambios.enlace) {
        payload.enlace_url = enlace.trim();
      }
      if (conCapitulos && cambios.capitulos) {
        payload.capitulos = capitulosPayload;
      }
      if (conPistas && cambios.pistas) payload.pistas = pistasPayload;
      if (conPersonajes && cambios.personajes) {
        payload.personajes = personajesPayload;
      }
      if (tipo === 'audiovisual' && cambios.guion) payload.guion_id = guionId;

      const hayTexto = Object.keys(payload).length > 0;
      if (!hayTexto && !cambios.archivos && !cambios.imagenes) {
        onCancel();
        return;
      }

      const { obra: actualizada, fallos } = await editar.mutateAsync({
        id: obra.id,
        payload: hayTexto ? payload : null,
        quitar: archivos.quitarIds,
        nuevos: archivos.nuevos,
      });
      if (fallos.quitar > 0 || fallos.subir > 0) {
        mostrarToast(
          'Se guardaron los cambios, pero algunos archivos fallaron. Revisa la obra.',
        );
      }
      if (esBorrador) mostrarToast('Borrador guardado');
      await terminar(actualizada ?? obra);
    } catch (err) {
      setError(
        mensajeDeError(
          err,
          esBorrador
            ? 'No se pudo guardar el borrador.'
            : editando
              ? 'No se pudo guardar la obra.'
              : 'No se pudo publicar la obra.',
        ),
      );
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (conCapitulos && paso === 'datos') irAPaso('escribir');
    else guardar('publicar');
  }

  return (
    <>
      <div
        className={`mx-auto w-full ${mostrarEscribir ? 'max-w-[1400px]' : conCapitulos ? 'max-w-[980px]' : 'max-w-[760px]'}`}
      >
        <div className='mb-4 flex items-center gap-2.5'>
          <button
            type='button'
            onClick={intentarCerrar}
            title='Volver'
            className='flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
          >
            <i className='ti ti-arrow-left text-base' />
          </button>
          <span
            className='flex h-8 w-8 items-center justify-center rounded-lg text-base'
            style={{ background: `${info.color}22`, color: info.color }}
          >
            <i className={`ti ${info.icono}`} />
          </span>
          <h1 className='text-[17px] font-bold text-neutral-100'>
            {editando
              ? `Editar ${info.label.toLowerCase()}`
              : textosForm(tipo, esGaleria).titulo}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4 rounded-[14px] border border-white/[0.07] bg-[#1A1A1F] p-3 sm:p-5'
        >
          {conCapitulos && (
            <div className='flex flex-wrap gap-2'>
              {[
                ['datos', '1', 'Portada y datos'],
                [
                  'escribir',
                  '2',
                  tipo === 'guion'
                    ? 'Escribir la obra'
                    : 'Escribir la historia',
                ],
              ].map(([id, n, label]) => (
                <button
                  key={id}
                  type='button'
                  onClick={() => irAPaso(id)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    paso === id
                      ? 'border-white/[0.25] bg-white/[0.08] text-neutral-100'
                      : 'border-white/[0.07] text-neutral-500 hover:text-neutral-200'
                  }`}
                >
                  <span
                    className='flex h-5 w-5 items-center justify-center rounded-full text-[11px]'
                    style={{ background: `${info.color}33`, color: info.color }}
                  >
                    {n}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {esMusica && !editando && (
            <div className='flex gap-2'>
              {[
                ['musica', 'Canción', 'ti-music'],
                ['album', 'Álbum (varias canciones)', 'ti-disc'],
              ].map(([id, texto, icono]) => (
                <button
                  key={id}
                  type='button'
                  onClick={() => setTipoSel(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                    tipo === id
                      ? 'border-pink-400/50 bg-pink-400/10 text-pink-300'
                      : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18]'
                  }`}
                >
                  <i className={`ti ${icono}`} /> {texto}
                </button>
              ))}
            </div>
          )}

          {mostrarDatos && (
            <>
              <Campo
                label='Título'
                extra={
                  <CharCounter
                    value={titulo}
                    max={TITULO_MAX}
                  />
                }
              >
                <input
                  autoFocus
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={TITULO_MAX}
                  placeholder='El nombre de tu obra'
                  className={inputClasses}
                />
              </Campo>

              {(tipo === 'musica' || tipo === 'audiovisual') && (
                <Campo
                  label={
                    tipo === 'musica'
                      ? 'Enlace (Spotify, SoundCloud o YouTube)'
                      : 'Enlace del video (YouTube o Vimeo)'
                  }
                >
                  <input
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    maxLength={300}
                    placeholder='https://...'
                    className={inputClasses}
                  />
                </Campo>
              )}

              {tipo === 'visual' && !editando && (
                <div className='flex gap-2'>
                  {[
                    [false, 'Foto única', 'ti-photo'],
                    [true, 'Galería', 'ti-photo-plus'],
                  ].map(([valor, texto, icono]) => (
                    <button
                      key={texto}
                      type='button'
                      onClick={() => setEsGaleria(valor)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                        esGaleria === valor
                          ? 'border-orange-400/50 bg-orange-400/10 text-orange-300'
                          : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18]'
                      }`}
                    >
                      <i className={`ti ${icono}`} /> {texto}
                    </button>
                  ))}
                </div>
              )}

              {tipo === 'audiovisual' && (
                <GuionSelector
                  valor={guionId}
                  tituloInicial={obra?.guion?.titulo ?? null}
                  onCambiar={setGuionId}
                />
              )}

              {usaArchivos && (
                <ArchivosInput
                  control={archivos}
                  label={cfgArchivos.label}
                  ayuda={cfgArchivos.ayuda}
                  iconoDe={(a) =>
                    (a.tipo_mime ?? '').startsWith('audio/') ||
                    /\.(mp3|wav|ogg|m4a)$/i.test(
                      a.name ?? a.nombre_archivo ?? '',
                    )
                      ? 'ti-music'
                      : 'ti-photo'
                  }
                />
              )}

              {tipo === 'poema' && (
                <>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <Campo label='Fuente'>
                      <select
                        value={estilo.fuente}
                        onChange={(e) =>
                          setEstilo((prev) => ({
                            ...prev,
                            fuente: e.target.value,
                          }))
                        }
                        className={inputClasses}
                      >
                        {FUENTES.map((f) => (
                          <option
                            key={f.id}
                            value={f.id}
                          >
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label='Alineación'>
                      <div className='flex gap-2'>
                        {[
                          ['centro', 'Centrado', 'ti-align-center'],
                          ['izquierda', 'A la izquierda', 'ti-align-left'],
                        ].map(([valor, texto, icono]) => (
                          <button
                            key={valor}
                            type='button'
                            onClick={() =>
                              setEstilo((prev) => ({
                                ...prev,
                                alineacion: valor,
                              }))
                            }
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-2 py-2 text-[12px] font-semibold transition-colors ${
                              estilo.alineacion === valor
                                ? 'border-blue-400/50 bg-blue-400/10 text-blue-300'
                                : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18]'
                            }`}
                          >
                            <i className={`ti ${icono}`} /> {texto}
                          </button>
                        ))}
                      </div>
                    </Campo>
                  </div>

                  <Campo
                    label='Firma (opcional: tu nombre o seudónimo)'
                    extra={
                      <CharCounter
                        value={firma}
                        max={FIRMA_MAX}
                      />
                    }
                  >
                    <input
                      value={firma}
                      onChange={(e) => setFirma(e.target.value)}
                      maxLength={FIRMA_MAX}
                      placeholder='Ej: Violeta P.'
                      className={inputClasses}
                    />
                  </Campo>

                  <Campo label='Poema'>
                    <div style={{ fontFamily: familiaDe(estilo.fuente) }}>
                      <Suspense fallback={<Cargando alto={320} />}>
                        <MarkdownEditor
                          valorInicial={original.texto}
                          onChange={setTexto}
                          max={TEXTO_MAX}
                          barra='creativa'
                          ariaLabel='Texto del poema'
                          placeholder='Escribe tus versos… Shift+Enter = nuevo verso · Enter = nueva estrofa'
                        />
                      </Suspense>
                    </div>
                  </Campo>
                </>
              )}

              {usaPortada && (
                <ImagenUnicaInput
                  label={
                    tipo === 'poema'
                      ? 'Imagen de fondo (opcional)'
                      : tipo === 'musica' || tipo === 'album'
                        ? (tipo === 'album'
                            ? 'Portada del álbum'
                            : 'Portada de la canción') + ' (opcional)'
                        : 'Portada (opcional)'
                  }
                  ayuda={`JPG, PNG, WEBP o GIF · hasta ${ADJUNTO_MAX_MB} MB.${
                    tipo === 'poema'
                      ? ' Se ve detrás del poema; sin imagen se ve solo el texto.'
                      : tipo === 'musica' || tipo === 'album'
                        ? ' Se ve cuadrada, como la carátula de un disco.'
                        : ' Se ve vertical, como la portada de un libro.'
                  }`}
                  existenteId={original.portadaId}
                  file={portada.file}
                  quitada={portada.quitada}
                  onFile={(file) =>
                    setPortada({ file, quitada: !file && portada.quitada })
                  }
                  onQuitarExistente={() =>
                    setPortada({ file: null, quitada: true })
                  }
                  onError={setError}
                />
              )}

              {conPistas && (
                <div className='rounded-[12px] border border-white/[0.07] p-3'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-[12px] font-bold text-neutral-300'>
                      Pistas ({pistas.length}/{PISTAS_MAX})
                    </span>
                    <Button
                      size='sm'
                      icon='ti-plus'
                      onClick={agregarPista}
                      disabled={pistas.length >= PISTAS_MAX}
                    >
                      Pista
                    </Button>
                  </div>
                  {pistas.length === 0 && (
                    <p className='text-[11.5px] text-neutral-600'>
                      Agrega las canciones del álbum. Cada pista lleva un audio
                      (MP3, WAV, OGG o M4A) o un enlace.
                    </p>
                  )}
                  <div className='flex flex-col gap-2'>
                    {pistas.map((p, i) => {
                      const tieneAudio =
                        p.audioFile || (p.archivo_id && !p.audioQuitada);
                      return (
                        <div
                          key={p.key}
                          className='rounded-lg border border-white/[0.07] bg-white/[0.02] p-2'
                        >
                          <div className='flex items-center gap-1.5'>
                            <span className='w-5 text-center text-[11px] font-bold text-neutral-500'>
                              {i + 1}
                            </span>
                            <input
                              value={p.titulo}
                              onChange={(e) =>
                                actualizarPista(p.key, {
                                  titulo: e.target.value,
                                })
                              }
                              maxLength={150}
                              placeholder='Título de la pista'
                              className={inputClasses}
                            />
                            <button
                              type='button'
                              onClick={() => moverPista(i, -1)}
                              disabled={i === 0}
                              aria-label='Subir'
                              className='flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] disabled:opacity-30'
                            >
                              <i className='ti ti-arrow-up' />
                            </button>
                            <button
                              type='button'
                              onClick={() => moverPista(i, 1)}
                              disabled={i === pistas.length - 1}
                              aria-label='Bajar'
                              className='flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] disabled:opacity-30'
                            >
                              <i className='ti ti-arrow-down' />
                            </button>
                            <button
                              type='button'
                              onClick={() => quitarPista(p.key)}
                              aria-label='Quitar pista'
                              className='flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-red-400'
                            >
                              <i className='ti ti-trash' />
                            </button>
                          </div>
                          <div className='mt-1.5 flex flex-col gap-1.5 pl-6 sm:flex-row sm:items-center'>
                            <input
                              value={p.enlace}
                              onChange={(e) =>
                                actualizarPista(p.key, {
                                  enlace: e.target.value,
                                })
                              }
                              maxLength={300}
                              placeholder='Enlace (opcional si subes audio)'
                              className={inputClasses}
                            />
                            <div className='flex flex-shrink-0 items-center gap-2 text-[11.5px]'>
                              <label className='cursor-pointer rounded-full bg-white/[0.07] px-3 py-1.5 font-semibold text-neutral-200 hover:bg-white/[0.12]'>
                                <i className='ti ti-upload' />{' '}
                                {tieneAudio ? 'Cambiar audio' : 'Subir audio'}
                                <input
                                  type='file'
                                  accept={EXT_AUDIO.join(',')}
                                  onChange={(e) => elegirAudio(p.key, e)}
                                  className='hidden'
                                />
                              </label>
                              {tieneAudio && (
                                <span className='max-w-[140px] truncate text-neutral-400'>
                                  {p.audioFile
                                    ? p.audioFile.name
                                    : 'audio guardado'}
                                </span>
                              )}
                              {tieneAudio && (
                                <button
                                  type='button'
                                  onClick={() =>
                                    p.audioFile
                                      ? actualizarPista(p.key, {
                                          audioFile: null,
                                        })
                                      : actualizarPista(p.key, {
                                          audioQuitada: true,
                                        })
                                  }
                                  className='text-neutral-500 hover:text-red-400'
                                >
                                  Quitar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {conPersonajes && (
                <div className='rounded-[12px] border border-white/[0.07] p-3'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-[12px] font-bold text-neutral-300'>
                      {tipo === 'audiovisual'
                        ? 'Elenco y participantes'
                        : 'Personajes'}{' '}
                      ({personajes.length}/{PERSONAJES_MAX})
                    </span>
                    <Button
                      size='sm'
                      icon='ti-plus'
                      onClick={agregarPersonaje}
                      disabled={personajes.length >= PERSONAJES_MAX}
                    >
                      {tipo === 'audiovisual' ? 'Participante' : 'Personaje'}
                    </Button>
                  </div>
                  {personajes.length === 0 && (
                    <p className='text-[11.5px] text-neutral-600'>
                      {tipo === 'audiovisual'
                        ? 'Opcional. Agrega actores, directores y demás participantes, con su rol.'
                        : 'Opcional. Presenta a tus personajes: nombre, imagen y descripción.'}
                    </p>
                  )}
                  <div className='flex flex-col gap-2'>
                    {personajes.map((p) => (
                      <div
                        key={p.key}
                        className='flex items-start gap-2'
                      >
                        {(tipo === 'guion' || tipo === 'historia') && (
                          <ImagenUnicaInput
                            compacta
                            existenteId={p.imagen_id}
                            file={p.imagenFile}
                            quitada={p.imagenQuitada}
                            onFile={(file) =>
                              actualizarPersonaje(p.key, {
                                imagenFile: file,
                                imagenQuitada: !file && p.imagenQuitada,
                              })
                            }
                            onQuitarExistente={() =>
                              actualizarPersonaje(p.key, {
                                imagenQuitada: true,
                              })
                            }
                            onError={setError}
                          />
                        )}
                        <div className='flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row'>
                          <input
                            value={p.nombre}
                            onChange={(e) =>
                              actualizarPersonaje(p.key, {
                                nombre: e.target.value,
                              })
                            }
                            onBlur={() => renombrarPersonaje(p)}
                            maxLength={80}
                            placeholder='Nombre'
                            className={`${inputClasses} sm:w-[35%]`}
                          />
                          <textarea
                            value={p.descripcion}
                            onChange={(e) =>
                              actualizarPersonaje(p.key, {
                                descripcion: e.target.value,
                              })
                            }
                            maxLength={1000}
                            rows={tipo === 'audiovisual' ? 2 : 4}
                            placeholder={
                              tipo === 'audiovisual'
                                ? 'Rol (ej: Director, Actriz principal)'
                                : 'Descripción: cómo es, qué papel tiene… (opcional)'
                            }
                            className={`${inputClasses} min-h-[84px] resize-y leading-relaxed`}
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => quitarPersonaje(p.key)}
                          aria-label='Quitar personaje'
                          className='mt-1.5 flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-red-400'
                        >
                          <i className='ti ti-trash' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {mostrarEscribir && (
            <div className='flex flex-col gap-2'>
              <p className='text-[11.5px] leading-relaxed text-neutral-500'>
                Cada {unidad.toLowerCase()} se publica por separado: deja en
                borrador los que aún no quieres mostrar y publica el resto.
              </p>
              <div className='grid gap-3 md:grid-cols-[240px_minmax(0,1fr)]'>
                <aside className='flex flex-col gap-1.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[12px] font-bold text-neutral-300'>
                      {unidadPlural} ({capitulos.length}/{CAPITULOS_MAX})
                    </span>
                    <Button
                      size='sm'
                      icon='ti-plus'
                      onClick={agregarCapitulo}
                      disabled={capitulos.length >= CAPITULOS_MAX}
                    >
                      {unidad}
                    </Button>
                  </div>
                  <div className='flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0'>
                    {capitulos.map((c, i) => (
                      <button
                        key={c.key}
                        type='button'
                        onClick={() => setCapAbierto(c.key)}
                        className={`flex min-w-[190px] flex-shrink-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left md:min-w-0 text-[12.5px] transition-colors ${
                          capSel?.key === c.key
                            ? 'border-white/[0.25] bg-white/[0.07] text-neutral-100'
                            : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.15]'
                        }`}
                      >
                        <span className='w-4 text-center text-[11px] font-bold text-neutral-500'>
                          {i + 1}
                        </span>
                        <span className='min-w-0 flex-1 truncate'>
                          {c.titulo || 'Sin título'}
                        </span>
                        <span
                          className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${
                            c.borrador
                              ? 'bg-amber-400/15 text-amber-300'
                              : 'bg-emerald-400/15 text-emerald-300'
                          }`}
                        >
                          {c.borrador ? 'Borrador' : 'Publicado'}
                        </span>
                      </button>
                    ))}
                  </div>
                  {capitulos.length > 1 && (
                    <div className='flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] text-neutral-500'>
                      <button
                        type='button'
                        onClick={() => marcarTodos(false)}
                        className='hover:text-neutral-200'
                      >
                        Publicar todos
                      </button>
                      <button
                        type='button'
                        onClick={() => marcarTodos(true)}
                        className='hover:text-neutral-200'
                      >
                        Todos a borrador
                      </button>
                    </div>
                  )}
                </aside>

                {capSel ? (
                  <section
                    key={capSel.key}
                    className='min-w-0 rounded-[12px] border border-white/[0.07] bg-white/[0.02] p-3'
                  >
                    <div className='mb-2 flex flex-wrap items-center gap-1.5'>
                      <input
                        value={capSel.titulo}
                        onChange={(e) =>
                          actualizarCapitulo(capSel.key, {
                            titulo: e.target.value,
                          })
                        }
                        maxLength={150}
                        placeholder={`Título de ${tipo === 'guion' ? 'la escena' : 'el capítulo'}`}
                        className={`${inputClasses} min-w-[160px] flex-1 font-semibold`}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          moverCapitulo(capitulos.indexOf(capSel), -1)
                        }
                        disabled={capitulos.indexOf(capSel) === 0}
                        aria-label='Subir'
                        className='flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] disabled:opacity-30'
                      >
                        <i className='ti ti-arrow-up' />
                      </button>
                      <button
                        type='button'
                        onClick={() =>
                          moverCapitulo(capitulos.indexOf(capSel), 1)
                        }
                        disabled={
                          capitulos.indexOf(capSel) === capitulos.length - 1
                        }
                        aria-label='Bajar'
                        className='flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] disabled:opacity-30'
                      >
                        <i className='ti ti-arrow-down' />
                      </button>
                      <button
                        type='button'
                        onClick={() => quitarCapitulo(capSel.key)}
                        aria-label={`Quitar ${unidad.toLowerCase()}`}
                        className='flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.06] hover:text-red-400'
                      >
                        <i className='ti ti-trash' />
                      </button>
                    </div>

                    <div className='mb-2 flex gap-1.5'>
                      {[
                        [false, 'Publicado', 'ti-world'],
                        [true, 'Borrador', 'ti-lock'],
                      ].map(([valor, texto, icono]) => (
                        <button
                          key={texto}
                          type='button'
                          onClick={() =>
                            actualizarCapitulo(capSel.key, { borrador: valor })
                          }
                          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors ${
                            capSel.borrador === valor
                              ? valor
                                ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                                : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                              : 'border-white/[0.07] text-neutral-500 hover:text-neutral-200'
                          }`}
                        >
                          <i className={`ti ${icono}`} /> {texto}
                        </button>
                      ))}
                    </div>

                    <Suspense fallback={<Cargando alto={420} />}>
                      {tipo === 'guion' && (
                        <BarraDialogos
                          personajes={personajesLimpios.filter((p) => p.nombre)}
                          editor={() => editoresRef.current[capSel.key]}
                        />
                      )}
                      <MarkdownEditor
                        key={`${capSel.key}-${capSel.v}`}
                        onEditor={(ed) => {
                          editoresRef.current[capSel.key] = ed;
                        }}
                        valorInicial={capSel.contenido}
                        onChange={(md) =>
                          actualizarCapitulo(capSel.key, { contenido: md })
                        }
                        max={CAPITULO_MAX}
                        alto='68vh'
                        barra='creativa'
                        ariaLabel={`Contenido de ${capSel.titulo}`}
                        placeholder={
                          tipo === 'guion'
                            ? 'Escribe la escena… usa los botones de arriba para insertar diálogos y acotaciones.'
                            : 'Escribe el capítulo… cada párrafo se puede comentar por separado.'
                        }
                      />
                    </Suspense>
                  </section>
                ) : (
                  <p className='rounded-[12px] border border-dashed border-white/[0.1] p-6 text-center text-[12.5px] text-neutral-600'>
                    Agrega tu primer {unidad.toLowerCase()} para empezar a
                    escribir.
                  </p>
                )}
              </div>
            </div>
          )}

          {mostrarDatos && (
            <>
              <Campo label='Descripción (opcional)'>
                <Suspense fallback={<Cargando alto={140} />}>
                  <MarkdownEditor
                    valorInicial={descripcion}
                    onChange={setDescripcion}
                    max={DESCRIPCION_MAX}
                    barra='creativa'
                    ariaLabel='Descripción de la obra'
                    placeholder='Cuenta de qué trata, cómo la creaste, créditos…'
                  />
                </Suspense>
              </Campo>

              <HashtagsInput
                value={hashtagsTexto}
                onChange={setHashtagsTexto}
                error={errorHashtags}
                placeholder='#poesia #teatro'
              />
            </>
          )}

          {error && (
            <p className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-400'>
              {error}
            </p>
          )}

          <div className='mt-1 flex flex-wrap items-center justify-end gap-2'>
            {conCapitulos && paso === 'escribir' && (
              <Button
                type='button'
                variant='ghost'
                icon='ti-arrow-left'
                onClick={() => irAPaso('datos')}
                disabled={enviando}
                className='mr-auto'
              >
                Portada y datos
              </Button>
            )}
            <Button
              type='button'
              variant='ghost'
              onClick={intentarCerrar}
              disabled={enviando}
            >
              Cancelar
            </Button>
            {conCapitulos && paso === 'datos' ? (
              <>
                <Button
                  type='button'
                  onClick={() => guardar('borrador')}
                  disabled={enviando}
                >
                  Guardar borrador
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  icon='ti-arrow-right'
                >
                  Siguiente: escribir
                </Button>
              </>
            ) : (
              <>
                {(!editando || eraBorrador) && (
                  <Button
                    type='button'
                    onClick={() => guardar('borrador')}
                    disabled={enviando}
                  >
                    Guardar borrador
                  </Button>
                )}
                {editando && !eraBorrador && (
                  <Button
                    type='button'
                    onClick={() => guardar('borrador')}
                    disabled={enviando}
                  >
                    Pasar a borrador
                  </Button>
                )}
                <Button
                  type='submit'
                  variant='primary'
                  loading={enviando}
                >
                  {editando && !eraBorrador
                    ? 'Guardar cambios'
                    : textosForm(tipo, esGaleria).publicar}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmandoSalir}
        title={editando ? '¿Descartar los cambios?' : '¿Descartar la obra?'}
        message='Tienes cambios sin guardar. Si sales ahora, se perderán.'
        confirmLabel='Descartar'
        cancelLabel='Seguir editando'
        danger
        onConfirm={onCancel}
        onCancel={() => setConfirmandoSalir(false)}
      />
    </>
  );
}
