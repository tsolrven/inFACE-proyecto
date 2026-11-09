import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import BotonVolver from '@/features/creative-space/components/BotonVolver';
import ObraForm from '@/features/creative-space/components/ObraForm';
import { useObra } from '@/features/creative-space/hooks/useObras';
import { TIPOS_OBRA, TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import {
  ESPACIO_POR_ID,
  rutas,
} from '@/features/creative-space/utils/espacios';

// Nueva obra (/espacio-creativo/nueva?tipo=...) o edición (/obra/:id/editar).
// Sin tipo en la dirección, primero se elige qué se va a publicar.
export default function ObraEditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { data: obra, isPlaceholderData, error } = useObra(id);
  const tipo = params.get('tipo');
  const tipoValido = TIPOS_OBRA.some((t) => t.id === tipo) ? tipo : null;
  // ?espacio=escritura → el selector muestra solo lo que se puede crear ahí
  const espacio = ESPACIO_POR_ID[params.get('espacio')] ?? null;
  const opciones = (espacio ? espacio.crear : TIPOS_OBRA.map((t) => t.id))
    .filter((t) => t !== 'album') // el álbum se elige dentro de Música
    .map((t) => TIPO_POR_ID[t]);

  const volver = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(id ? rutas.obra(id) : rutas.inicio, { replace: true });
  };
  const alGuardar = (guardada) =>
    navigate(rutas.obra(guardada?.id ?? id), { replace: true });

  let contenido;
  if (id) {
    // edición: se necesita la obra COMPLETA (en la lista viene recortada)
    if (error) {
      contenido = (
        <div className='mx-auto w-full max-w-[760px]'>
          <BotonVolver />
          <p className='p-8 text-center text-sm text-red-400'>
            {error.message}
          </p>
        </div>
      );
    } else if (!obra || isPlaceholderData) {
      contenido = (
        <div className='flex items-center justify-center py-20 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      );
    } else {
      contenido = (
        <ObraForm
          key={obra.id}
          obra={obra}
          onCancel={volver}
          onGuardado={alGuardar}
        />
      );
    }
  } else if (tipoValido) {
    contenido = (
      <ObraForm
        key={tipoValido}
        tipoInicial={tipoValido}
        onCancel={volver}
        onGuardado={alGuardar}
      />
    );
  } else if (opciones.length === 1) {
    // una sola opción: no hay nada que elegir
    return (
      <Navigate
        to={rutas.nueva(opciones[0].id)}
        replace
      />
    );
  } else {
    contenido = (
      <div className='mx-auto w-full max-w-[760px]'>
        <div className='mb-4 flex items-center gap-2'>
          <BotonVolver />
        </div>
        <h1 className='mb-4 text-[17px] font-bold text-neutral-100'>
          {espacio?.id === 'escritura'
            ? '¿Qué quieres escribir?'
            : '¿Qué quieres compartir?'}
        </h1>
        <div className='grid gap-2.5 sm:grid-cols-2'>
          {opciones.map((t) => (
            <Link
              key={t.id}
              to={rutas.nueva(t.id)}
              replace
              className='flex items-start gap-3 rounded-[12px] border border-white/[0.07] bg-[#1E1E24] p-3.5 transition-colors hover:border-white/[0.2]'
            >
              <span
                className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg'
                style={{ background: `${t.color}22`, color: t.color }}
              >
                <i className={`ti ${t.icono}`} />
              </span>
              <span>
                <span className='block text-[13.5px] font-semibold text-neutral-100'>
                  {t.etiquetaSelector ?? t.label}
                </span>
                <span className='mt-0.5 block text-[11.5px] leading-snug text-neutral-500'>
                  {t.ayudaSelector ?? t.ayuda}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return <div className='flex-1 overflow-y-auto p-2 sm:p-4'>{contenido}</div>;
}