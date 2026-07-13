//! contenedor del panel derecho (ancho, scroll, padding), colapsable igual que el sidebar
//! izquierdo. En mobile no compite por espacio con el contenido principal: se oculta.

import { useUiStore } from '../../stores/uiStore';

export default function RightPanel({ children }) {
  const colapsado = useUiStore((s) => s.panelDerechoColapsado);
  const togglePanel = useUiStore((s) => s.togglePanelDerecho);

  return (
    <aside
      className={`relative hidden flex-shrink-0 flex-col overflow-y-auto border-l border-white/[0.07] bg-[#17171B] transition-[width] duration-200 lg:flex ${
        colapsado ? 'w-[44px]' : 'w-[240px]'
      }`}
    >
      {/* botón para ocultar/mostrar el panel, mismo patrón que el sidebar izquierdo */}
      <button
        onClick={togglePanel}
        title={colapsado ? 'Mostrar panel' : 'Ocultar panel'}
        className={`sticky top-0 z-10 flex flex-shrink-0 items-center justify-center gap-1.5 border-b border-white/[0.07] bg-[#17171B] py-2.5 text-[11px] font-medium text-neutral-500 transition hover:text-neutral-200 ${
          colapsado ? '' : 'px-3.5'
        }`}
      >
        <i
          className={`ti ${colapsado ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'} text-[15px]`}
        />
        {!colapsado && <span>Ocultar panel</span>}
      </button>

      {!colapsado && (
        <div className='flex flex-col gap-3 overflow-y-auto p-3.5'>
          {children}
        </div>
      )}
    </aside>
  );
}
