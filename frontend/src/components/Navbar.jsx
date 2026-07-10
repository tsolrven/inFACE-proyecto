import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function getInitials(nombreUsuario) {
  if (!nombreUsuario) return '?';
  return nombreUsuario
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function Navbar() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = getInitials(usuario?.nombre_usuario);

  return (
    <nav className='sticky top-0 z-[300] flex h-[54px] flex-shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#17171B] px-[18px]'>
      <div className='select-none whitespace-nowrap text-[17px] font-bold tracking-tight text-neutral-100'>
        In<span className='text-pink-500'>FACE</span>
      </div>

      <div className='flex h-[34px] max-w-[420px] flex-1 cursor-text items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3 transition-colors hover:border-white/[0.14]'>
        <i className='ti ti-search text-sm text-neutral-600' />
        <span className='text-[12.5px] text-neutral-600'>
          Buscar en InFACE...
        </span>
      </div>

      <div className='ml-auto flex items-center gap-2'>
        <button
          type='button'
          title='Notificaciones'
          className='flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/[0.07] bg-[#1E1E24] text-neutral-400 transition-colors hover:text-neutral-100'
        >
          <i className='ti ti-bell text-base' />
        </button>

        <div
          className='relative'
          ref={dropdownRef}
        >
          <button
            type='button'
            title='Mi perfil'
            onClick={() => setDropdownOpen((open) => !open)}
            className='flex h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-pink-500/30 bg-pink-500/10 text-xs font-bold text-pink-500 transition-colors hover:border-pink-500'
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className='absolute right-0 top-[44px] w-[206px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'>
              <div className='flex items-center gap-2.5 border-b border-white/[0.07] bg-pink-500/[0.06] px-[15px] py-[13px]'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-pink-500/30 bg-pink-500/10 text-xs font-bold text-pink-500'>
                  {initials}
                </div>
                <div>
                  <div className='text-[13px] font-semibold text-neutral-100'>
                    {usuario?.nombre_usuario || 'Usuario'}
                  </div>
                  <div className='mt-px text-[11px] text-neutral-600'>
                    {usuario?.correo || ''}
                  </div>
                </div>
              </div>

              <DropdownItem
                icon='ti-user'
                label='Ver perfil'
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/perfil');
                }}
              />
              <div className='mx-0 my-0.5 h-px bg-white/[0.07]' />
              <DropdownItem
                icon='ti-pencil'
                label='Editar avatar'
              />
              <div className='mx-0 my-0.5 h-px bg-white/[0.07]' />
              <DropdownItem
                icon='ti-settings'
                label='Ajustes'
              />
              <button
                type='button'
                onClick={logout}
                className='flex w-full items-center gap-2.5 px-[15px] py-[9px] text-left text-[13px] text-red-500 transition-colors hover:bg-red-500/[0.08]'
              >
                <i className='ti ti-logout text-[15px]' />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function DropdownItem({ icon, label, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='group flex w-full items-center gap-2.5 px-[15px] py-[9px] text-left text-[13px] text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-neutral-100'
    >
      <i
        className={`ti ${icon} text-[15px] text-neutral-600 group-hover:text-pink-500`}
      />
      {label}
    </button>
  );
}
