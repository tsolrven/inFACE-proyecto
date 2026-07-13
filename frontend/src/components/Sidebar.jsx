import { NavLink } from 'react-router-dom';
import { navSections, footerLinks } from '../config/navConfig';
import { useUiStore } from '../stores/uiStore';

const baseItemClasses =
  'flex items-center gap-2.5 border-l-2 border-transparent px-4 py-2 text-[13px] text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100';

const activeItemClasses =
  'border-pink-500 bg-pink-500/10 font-semibold text-pink-500';

function NavItem({ path, label, icon, beta, end, colapsado, onNavigate }) {
  return (
    <NavLink
      to={path}
      end={end}
      title={colapsado ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${baseItemClasses} ${colapsado ? 'justify-center px-0' : ''} ${isActive ? activeItemClasses : ''}`
      }
    >
      <i className={`ti ${icon} flex-shrink-0 text-base`} />
      {!colapsado && (
        <>
          <span className='flex-1'>{label}</span>
          {beta && (
            <span className='rounded border border-pink-500/30 bg-pink-500/15 px-1.5 py-px text-[9px] font-bold tracking-wide text-pink-500'>
              Beta
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SubNavItem({ path, label, icon, colapsado, onNavigate }) {
  return (
    <NavLink
      to={path}
      title={colapsado ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2 border-l-2 border-transparent py-1.5 text-[12.5px] text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100 ${
          colapsado ? 'justify-center px-0' : 'pl-[30px] pr-4'
        } ${isActive ? 'border-pink-500 bg-pink-500/10 font-semibold text-pink-500' : ''}`
      }
    >
      <i className={`ti ${icon} flex-shrink-0 text-sm`} />
      {!colapsado && <span>{label}</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const colapsado = useUiStore((s) => s.sidebarColapsado);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const abiertoMovil = useUiStore((s) => s.sidebarMovilAbierto);
  const cerrarSidebarMovil = useUiStore((s) => s.cerrarSidebarMovil);

  // en mobile el sidebar se comporta como un cajón que se cierra solo al navegar
  const onNavigate = () => cerrarSidebarMovil();

  return (
    <>
      {/* fondo oscuro detrás del cajón, solo en mobile y solo cuando está abierto */}
      {abiertoMovil && (
        <div
          onClick={cerrarSidebarMovil}
          className='fixed inset-0 z-[220] bg-black/60 lg:hidden'
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[230] flex w-[240px] -translate-x-full flex-col overflow-y-auto overflow-x-hidden border-r border-white/[0.07] bg-[#17171B] py-2 transition-transform duration-200
          lg:sticky lg:inset-y-auto lg:z-auto lg:h-full lg:flex-shrink-0 lg:translate-x-0 lg:transition-[width]
          ${abiertoMovil ? 'translate-x-0' : ''}
          ${colapsado ? 'lg:w-[56px]' : 'lg:w-[218px]'}
        `}
      >
        {/* botón de cerrar, solo visible en el cajón mobile */}
        <button
          onClick={cerrarSidebarMovil}
          className='ml-auto mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/5 hover:text-neutral-100 lg:hidden'
        >
          <i className='ti ti-x text-base' />
        </button>

        <NavItem
          path='/'
          label='Inicio'
          icon='ti-home'
          end
          colapsado={colapsado}
          onNavigate={onNavigate}
        />
        <NavItem
          path='/populares'
          label='Populares'
          icon='ti-trending-up'
          beta
          colapsado={colapsado}
          onNavigate={onNavigate}
        />
        <NavItem
          path='/explorar'
          label='Explorar'
          icon='ti-compass'
          beta
          colapsado={colapsado}
          onNavigate={onNavigate}
        />

        {navSections.map((section) => (
          <div key={section.title}>
            <div className='my-1.5 mx-4 h-px bg-white/[0.07]' />
            {!colapsado && (
              <div className='px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-neutral-600'>
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <SubNavItem
                key={item.path}
                {...item}
                colapsado={colapsado}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}

        <div className='my-1.5 mx-4 h-px bg-white/[0.07]' />
        {!colapsado && (
          <div className='flex flex-col gap-0.5 px-4 py-2'>
            {footerLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `py-0.5 text-[11px] transition-colors ${
                    isActive
                      ? 'text-pink-500'
                      : 'text-neutral-600 hover:text-neutral-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* botón para ocultar/mostrar el sidebar — solo tiene sentido en escritorio */}
        <button
          onClick={toggleSidebar}
          title={colapsado ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
          className='sticky bottom-0 mt-2 hidden w-full items-center justify-center gap-1.5 border-t border-white/[0.07] bg-[#17171B] py-2.5 text-[11px] font-medium text-neutral-500 transition hover:text-neutral-200 lg:flex'
        >
          <i
            className={`ti ${colapsado ? 'ti-layout-sidebar-left-expand' : 'ti-layout-sidebar-left-collapse'} text-[15px]`}
          />
          {!colapsado && <span>Ocultar</span>}
        </button>
      </aside>
    </>
  );
}
