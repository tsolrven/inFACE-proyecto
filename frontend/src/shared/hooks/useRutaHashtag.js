import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { rutaHashtag as armarRuta } from '@/shared/lib/hashtags';

const COMUNIDAD = /^\/comunidad\/([a-z]+)\/?$/;

// Carrera de la página desde la que se hace clic en un hashtag: la comunidad,
// o la de la página de un hashtag (para navegar de un # a otro sin perderla).
function carreraDeContexto(loc) {
  const comunidad = COMUNIDAD.exec(loc.pathname);
  if (comunidad) return comunidad[1];
  if (loc.pathname.startsWith('/hashtag/')) {
    return new URLSearchParams(loc.search).get('carrera');
  }
  return null;
}

// Devuelve una función con la misma forma que rutaHashtag(tag, pestana) que ya
// incluye la carrera del contexto. Dentro de un modal de detalle, el contexto
// es la página de fondo.
export function useRutaHashtag() {
  const location = useLocation();
  const contexto = location.state?.backgroundLocation ?? location;
  const carrera = carreraDeContexto(contexto);

  return useCallback(
    (tag, pestana) => armarRuta(tag, pestana, carrera),
    [carrera],
  );
}