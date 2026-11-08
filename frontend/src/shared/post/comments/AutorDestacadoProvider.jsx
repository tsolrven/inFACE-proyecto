import { useMemo } from 'react';
import { AutorDestacadoContext } from '@/shared/post/comments/autorDestacado';

export default function AutorDestacadoProvider({
  autorId,
  etiqueta,
  children,
}) {
  const valor = useMemo(
    () => (autorId ? { autorId, etiqueta } : null),
    [autorId, etiqueta],
  );
  return (
    <AutorDestacadoContext.Provider value={valor}>
      {children}
    </AutorDestacadoContext.Provider>
  );
}
