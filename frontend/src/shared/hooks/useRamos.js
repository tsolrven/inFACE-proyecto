import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarRamosPorCarrera } from '@/shared/api/catalog.api';
import { ubicacionDe } from '@/shared/lib/ramos';
import {
  contieneTodas,
  normalizar,
  palabrasDeBusqueda,
} from '@/shared/lib/texto';

// Ramos de una carrera agrupados por semestre ({ [semestre]: ramo[] }).
// Una sola clave de caché para filtros y formularios: el catálogo no cambia
// durante la sesión, así que no se vuelve a pedir.
export function useRamosCarrera(carreraId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['ramos', carreraId],
    queryFn: () => listarRamosPorCarrera(carreraId),
    enabled: enabled && !!carreraId,
    staleTime: Infinity,
  });
}

// Índice plano (en orden de semestre) y búsqueda por texto: sin tildes ni
// mayúsculas, todas las palabras. El índice se arma una vez por carrera.
export function useBusquedaRamos(ramosPorSemestre, texto) {
  const indice = useMemo(
    () =>
      Object.entries(ramosPorSemestre ?? {}).flatMap(([semestre, ramos]) =>
        ramos.map((ramo) => ({
          ramo,
          ubicacion: ubicacionDe(semestre),
          normal: normalizar(ramo.nombre),
        })),
      ),
    [ramosPorSemestre],
  );

  const palabras = useMemo(() => palabrasDeBusqueda(texto), [texto]);
  const buscando = palabras.length > 0;
  const resultados = useMemo(
    () =>
      buscando ? indice.filter((r) => contieneTodas(r.normal, palabras)) : [],
    [buscando, indice, palabras],
  );

  return { indice, palabras, buscando, resultados };
}