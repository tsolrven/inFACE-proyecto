import useMediaQuery from '@/shared/hooks/useMediaQuery';

const MAX_INDENT_ESCRITORIO = 6;
const MAX_INDENT_MOVIL = 3;

// Cuántos niveles de respuesta se indentan antes de "Continuar este hilo".
export default function useMaxIndent() {
  const esEscritorio = useMediaQuery('(min-width: 640px)');
  return esEscritorio ? MAX_INDENT_ESCRITORIO : MAX_INDENT_MOVIL;
}
