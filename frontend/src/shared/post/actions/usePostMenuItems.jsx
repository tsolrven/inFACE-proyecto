import { useAuthStore } from '@/shared/auth/authStore';
import { esStaff, puedeEditar, puedeEliminar } from '@/shared/auth/roles';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';

// Acciones del menú ⋯ de cualquier contenido (material, comentario, hilo...).
// No ejecuta nada: cada llamador decide qué hace cada acción.
export default function usePostMenuItems({
  autorId,
  guardado,
  onGuardar,
  onEditar,
  onEliminar,
  onReportar,
  iconSize = 13,
}) {
  const usuario = useAuthStore((s) => s.usuario);
  const esAutor = puedeEditar(usuario, autorId);
  const puedeBorrar = puedeEliminar(usuario, autorId);
  const esModerador = esStaff(usuario?.rol);
  const estiloIcono = { fontSize: iconSize };

  return [
    {
      key: 'guardar',
      label: guardado ? 'Quitar de guardados' : 'Guardar',
      icon: (
        <BookmarkIcon
          filled={guardado}
          className={guardado ? 'text-white' : ''}
          style={estiloIcono}
        />
      ),
      onClick: onGuardar,
    },
    {
      key: 'editar',
      label: 'Editar',
      icon: (
        <i
          className='ti ti-edit'
          style={estiloIcono}
        />
      ),
      onClick: onEditar,
      hidden: !esAutor,
    },
    {
      key: 'eliminar',
      label: esAutor ? 'Eliminar' : 'Eliminar (moderación)',
      icon: (
        <i
          className='ti ti-trash'
          style={estiloIcono}
        />
      ),
      onClick: onEliminar,
      danger: true,
      hidden: !puedeBorrar,
    },
    {
      key: 'reportar',
      label: 'Reportar',
      icon: (
        <i
          className='ti ti-flag'
          style={estiloIcono}
        />
      ),
      onClick: onReportar,
      danger: true,
      hidden: esAutor || esModerador,
    },
  ];
}
