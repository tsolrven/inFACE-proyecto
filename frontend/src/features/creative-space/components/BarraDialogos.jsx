export default function BarraDialogos({ personajes, editor }) {
  function insertar(parrafo) {
    const ed = editor();
    if (!ed) return;
    ed.chain().focus().insertContent(parrafo).run();
  }

  const dialogo = (nombre) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: `{{${nombre}}} ` }],
  });
  function insertarAcotacion() {
    const ed = editor();
    if (!ed) return;
    ed.chain()
      .focus()
      .insertContent({
        type: 'paragraph',
        content: [{ type: 'text', text: '()', marks: [{ type: 'italic' }] }],
      })
      .run();
    ed.commands.setTextSelection(ed.state.selection.from - 1);
  }

  return (
    <div className='mb-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1.5'>
      <span className='text-[11px] font-semibold text-neutral-500'>
        Insertar:
      </span>
      {personajes.length === 0 && (
        <span className='text-[11px] text-neutral-600'>
          agrega personajes arriba para usarlos como diálogo
        </span>
      )}
      {personajes.map((p) => (
        <button
          key={p.id ?? p.nombre}
          type='button'
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertar(dialogo(p.nombre))}
          className='rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-emerald-300 hover:bg-emerald-400/20'
        >
          {p.nombre}
        </button>
      ))}
      <button
        type='button'
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertarAcotacion}
        className='ml-auto rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[11.5px] text-neutral-300 hover:bg-white/[0.12]'
      >
        <i className='ti ti-theater' /> Acotación
      </button>
    </div>
  );
}
