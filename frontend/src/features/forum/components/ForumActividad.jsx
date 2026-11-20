import ActividadFeed from '@/shared/post/activity/ActividadFeed';
import HiloCard from '@/features/forum/components/HiloCard';

const rutaDeHilo = (padre) =>
  padre.tipo_contenido === 'hilo' ? `/foro-por-ramos/${padre.id}` : null;

const PUBLICACIONES = {
  label: 'Hilos',
  icono: 'ti-message-circle-2',
  vacio: 'Aún no hay hilos publicados.',
};

// Actividad del perfil en el foro (props: ver ActividadFeed)
export default function ForumActividad(props) {
  return (
    <ActividadFeed
      {...props}
      tipo='hilo'
      publicaciones={PUBLICACIONES}
      renderPublicacion={(hilo) => <HiloCard hilo={hilo} />}
      rutaDeComentario={rutaDeHilo}
    />
  );
}