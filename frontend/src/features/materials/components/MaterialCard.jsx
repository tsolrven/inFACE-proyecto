import { Link, useNavigate, useLocation } from 'react-router-dom';
import { colorPorRamo } from '@/shared/lib/courseColors';
import {
  metaDeBadge,
  resumenDeApunte,
  tipoFiltroDeBadge,
} from '@/features/materials/utils/fileMeta';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useVotar } from '@/shared/post/votes/useVotar';
import ApunteMenu from '@/features/materials/components/ApunteMenu';
import BotonEstrella from '@/shared/post/votes/BotonEstrella';
import { useRutaHashtag } from '@/shared/hooks/useRutaHashtag';
import QuitarGuardadoButton from '@/shared/post/bookmarks/QuitarGuardadoButton';
import { extractoPlano } from '@/shared/markdown/extractoPlano';
import ChipFiltrable from '@/shared/components/ChipFiltrable';
import { useFiltrosStore } from '@/features/materials/store/filtrosStore';

const contar = (n, singular, plural) =>
  `${n} ${n === 1 ? singular : plural}`;

// Tarjeta de catálogo: un resumen del material (el detalle tiene todos sus
// recursos). Ícono grande del tipo con más recursos, chips por tipo con su
// cantidad y métricas abajo. Todo sale de los datos reales del apunte.
// `filtrable` (solo en el feed): el chip del ramo y los de tipo filtran el
// feed; un segundo clic sobre el filtro activo lo quita.
export default function MaterialCard({
  apunte,
  enGuardados = false,
  filtrable = false,
}) {
  const ramoFiltro = useFiltrosStore((s) => s.filtros.ramo_id);
  const tipoFiltro = useFiltrosStore((s) => s.filtros.tipo_archivo);
  const setFiltro = useFiltrosStore((s) => s.setFiltro);
  const navigate = useNavigate();
  const location = useLocation();
  const rutaHashtag = useRutaHashtag();
  const votarMut = useVotar('apunte');

  const ramoColor = colorPorRamo(apunte.ramo?.id);
  const extracto = extractoPlano(apunte.descripcion ?? '');
  const resumen = resumenDeApunte(apunte);
  const principal = resumen.principal;
  const tieneArchivos = apunte.archivos?.length > 0;

  function abrirDetalle() {
    navigate(`/repositorio-materiales/${apunte.id}`, {
      state: { backgroundLocation: location },
    });
  }

  function handleVotar(e) {
    e.stopPropagation();
    votarMut.mutate({ id: apunte.id, tipo: 'up' });
  }

  function alternarFiltro(clave, valor, actual) {
    setFiltro(clave, actual === valor ? null : valor);
  }

  return (
    <div
      data-publicacion
      onClick={abrirDetalle}
      className='relative mb-3 flex cursor-pointer flex-col overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#1E1E24] p-4 transition-colors hover:border-white/[0.14]'
    >
      {enGuardados ? (
        <QuitarGuardadoButton
          tipo='apunte'
          id={apunte.id}
          className='absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/[0.08]'
        />
      ) : (
          <ApunteMenu
            apunte={apunte}
            conCompartir
            className='absolute right-2 top-2 z-10'
          triggerClassName='flex h-7 w-7 items-center justify-center rounded-full text-base text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-200'
        />
      )}

      {/* flex-1: si la fila de la grilla es más alta, este bloque crece y el
          pie con las métricas queda abajo, alineado con la tarjeta vecina */}
      <div className='flex flex-1 gap-3.5 sm:gap-4'>
        {/* ícono del tipo con más recursos */}
        <div
          className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border sm:h-[68px] sm:w-[68px] sm:rounded-2xl'
          style={{
            background: principal.bg,
            borderColor: `${principal.color}33`,
            color: principal.color,
          }}
          aria-hidden='true'
        >
          <i className={`ti ${principal.icon} text-[26px] sm:text-[34px]`} />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='mb-1.5 pr-7'>
            <ChipFiltrable
              onFiltrar={
                filtrable && apunte.ramo
                  ? () => alternarFiltro('ramo_id', apunte.ramo.id, ramoFiltro)
                  : undefined
              }
              activo={!!apunte.ramo && ramoFiltro === apunte.ramo.id}
              titulo={`Ver solo materiales de ${apunte.ramo?.nombre}`}
              className='inline-block max-w-full truncate rounded-full px-2 py-0.5 align-top text-[10px] font-bold tracking-wide'
              style={{ background: `${ramoColor}22`, color: ramoColor }}
            >
              {apunte.ramo?.nombre}
            </ChipFiltrable>
          </div>

          <h3 className='line-clamp-2 break-words text-[15px] font-bold leading-snug text-neutral-50'>
            {apunte.titulo}
          </h3>

          <div className='mt-0.5 flex flex-wrap items-center gap-x-1 text-[11.5px] text-neutral-500'>
            <Link
              to={`/perfil/usuario/${apunte.autor?.nombre_usuario}`}
              onClick={(e) => e.stopPropagation()}
              className='font-semibold text-neutral-400 transition hover:text-neutral-100 hover:underline'
            >
              u/{apunte.autor?.nombre_usuario}
            </Link>
            <span>· {formatearTiempoRelativo(apunte.creado_en)}</span>
            {apunte.editado_en && (
              <span className='text-neutral-600'>· editado</span>
            )}
          </div>

          {extracto && (
            <p className='mt-1.5 line-clamp-2 break-words text-[12.5px] leading-relaxed text-neutral-400'>
              {extracto}
            </p>
          )}

          {resumen.tipos.length > 0 && (
            <div className='mt-2.5 flex flex-wrap gap-1.5'>
              {resumen.tipos.map(({ valor, cantidad }) => {
                const meta = metaDeBadge(valor);
                if (!meta) return null;
                const tipo = tipoFiltroDeBadge(valor);
                return (
                  <ChipFiltrable
                    key={valor}
                    onFiltrar={
                      filtrable
                        ? () => alternarFiltro('tipo_archivo', tipo, tipoFiltro)
                        : undefined
                    }
                    activo={tipoFiltro === tipo}
                    titulo={`Ver solo: ${meta.label}`}
                    className='flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold'
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <i className={`ti ${meta.icon} text-[11px]`} />
                    {meta.label}
                    {/* el fragmento de código es siempre uno */}
                    {valor !== 'codigo' && (
                      <span className='opacity-70'>×{cantidad}</span>
                    )}
                  </ChipFiltrable>
                );
              })}
            </div>
          )}

          {apunte.hashtags?.length > 0 && (
            // una sola línea; lo que no cabe se recorta
            <div className='mt-2 truncate text-[11px]'>
              {apunte.hashtags.map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(rutaHashtag(tag, 'materiales'));
                  }}
                  className='mr-1.5 text-blue-400 hover:underline'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.05] pt-3 text-[11.5px] text-neutral-500'>
        <BotonEstrella
          miVoto={apunte.mi_voto}
          total={apunte.votos_neto}
          onVotar={handleVotar}
        />

        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            abrirDetalle();
          }}
          className='flex items-center gap-1 transition-colors hover:text-neutral-200'
        >
          <i className='ti ti-message-circle-2 text-[14px]' />
          {contar(apunte.comentarios_count ?? 0, 'comentario', 'comentarios')}
        </button>

        {tieneArchivos && (
          <span className='flex items-center gap-1'>
            <i className='ti ti-download text-[14px]' />
            {contar(apunte.descargas ?? 0, 'descarga', 'descargas')}
          </span>
        )}

        {resumen.total > 0 && (
          <span className='flex items-center gap-1'>
            <i className='ti ti-files text-[14px]' />
            {contar(resumen.total, 'recurso', 'recursos')}
          </span>
        )}
      </div>
    </div>
  );
}