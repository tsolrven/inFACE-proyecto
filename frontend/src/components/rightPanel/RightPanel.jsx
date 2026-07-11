//! contenedor del panel derecho (ancho, scroll, padding)

export default function RightPanel({ children }) {
  return (
    <aside className="w-[240px] flex-shrink-0 overflow-y-auto border-l border-white/[0.07] bg-[#17171B] p-3.5 flex flex-col gap-3">
      {children}
    </aside>
  );
}





