import { useAuthStore } from '../../stores/authStore';

function getInitials(nombreUsuario) {
  if (!nombreUsuario) return '?';
  return nombreUsuario.trim().slice(0, 2).toUpperCase();
}

export default function QuickUploadBox({ onClick }) {
  const usuario = useAuthStore((s) => s.usuario);

  return (
    <div
      onClick={onClick}
      className='mb-3 flex cursor-pointer items-center gap-3 rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3 transition-colors hover:border-white/[0.12]'
    >
      <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-pink-500/30 bg-pink-500/10 text-xs font-bold text-pink-500'>
        {getInitials(usuario?.nombre_usuario)}
      </div>
      <div className='flex-1 text-[13px] text-neutral-500'>
        ¿Tienes apuntes, guías o código que pueda ayudar a alguien? Compártelos aquí...
      </div>
      <div className='flex items-center gap-1.5 text-neutral-500'>
        <i className='ti ti-upload text-lg' />
        <i className='ti ti-brand-github text-lg' />
        <i className='ti ti-photo text-lg' />
      </div>
    </div>
  );
}
