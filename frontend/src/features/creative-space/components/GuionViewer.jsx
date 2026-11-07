import { useState } from 'react';
import MarkdownView from '@/shared/markdown/MarkdownView';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import {
  clasificarBloque,
  separarParrafos,
} from '@/features/creative-space/utils/parrafos';

const COLORES = [
  '#34d399',
  '#60a5fa',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
  '#facc15',
  '#2dd4bf',
  '#f87171',
];

function Avatar({ personaje, color, grande = false }) {
  const tam = grande ? 'h-12 w-12' : 'h-8 w-8';
  return personaje?.imagen_id ? (
    <ImagenObra
      archivoId={personaje.imagen_id}
      className={`${tam} flex-shrink-0 rounded-full border border-white/10`}
    />
  ) : (
    <span
      className={`${tam} flex flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold`}
      style={{ background: `${color}26`, color }}
    >
      {(personaje?.nombre ?? '?').slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function GuionViewer({ obra }) {
  const capitulos = obra.capitulos ?? [];
  const personajes = obra.personajes ?? [];
  const [indice, setIndice] = useState(0);
  const actual = capitulos[indice];

  const colorDe = (nombre) => {
    const i = personajes.findIndex(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase(),
    );
    return COLORES[(i < 0 ? 0 : i) % COLORES.length];
  };
  const personajeDe = (nombre) =>
    personajes.find((p) => p.nombre.toLowerCase() === nombre.toLowerCase());

  return (
    <div className='flex flex-col gap-4'>
      {personajes.length > 0 && (
        <div>
          <h3 className='mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-neutral-500'>
            <i className='ti ti-users' /> Personajes ({personajes.length})
          </h3>
          <div className='grid gap-2 sm:grid-cols-2'>
            {personajes.map((p, i) => (
              <div
                key={p.id}
                className='flex items-center gap-3 rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3 py-2'
              >
                <Avatar
                  personaje={p}
                  color={COLORES[i % COLORES.length]}
                  grande
                />
                <div className='min-w-0'>
                  <div className='text-[13px] font-semibold text-neutral-100'>
                    {p.nombre}
                  </div>
                  {p.descripcion && (
                    <p className='break-words text-[12px] leading-relaxed text-neutral-400'>
                      {p.descripcion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {capitulos.length > 0 && (
        <div>
          <h3 className='mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-neutral-500'>
            <i className='ti ti-list-details' /> Escenas ({capitulos.length})
          </h3>
          <div className='mb-3 flex flex-wrap gap-1.5'>
            {capitulos.map((c, i) => (
              <button
                key={c.id}
                type='button'
                onClick={() => setIndice(i)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  i === indice
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'bg-white/[0.05] text-neutral-400 hover:bg-white/[0.09]'
                }`}
              >
                {i + 1}. {c.titulo}
                {c.borrador && (
                  <span className='ml-1.5 text-[9.5px] font-bold uppercase text-amber-300'>
                    borrador
                  </span>
                )}
              </button>
            ))}
          </div>

          {actual && (
            <div className='-mx-1 sm:mx-0 sm:rounded-[12px] sm:border sm:border-white/[0.07] sm:bg-[#17171B] sm:p-6'>
              <h4 className='mb-4 break-words text-[15px] font-bold text-neutral-100'>
                {indice + 1}. {actual.titulo}
              </h4>
              <div className='flex flex-col gap-3'>
                {separarParrafos(actual.contenido).map((bloque, i) => {
                  const b = clasificarBloque(bloque);
                  if (b.tipo === 'dialogo') {
                    const color = colorDe(b.personaje);
                    return (
                      <div
                        key={i}
                        className='flex items-start gap-2.5'
                      >
                        <Avatar
                          personaje={personajeDe(b.personaje)}
                          color={color}
                        />
                        <div className='min-w-0 flex-1'>
                          <div
                            className='text-[11px] font-bold uppercase tracking-wide'
                            style={{ color }}
                          >
                            {b.personaje}
                          </div>
                          <MarkdownView contenido={b.texto} />
                        </div>
                      </div>
                    );
                  }
                  if (b.tipo === 'acotacion') {
                    return (
                      <div
                        key={i}
                        className='text-center text-[12.5px] italic text-neutral-500'
                      >
                        <MarkdownView contenido={b.texto} />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className='text-neutral-300'
                    >
                      <MarkdownView contenido={b.texto} />
                    </div>
                  );
                })}
              </div>
              <div className='mt-4 flex justify-between border-t border-white/[0.06] pt-3'>
                <button
                  type='button'
                  disabled={indice === 0}
                  onClick={() => setIndice(indice - 1)}
                  className='flex items-center gap-1 text-[12px] text-neutral-400 hover:text-neutral-100 disabled:opacity-30'
                >
                  <i className='ti ti-arrow-left' /> Anterior
                </button>
                <button
                  type='button'
                  disabled={indice >= capitulos.length - 1}
                  onClick={() => setIndice(indice + 1)}
                  className='flex items-center gap-1 text-[12px] text-neutral-400 hover:text-neutral-100 disabled:opacity-30'
                >
                  Siguiente <i className='ti ti-arrow-right' />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
