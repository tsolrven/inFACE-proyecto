import { Navigate, useParams } from 'react-router-dom';
import { rutaHashtag } from '@/shared/lib/hashtags';

// Compatibilidad con los enlaces antiguos /repositorio-materiales/tag/:hashtag
export default function TagMaterialesRedirect() {
  const { hashtag = '' } = useParams();
  return (
    <Navigate
      to={rutaHashtag(hashtag)}
      replace
    />
  );
}
