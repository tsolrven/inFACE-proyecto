// tarjeta genérica con título

// src/components/rightPanel/RpCard.jsx
//
// Tarjeta genérica del panel derecho. Recibe un título, un ícono de Tabler
// y cualquier contenido como children.
//
// Uso:
//   <RpCard title="Acerca de este foro" icon="ti-info-circle">
//     ...contenido...
//   </RpCard>
//
// La prop `iconColor` es opcional — por defecto usa el rosa de la marca.
// Puedes pasarle cualquier clase de color de Tailwind, por ejemplo:
//   iconColor="text-amber-400"   (para el ícono dorado de Anuncios)
//   iconColor="text-blue-400"    (para íconos azules)

export default function RpCard({ title, icon, iconColor = 'text-pink-500', children }) {
  return (
    <div className="rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <i className={`ti ${icon} text-sm ${iconColor}`} />
        <span className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-neutral-400">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
