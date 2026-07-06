// grilla 2x2 de estadísticas

// src/components/rightPanel/RpStats.jsx
//
// Grilla 2x2 de estadísticas para el panel derecho.
//
// Uso:
//   <RpStats
//     items={[
//       { num: '24',  label: 'preguntas' },
//       { num: '18',  label: 'resueltas' },
//       { num: '312', label: 'miembros'  },
//       { num: '75%', label: 'tasa resp.' },
//     ]}
//   />
//
// Acepta entre 2 y 4 items. Si pasas 2, quedan centrados en una fila.

export default function RpStats({ items = [] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {items.map(({ num, label }) => (
        <div
          key={label}
          className="rounded-md bg-[#2A2A32] px-2 py-1.5 text-center"
        >
          <div className="text-[15px] font-bold text-neutral-100">{num}</div>
          <div className="text-[10px] text-neutral-600">{label}</div>
        </div>
      ))}
    </div>
  );
}
