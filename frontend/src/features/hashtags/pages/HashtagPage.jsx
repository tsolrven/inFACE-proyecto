import { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useBusqueda } from '@/shared/hooks/useBusqueda';
import { BUSQUEDA_MAX } from '@/shared/lib/busqueda';
import { useQuery } from '@tanstack/react-query';
import PageBanner from '@/shared/components/layout/PageBanner';
import Pestanas from '@/shared/components/ui/Pestanas';
import { MaterialFeed } from '@/features/materials';
import { ForumFeed } from '@/features/forum';
import { AnnouncementsFeed } from '@/features/announcements';
import { listarCarreras } from '@/shared/api/catalog.api';
import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES } from '@/shared/auth/roles';
import { normalizarHashtag, rutaHashtag } from '@/shared/lib/hashtags';
import SelectorCarrera from '@/features/hashtags/components/SelectorCarrera';

// mismo orden que en las comunidades
const PESTANAS = [
  { id: 'foro', label: 'Foro', icono: 'ti-message-circle-2' },
  { id: 'materiales', label: 'Materiales', icono: 'ti-books' },
  { id: 'anuncios', label: 'Anuncios', icono: 'ti-speakerphone' },
];

// color de cada módulo (el mismo de ACENTO_MODULO en ComunidadCarrera);
// clases escritas completas para que Tailwind las detecte
const ACENTO_PESTANA = {
  foro: 'border-emerald-400',
  materiales: 'border-blue-400',
  anuncios: 'border-amber-400',
};

// texto de la carrera elegida en el selector: el color de la pestaña
const TEXTO_PESTANA = {
  foro: 'text-emerald-400',
  materiales: 'text-blue-400',
  anuncios: 'text-amber-400',
};

// Módulo al que pertenece cada pestaña (para el breadcrumb)
const MODULOS = {
  materiales: {
    label: 'Repositorio de materiales',
    to: '/repositorio-materiales',
  },
  foro: { label: 'Foro por ramos', to: '/foro-por-ramos' },
  anuncios: { label: 'Anuncios oficiales', to: '/anuncios-oficiales' },
};

