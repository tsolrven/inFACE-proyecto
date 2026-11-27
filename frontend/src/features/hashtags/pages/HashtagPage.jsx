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
import { inputClasses } from '@/shared/components/form/inputClasses';
import { normalizarHashtag, rutaHashtag } from '@/shared/lib/hashtags';

const PESTANAS = [
  { id: 'materiales', label: 'Materiales', icono: 'ti-books' },
  { id: 'foro', label: 'Foro', icono: 'ti-message-circle-2' },
  { id: 'anuncios', label: 'Anuncios', icono: 'ti-speakerphone' },
];

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
  // una pestaña desconocida (?pestana=xyz) cae en Materiales
  const pedida = params.get('pestana');
  const pestana = PESTANAS.some((p) => p.id === pedida) ? pedida : 'materiales';
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
    if (id === 'materiales') siguiente.delete('pestana');
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
      />

      <Pestanas
        pestanas={PESTANAS}
        activa={pestana}
        onCambiar={cambiarPestana}
        rightContent={
          <div className='flex w-40 items-center gap-2 sm:w-64'>
            <label
              htmlFor='hashtag-carrera'
              className='hidden whitespace-nowrap text-[12px] text-neutral-500 sm:inline'
            >
              Carrera
            </label>
            <select
              id='hashtag-carrera'
              value={carrera?.codigo ?? ''}
              onChange={(e) => cambiarCarrera(e.target.value)}
              title={carrera?.codigo?.toUpperCase() ?? 'Elige una carrera'}
              className={`${inputClasses} h-9 min-w-0 truncate py-1 text-[12px]`}
            >
              {!carrera && (
                <option
                  value=''
                  disabled
                >
                  Elige una carrera...
                </option>
              )}
              {carreras.map((c) => (
                <option
                  key={c.id}
                  value={c.codigo}
                >
                  {c.codigo.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        }
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