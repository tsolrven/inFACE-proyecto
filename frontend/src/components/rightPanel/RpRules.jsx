// lista numerada de reglas

// src/components/rightPanel/RpRules.jsx
//
// Lista numerada de reglas para el panel derecho.
//
// Uso:
//   <RpRules
//     items={[
//       'Busca antes de publicar: revisa si tu duda ya fue respondida.',
//       'Sé específico: incluye contexto, código o enunciado si aplica.',
//       'Respeto entre compañeros, sin lenguaje ofensivo.',
//     ]}
//   />

export default function RpRules({ items = [] }) {
  return (
    <div className="flex flex-col">
      {items.map((rule, index) => (
        <div
          key={index}
          className="flex gap-2 border-t border-white/[0.07] py-1.5 first:border-t-0 first:pt-0"
        >
          <span className="mt-0.5 w-4 flex-shrink-0 text-[10px] font-bold text-pink-500">
            {index + 1}
          </span>
          <span className="text-[11.5px] text-neutral-400">{rule}</span>
        </div>
      ))}
    </div>
  );
}
