import { NavLink } from 'react-router-dom';
import { navSections, footerLinks } from '../config/navConfig';

const baseItemClasses =
  'flex items-center gap-2.5 border-l-2 border-transparent px-4 py-2 text-[13px] text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100';

const activeItemClasses =
  'border-pink-500 bg-pink-500/10 font-semibold text-pink-500';

function NavItem({ path, label, icon, beta, end }) {
  return (
    <NavLink
      to={path}
      end={end}
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
      )}
    </NavLink>
  );
}

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
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className='w-[218px] flex-shrink-0 overflow-y-auto border-r border-white/[0.07] bg-[#17171B] py-2'>
      <NavItem
        path='/'
        label='Inicio'
        icon='ti-home'
        end
      />
      <NavItem
        path='/populares'
        label='Populares'
        icon='ti-trending-up'
        beta
      />
      <NavItem
        path='/explorar'
        label='Explorar'
        icon='ti-compass'
        beta
      />

      {navSections.map((section) => (
        <div key={section.title}>
          <div className='my-1.5 mx-4 h-px bg-white/[0.07]' />
          <div className='px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-neutral-600'>
            {section.title}
          </div>
          {section.items.map((item) => (
            <SubNavItem
              key={item.path}
              {...item}
            />
          ))}
        </div>
      ))}

      <div className='my-1.5 mx-4 h-px bg-white/[0.07]' />
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
    </aside>
  );
}
