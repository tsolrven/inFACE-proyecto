import { Link } from 'react-router-dom';
import RpCard from '@/shared/components/layout/RpCard';
import { useHashtagsPopulares } from '@/shared/statistics/useEstadisticas';
import { rutaHashtag } from '@/shared/lib/hashtags';

// pestaña de la página del hashtag que corresponde a cada módulo
const PESTANA_HASHTAG = {
  apunte: 'materiales',
  hilo: 'foro',
  anuncio: 'anuncios',
};

// tipo: 'apunte' | 'hilo' | 'anuncio'
// carreraCodigo (opcional): código de la comunidad, para que el link al
// hashtag abra esa carrera y no la del usuario (rutaHashtag)
// etiquetaModulo (opcional): ver TopColaboradoresCard
export default function TagsPopularesCard({
  tipo,
  carreraId,
  carreraCodigo,
  etiquetaModulo,
}) {
  const { data, isPending, isError } = useHashtagsPopulares(tipo, carreraId);
  const tags = data?.hashtags ?? [];

  return (
    <RpCard
      title={
        etiquetaModulo ? `Tags populares · ${etiquetaModulo}` : 'Tags populares'
      }
      icon='ti-hash'
    >
      {isPending && carreraId ? (
        <p className='text-[11.5px] text-neutral-600'>Cargando...</p>
      ) : isError ? (
        <p className='text-[11.5px] text-neutral-600'>
          No se pudieron cargar los tags.
        </p>
      ) : tags.length === 0 ? (
        <p className='text-[11.5px] text-neutral-600'>
          Aún no hay tags usados en los últimos {data?.dias ?? 30} días.
        </p>
      ) : (
        <div className='flex flex-wrap gap-1.5'>
          {tags.map(({ nombre }) => (
            <Link
              key={nombre}
              to={rutaHashtag(
                nombre,
                PESTANA_HASHTAG[tipo],
                carreraCodigo ?? null,
              )}
              className='cursor-pointer rounded-full border border-transparent bg-[#2A2A32] px-2.5 py-0.5 text-[11px] text-neutral-500 transition-colors hover:border-white/[0.07] hover:bg-white/[0.06] hover:text-neutral-100'
            >
              #{nombre}
            </Link>
          ))}
        </div>
      )}
    </RpCard>
  );
}