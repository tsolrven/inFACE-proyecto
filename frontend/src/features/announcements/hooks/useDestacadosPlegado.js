import { useState } from 'react';

const PREFIJO = 'inface:destacados:';

// { plegado, vistos }: lo que el usuario vio la última vez que plegó o desplegó
function leerEstado(carreraId) {
  try {
    const crudo = JSON.parse(localStorage.getItem(PREFIJO + carreraId));
    return {
      plegado: crudo?.plegado === true,
      vistos: Array.isArray(crudo?.vistos) ? crudo.vistos : [],
    };
  } catch {
    return { plegado: false, vistos: [] };
  }
}

function guardarEstado(carreraId, estado) {
  try {
    localStorage.setItem(PREFIJO + carreraId, JSON.stringify(estado));
  } catch {
    // sin almacenamiento: no se recuerda, y no pasa nada
  }
}

// Plegado de la fila de destacados, recordado por carrera. Si aparece un
// destacado que el usuario no había visto, la fila se muestra abierta.
export function useDestacadosPlegado(carreraId, anuncios) {
  const [guardado, setGuardado] = useState(() => ({
    carreraId,
    ...leerEstado(carreraId),
  }));

  // al cambiar de carrera se lee el estado de la nueva (durante el render,
  // sin efecto: así nunca se muestra un render con el estado de la anterior)
  let actual = guardado;
  if (guardado.carreraId !== carreraId) {
    actual = { carreraId, ...leerEstado(carreraId) };
    setGuardado(actual);
  }

  const ids = anuncios.map((a) => a.id);
  const hayNuevo = ids.some((id) => !actual.vistos.includes(id));
  const abierto = !actual.plegado || hayNuevo;

  function alternar() {
    const nuevo = { plegado: abierto, vistos: ids };
    setGuardado({ carreraId, ...nuevo });
    guardarEstado(carreraId, nuevo);
  }

  return { abierto, alternar };
}