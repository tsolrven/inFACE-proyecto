import { NavLink } from 'react-router-dom';
import { navSections, footerLinks } from '../config/navConfig';
<<<<<<< HEAD
=======
import { useUiStore } from '../stores/uiStore';
>>>>>>> master-deploy

const baseItemClasses =
  'flex items-center gap-2.5 border-l-2 border-transparent px-4 py-2 text-[13px] text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100';

const activeItemClasses =
  'border-pink-500 bg-pink-500/10 font-semibold text-pink-500';

<<<<<<< HEAD
function NavItem({ path, label, icon, beta, end }) {
=======
function NavItem({ path, label, icon, beta, end, colapsado }) {
>>>>>>> master-deploy
  return (
    <NavLink
      to={path}
      end={end}
<<<<<<< HEAD
      className={({ isActive }) =>
        `${baseItemClasses} ${isActive ? activeItemClasses : ''}`
      }
    >
      <i className={`ti ${icon} flex-shrink-0 text-base`} />
      <span className='flex-1'>{label}</span>
      {beta && (
        <span className='rounded border border-pink-500/30 bg-pink-500/15 px-1.5 py-px text-[9px] font-bold tracking-wide text-pink-500'>
          Beta
        </span>
=======
      title={colapsado ? label : undefined}
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
>>>>>>> master-deploy
      )}
    </NavLink>
  );
}

<<<<<<< HEAD
function SubNavItem({ path, label, icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-2 border-l-2 border-transparent py-1.5 pl-[30px] pr-4 text-[12.5px] text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100 ${
          isActive
            ? 'border-pink-500 bg-pink-500/10 font-semibold text-pink-500'
            : ''
        }`
      }
    >
      <i className={`ti ${icon} flex-shrink-0 text-sm`} />
      <span>{label}</span>
=======
function SubNavItem({ path, label, icon, colapsado }) {
  return (
    <NavLink
      to={path}
      title={colapsado ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-2 border-l-2 border-transparent py-1.5 text-[12.5px] text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100 ${colapsado ? 'justify-center px-0' : 'pl-[30px] pr-4'
        } ${isActive ? 'border-pink-500 bg-pink-500/10 font-semibold text-pink-500' : ''}`
      }
    >
      <i className={`ti ${icon} flex-shrink-0 text-sm`} />
      {!colapsado && <span>{label}</span>}
>>>>>>> master-deploy
    </NavLink>
  );
}

export default function Sidebar() {
<<<<<<< HEAD
  return (
    <aside className='w-[218px] flex-shrink-0 overflow-y-auto border-r border-white/[0.07] bg-[#17171B] py-2'>
=======
  const colapsado = useUiStore((s) => s.sidebarColapsado);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={`relative flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-white/[0.07] bg-[#17171B] py-2 transition-[width] duration-200 ${colapsado ? 'w-[56px]' : 'w-[218px]'
        }`}
    >
>>>>>>> master-deploy
      <NavItem
        path='/'
        label='Inicio'
        icon='ti-home'
        end
<<<<<<< HEAD
=======
        colapsado={colapsado}
>>>>>>> master-deploy
      />
      <NavItem
        path='/populares'
        label='Populares'
        icon='ti-trending-up'
        beta
<<<<<<< HEAD
=======
        colapsado={colapsado}
>>>>>>> master-deploy
      />
      <NavItem
        path='/explorar'
        label='Explorar'
        icon='ti-compass'
        beta
<<<<<<< HEAD
=======
        colapsado={colapsado}
>>>>>>> master-deploy
      />

      {navSections.map((section) => (
        <div key={section.title}>
          <div className='my-1.5 mx-4 h-px bg-white/[0.07]' />
<<<<<<< HEAD
          <div className='px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-neutral-600'>
            {section.title}
          </div>
=======
          {!colapsado && (
            <div className='px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-neutral-600'>
              {section.title}
            </div>
          )}
>>>>>>> master-deploy
          {section.items.map((item) => (
            <SubNavItem
              key={item.path}
              {...item}
<<<<<<< HEAD
=======
              colapsado={colapsado}
>>>>>>> master-deploy
            />
          ))}
        </div>
      ))}

      <div className='my-1.5 mx-4 h-px bg-white/[0.07]' />
<<<<<<< HEAD
      <div className='flex flex-col gap-0.5 px-4 py-2'>
        {footerLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
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
=======
      {!colapsado && (
        <div className='flex flex-col gap-0.5 px-4 py-2'>
          {footerLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `py-0.5 text-[11px] transition-colors ${isActive
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

      {/* botón para ocultar/mostrar el sidebar */}
      <button
        onClick={toggleSidebar}
        title={colapsado ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
        className='sticky bottom-0 mt-2 flex w-full items-center justify-center gap-1.5 border-t border-white/[0.07] bg-[#17171B] py-2.5 text-[11px] font-medium text-neutral-500 transition hover:text-neutral-200'
      >
        <i className={`ti ${colapsado ? 'ti-layout-sidebar-left-expand' : 'ti-layout-sidebar-left-collapse'} text-[15px]`} />
        {!colapsado && <span>Ocultar</span>}
      </button>
>>>>>>> master-deploy
    </aside>
  );
}
