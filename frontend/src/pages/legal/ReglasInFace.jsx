import { useLocation, useNavigate } from 'react-router-dom';

const REGLAS = [
  {
    titulo: 'Respeto ante todo',
    texto:
      'InFACE es un espacio para aprender y crecer, no para atacar a nadie. No se tolera el acoso, las amenazas ni el contenido que promueva odio o discriminación hacia otro estudiante por su identidad, género, origen, orientación, discapacidad u otra característica personal.',
    motivos: ['Acoso', 'Discurso de odio'],
  },
  {
    titulo: 'Contenido académico, no ruido',
    texto:
      'Publica contenido relacionado con tu carrera, ramo o vida universitaria. Evita contenido sexual, violento o que simplemente no tenga cabida en un espacio de estudio.',
    motivos: ['Contenido inapropiado', 'Fuera de lugar'],
  },
  {
    titulo: 'Integridad académica',
    texto:
      'Comparte materiales propios o con la autorización correspondiente. Si subes contenido de otra persona (apuntes de un profesor, ejercicios de un compañero, etc.), da el crédito correspondiente. No presentes trabajo ajeno como propio.',
    motivos: ['Plagio'],
  },
  {
    titulo: 'Información confiable',
    texto:
      'No publiques contenido académico que sepas que es incorrecto o engañoso presentándolo como válido. Si te equivocaste, corrige o edita tu publicación apenas te des cuenta.',
    motivos: ['Información falsa'],
  },
  {
    titulo: 'Sin spam ni manipulación',
    texto:
      'No publiques contenido repetitivo, publicitario o que no aporte valor a la comunidad. No manipules votos usando múltiples cuentas ni acuerdos externos.',
    motivos: ['Spam'],
  },
  {
    titulo: 'Privacidad y seguridad',
    texto:
      'Respeta la privacidad de tus compañeros. No compartas datos personales, capturas de conversaciones privadas ni información de contacto de otra persona sin su consentimiento.',
  },
  {
    titulo: 'Sé tú mismo',
    texto:
      'Puedes usar un nombre de usuario distinto a tu nombre real, pero no debes hacerte pasar por otro estudiante, profesor o autoridad de la universidad de forma engañosa.',
  },
  {
    titulo: 'Dentro de la ley',
    texto:
      'No publiques ni facilites contenido ilegal, material con derechos de autor sin permiso más allá del uso educativo razonable, ni promuevas transacciones prohibidas.',
  },
  {
    titulo: 'No interfieras con la plataforma',
    texto:
      'No intentes vulnerar, saturar o dañar el funcionamiento de InFACE (bots, scraping abusivo, explotación de errores, etc.).',
  },
];

const ACCIONES_ENFORCEMENT = [
  'Advertencia sobre el contenido o la conducta',
  'Eliminación del contenido reportado',
  'Restricción temporal para publicar o comentar',
  'Suspensión temporal de la cuenta',
  'Suspensión permanente en casos graves o reincidentes',
];

export default function ReglasInFace() {
  const location = useLocation();
  const navigate = useNavigate();
  const vieneDeReporte = location.state?.desdeReporte === true;

  return (
    <div className='mx-auto w-full max-w-[720px] px-6 py-10'>
      {vieneDeReporte && (
        <button
          onClick={() => navigate(-1)}
          className='mb-4 flex items-center gap-1.5 text-[12.5px] text-neutral-500 transition hover:text-neutral-200'
        >
          <i className='ti ti-arrow-left text-[14px]' />
          Volver
        </button>
      )}

      <h1 className='mb-2 text-xl font-bold text-neutral-100'>
        Reglas de InFACE
      </h1>
      <p className='mb-8 text-[13.5px] leading-relaxed text-neutral-400'>
        InFACE es la red académica de nuestra facultad: un espacio construido
        por y para estudiantes para compartir apuntes, discutir dudas, mostrar
        proyectos y conectar entre carreras. Cada módulo puede tener además sus
        propias reglas específicas (las verás en el panel derecho de esa
        sección). Las reglas de esta página aplican a toda la plataforma, sin
        excepción, y son la base de las categorías que puedes elegir al reportar
        contenido.
      </p>

      <div className='flex flex-col gap-3'>
        {REGLAS.map((regla, index) => (
          <div
            key={regla.titulo}
            className='rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4'
          >
            <div className='mb-1.5 flex items-center gap-2'>
              <span className='flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[10.5px] font-bold text-pink-500'>
                {index + 1}
              </span>
              <h2 className='text-[14px] font-semibold text-neutral-100'>
                {regla.titulo}
              </h2>
            </div>
            <p className='pl-[28px] text-[13px] leading-relaxed text-neutral-400'>
              {regla.texto}
            </p>
            {regla.motivos && (
              <div className='mt-2 flex flex-wrap gap-1.5 pl-[28px]'>
                {regla.motivos.map((motivo) => (
                  <span
                    key={motivo}
                    className='rounded-full bg-white/[0.04] px-2 py-0.5 text-[10.5px] font-medium text-neutral-500'
                  >
                    {motivo}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='mt-8 rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4'>
        <h2 className='mb-2 text-[14px] font-semibold text-neutral-100'>
          ¿Qué pasa si rompes una regla?
        </h2>
        <p className='mb-3 text-[13px] leading-relaxed text-neutral-400'>
          Dependiendo de la gravedad y de si es una conducta repetida, InFACE
          puede tomar una o varias de estas medidas:
        </p>
        <ul className='flex flex-col gap-1.5'>
          {ACCIONES_ENFORCEMENT.map((accion) => (
            <li
              key={accion}
              className='flex items-start gap-2 text-[13px] text-neutral-400'
            >
              <span className='mt-[7px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-neutral-600' />
              {accion}
            </li>
          ))}
        </ul>
        <p className='mt-3 text-[12px] text-neutral-600'>
          Estas decisiones se basan en los reportes enviados por la comunidad y
          en la revisión de nuestro equipo de moderación.
        </p>
      </div>
    </div>
  );
}
