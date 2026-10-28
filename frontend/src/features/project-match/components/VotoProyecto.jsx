import VotePill from '@/shared/post/votes/VotePill';
import {
  useInteraccionesProyecto,
  useValoresProyecto,
} from '@/features/project-match/store/interaccionesStore';

export default function VotoProyecto({ proyecto }) {
  const { mi_voto, votos_neto } = useValoresProyecto(proyecto);
  const votar = useInteraccionesProyecto((s) => s.votar);

  function handleVotar(e, tipo) {
    e?.stopPropagation?.();
    votar(proyecto.id, tipo, { mi_voto, votos_neto });
  }

  return (
    <VotePill
      miVoto={mi_voto}
      votosNeto={votos_neto}
      onVotar={handleVotar}
    />
  );
}