export default function HashtagPage() {
  const { nombre = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const usuario = useAuthStore((s) => s.usuario);
  const esSuperadmin = usuario?.rol === ROLES.SUPERADMIN;

  const {
    data: carreras = [],
    isPending: cargandoCarreras,
    isError: errorCarreras,
  } = useQuery({
    queryKey: ['carreras'],
    queryFn: () => listarCarreras(),
    staleTime: 10 * 60 * 1000,
  });

  const hashtag = normalizarHashtag(nombre);

  // El texto pertenece al hashtag en que se escribió: al pasar a otro hashtag
  // (misma ruta, mismo componente) vuelve a vacío; al cambiar de pestaña o de
  // carrera se conserva. Antes de los return tempranos (reglas de los hooks).
  const [busquedaGuardada, setBusquedaGuardada] = useState({
    hashtag,
    texto: '',
  });
  const textoBusqueda =
    busquedaGuardada.hashtag === hashtag ? busquedaGuardada.texto : '';
  const setTextoBusqueda = (texto) => setBusquedaGuardada({ hashtag, texto });
  const busqueda = useBusqueda(textoBusqueda);
  // sin pestaña, o una desconocida (?pestana=xyz), cae en Foro
  const pedida = params.get('pestana');
  const pestana = PESTANAS.some((p) => p.id === pedida) ? pedida : 'foro';
  const modulo = MODULOS[pestana];

  // Carrera mostrada: la de ?carrera=<código> si es válida; si no, la del
  // usuario (el superadmin también elige carrera al registrarse). Si no tiene
  // ninguna, debe elegirla.
  const codigoPedido = params.get('carrera')?.toLowerCase() ?? null;
  const carreraPedida = carreras.find(
    (c) => c.codigo.toLowerCase() === codigoPedido,
  );
  const carreraPropia = carreras.find((c) => c.id === usuario?.carrera_id);
  const carrera = carreraPedida ?? carreraPropia ?? null;
  // fuera de la carrera propia (o siendo superadmin) el contexto es la comunidad
  const enComunidad = !!carrera && (esSuperadmin || carrera.id !== carreraPropia?.id);

  // /hashtag/Cálculo -> /hashtag/calculo (la misma forma que guarda el backend)
  if (!hashtag)
    return (
      <Navigate
        to='/'
        replace
      />
    );
  if (hashtag !== nombre) {
    return (
      <Navigate
        to={rutaHashtag(hashtag, pestana, codigoPedido)}
        replace
      />
    );
  }

  function cambiarPestana(id) {
    const siguiente = new URLSearchParams(params);
    if (id === 'foro') siguiente.delete('pestana');
    else siguiente.set('pestana', id);
    setParams(siguiente, { replace: true });
  }

  function cambiarCarrera(codigo) {
    const siguiente = new URLSearchParams(params);
    siguiente.set('carrera', codigo.toLowerCase());
    setParams(siguiente, { replace: true });
  }

  // la comunidad abre en Foro por defecto; las otras pestañas van en la URL
  const rutaComunidad = carrera
    ? `/comunidad/${carrera.codigo.toLowerCase()}${pestana === 'foro' ? '' : `?pestana=${pestana}`
    }`
    : null;

  let breadcrumb = [
    { label: 'Inicio', to: '/' },
    { label: 'Académico' },
    modulo,
    { label: `#${hashtag}` },
  ];
  if (enComunidad) {
    breadcrumb = [
      { label: 'Inicio', to: '/' },
      { label: 'Comunidades' },
      { label: carrera.nombre, to: rutaComunidad },
      { label: `#${hashtag}` },
    ];
  } else if (esSuperadmin) {
    breadcrumb = [
      { label: 'Inicio', to: '/' },
      { label: 'Comunidades' },
      { label: `#${hashtag}` },
    ];
  }

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <PageBanner
        icon='ti-hash'
        title={`#${hashtag}`}
        subtitle={
          carrera
            ? `Publicaciones con #${hashtag} en ${carrera.nombre}`
            : `Publicaciones con #${hashtag}`
        }
        searchPlaceholder={`Buscar en #${hashtag}...`}
        searchValue={textoBusqueda}
        onSearchChange={setTextoBusqueda}
        searchMaxLength={BUSQUEDA_MAX}
        breadcrumb={breadcrumb}
        extra={
          <SelectorCarrera
            carreras={carreras}
            carrera={carrera}
            onCambiar={cambiarCarrera}
            colorActivo={TEXTO_PESTANA[pestana]}
          />
        }
      />

      <Pestanas
        pestanas={PESTANAS}
        activa={pestana}
        onCambiar={cambiarPestana}
        acento={ACENTO_PESTANA[pestana]}
      />

      {cargandoCarreras && (
        <div className='flex flex-1 items-center justify-center'>
          <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
        </div>
      )}
      {!cargandoCarreras && !carrera && (
        <div className='flex flex-1 items-center justify-center px-6 text-center text-[13px] text-neutral-500'>
          {errorCarreras
            ? 'No se pudieron cargar las carreras.'
            : `Elige una carrera para ver las publicaciones con #${hashtag}.`}
        </div>
      )}
      {carrera && pestana === 'materiales' && (
        <MaterialFeed
          carreraId={carrera.id}
          hashtag={hashtag}
          busqueda={busqueda}
        />
      )}
      {carrera && pestana === 'foro' && (
        <ForumFeed
          carreraId={carrera.id}
          hashtag={hashtag}
          busqueda={busqueda}
          permitirCrear={false}
        />
      )}
      {carrera && pestana === 'anuncios' && (
        <AnnouncementsFeed
          carreraId={carrera.id}
          hashtag={hashtag}
          busqueda={busqueda}
          permitirCrear={false}
        />
      )}
    </div>
  );
}