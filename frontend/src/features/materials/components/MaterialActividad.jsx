import ActividadFeed from '@/shared/post/activity/ActividadFeed';
import MaterialCard from '@/features/materials/components/MaterialCard';

const rutaDeApunte = (padre) =>
  padre.tipo_contenido === 'apunte'
    ? `/repositorio-materiales/${padre.id}`
    : null;

const PUBLICACIONES = {
  label: 'Materiales',
  icono: 'ti-file-text',
  vacio: 'Aún no hay materiales publicados.',
};

// Actividad del perfil en el repositorio (props: ver ActividadFeed)
export default function MaterialActividad(props) {
  return (
    <ActividadFeed
      {...props}
      tipo='apunte'
      publicaciones={PUBLICACIONES}
      renderPublicacion={(apunte) => <MaterialCard apunte={apunte} />}
      rutaDeComentario={rutaDeApunte}
    />
  );
}