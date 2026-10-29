import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import PageBanner from '@/shared/components/layout/PageBanner';
import { MaterialFeed } from '@/features/materials';
import { ForumFeed } from '@/features/forum';
import { useAuthStore } from '@/shared/auth/authStore';
import { normalizarHashtag, rutaHashtag } from '@/shared/lib/hashtags';

const PESTANAS = [
  { id: 'materiales', label: 'Materiales', icono: 'ti-books' },
  { id: 'foro', label: 'Foro', icono: 'ti-message-circle-2' },
];

export default function HashtagPage() {
  const { nombre = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const usuario = useAuthStore((s) => s.usuario);
  const carreraId = usuario?.carrera_id ?? null;
  const carreraNombre = usuario?.carreras?.[0]?.nombre ?? 'tu carrera';

  const hashtag = normalizarHashtag(nombre);
  const pestana = params.get('pestana') === 'foro' ? 'foro' : 'materiales';

  const modulo =
    pestana === 'foro'
      ? { label: 'Foro por ramos', to: '/foro-por-ramos' }
      : { label: 'Repositorio de materiales', to: '/repositorio-materiales' };

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
        to={rutaHashtag(hashtag, pestana)}
        replace
      />
    );
  }

  function cambiarPestana(id) {
    setParams(id === 'materiales' ? {} : { pestana: id }, { replace: true });
  }

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <PageBanner
        icon='ti-hash'
        title={`#${hashtag}`}
        subtitle={`Publicaciones con #${hashtag} en ${carreraNombre}`}
        breadcrumb={[
          { label: 'Inicio', to: '/' },
          { label: 'Académico' },
          modulo,
          { label: `#${hashtag}` },
        ]}
      />

      <div className='flex gap-1 border-b border-white/[0.06] px-4 pt-2'>
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type='button'
            onClick={() => cambiarPestana(p.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors ${
              pestana === p.id
                ? 'border-pink-500 text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <i className={`ti ${p.icono} text-[15px]`} /> {p.label}
          </button>
        ))}
      </div>

      {pestana === 'materiales' ? (
        <MaterialFeed
          carreraId={carreraId}
          hashtag={hashtag}
        />
      ) : (
        <ForumFeed
          carreraId={carreraId}
          hashtag={hashtag}
          permitirCrear={false}
        />
      )}
    </div>
  );
}
