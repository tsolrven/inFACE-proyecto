import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import CommentsSection from '@/shared/post/comments/CommentsSection';

export default function ProyectoComentarios({
  proyectoId,
  total = 0,
  onConteoCambio,
}) {
  // Entrada mínima en el caché de React Query con la forma { id, comentarios_count }.
  // Cada vez que se comenta o elimina, los hooks de master (parchearContenido)
  // buscan el contenido ['proyecto', ...] con este id y le ajustan el contador.
  const { data } = useQuery({
    queryKey: ['proyecto', 'contador', proyectoId],
    queryFn: () => ({ id: proyectoId, comentarios_count: total }),
    initialData: { id: proyectoId, comentarios_count: total },
    staleTime: Infinity,
    enabled: false,
  });

  const conteo = data?.comentarios_count ?? total;

  // Pasa el número a tu store (Zustand) para que el detalle y la tarjeta se actualicen.
  useEffect(() => {
    onConteoCambio?.(conteo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conteo]);

  return (
    <div className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-4 sm:p-6'>
      <CommentsSection
        tipoContenido='proyecto'
        contenidoId={proyectoId}
        total={conteo}
        titulo='Comentarios'
        placeholder='Escribe un comentario o una pregunta sobre este proyecto...'
        textoVacio='Todavía no hay comentarios. ¡Sé el primero en preguntar!'
      />
    </div>
  );
}
