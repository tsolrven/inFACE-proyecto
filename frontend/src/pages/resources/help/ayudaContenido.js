//! contenido de la página de ayuda (/ayuda). Cada pestaña agrupa preguntas por tema.
//! - id de pregunta: único en todo el archivo; es el ancla (/ayuda#<id>) para
//!   enlazar desde otras pantallas
//! - respuesta: lista de párrafos en texto plano (la búsqueda recorre pregunta
//!   y respuesta)
//! - enlaces (opcional): rutas internas { to, label }
//! Una pestaña sin preguntas no se muestra. Las cifras (días, límites) se
//! importan de las constantes del módulo, no se escriben a mano.

import {
  ADJUNTOS_EXTENSIONES as EXTENSIONES_MATERIAL,
  LINKS_MAX,
  MAX_ARCHIVOS,
  MAX_TAMANIO_MB,
} from '@/features/materials/utils/limites';
import {
  ADJUNTOS_MAX as ADJUNTOS_MAX_HILO,
  ADJUNTO_MAX_MB as ADJUNTO_MAX_MB_HILO,
} from '@/features/forum/utils/limites';
import { HASHTAGS_MAX } from '@/shared/lib/hashtags';
import {
  DIAS_AVISO_VENCIMIENTO,
  DIAS_CONSERVACION_RESPALDOS,
  DIAS_MINIMOS_VIGENCIA,
  DIAS_RENOVACION,
  EXTENSIONES_RESPALDO,
  MAX_BYTES_RESPALDO,
  MAX_RESPALDOS,
  MENSAJE_MAX,
  MENSAJE_MIN,
} from '@/features/cargos/utils/limites';
import { MOTIVOS_REPORTE } from '@/shared/moderation/reportReasons';
import {
  DIAS_SANCION_MAX,
  DIAS_SANCION_MIN,
  ETIQUETA_SANCION,
} from '@/shared/moderation/sancionUi';

const lista = (extensiones) => extensiones.join(', ');

const GRUPOS_ESTUDIANTES = [
  {
    titulo: 'Tu carrera y las comunidades',
    preguntas: [
      {
        id: 'comunidades-permisos',
        pregunta: '¿Qué puedo hacer en mi carrera y en las demás?',
        respuesta: [
          'En tu carrera puedes subir materiales, abrir hilos en el foro, comentar, votar, guardar publicaciones y leer los anuncios oficiales.',
          'En las demás carreras de la facultad puedes leer todo y comentar, pero no publicar. Así cada comunidad mantiene su contenido y igual puedes aportar con tus respuestas.',
        ],
      },
    ],
  },
  {
    titulo: 'Materiales',
    preguntas: [
      {
        id: 'material-subir',
        pregunta: '¿Cómo subo un material?',
        respuesta: [
          'En Materiales de tu carrera, elige el ramo, escribe un título y una descripción. Puedes adjuntar archivos, agregar enlaces (GitHub, GitLab, Notion u otros) o pegar un fragmento de código.',
        ],
      },
      {
        id: 'material-archivos',
        pregunta: '¿Qué archivos puedo adjuntar a un material?',
        respuesta: [
          `Formatos permitidos: ${lista(EXTENSIONES_MATERIAL)}.`,
          `Hasta ${MAX_ARCHIVOS} archivos por material, de máximo ${MAX_TAMANIO_MB} MB cada uno, y hasta ${LINKS_MAX} enlaces.`,
        ],
      },
      {
        id: 'material-buscar',
        pregunta: '¿Cómo encuentro el material de un ramo?',
        respuesta: [
          'Filtra por ramo y por tipo de contenido, o usa el buscador: busca en el título, la descripción y el nombre de los archivos adjuntos.',
        ],
      },
      {
        id: 'material-credito',
        pregunta: '¿Puedo subir material de un profesor o de un compañero?',
        respuesta: [
          'Sí, si tienes autorización y das el crédito correspondiente. Presentar trabajo ajeno como propio rompe las reglas de integridad académica y se puede reportar como plagio.',
        ],
        enlaces: [{ to: '/reglas', label: 'Reglas de InFACE' }],
      },
    ],
  },
  {
    titulo: 'Foro',
    preguntas: [
      {
        id: 'hilo-crear',
        pregunta: '¿Cómo pregunto algo en el foro?',
        respuesta: [
          'En el Foro de tu carrera, abre un hilo: elige el ramo, escribe un título claro y explica tu duda.',
          `Puedes adjuntar hasta ${ADJUNTOS_MAX_HILO} imágenes de máximo ${ADJUNTO_MAX_MB_HILO} MB cada una, por ejemplo una captura del ejercicio.`,
        ],
      },
      {
        id: 'hilo-resuelto',
        pregunta: '¿Cómo marco mi duda como resuelta?',
        respuesta: [
          'Si abriste el hilo, acepta la respuesta que te sirvió. Debe ser una respuesta directa al hilo, no una respuesta a otro comentario. El hilo queda marcado como resuelto y la respuesta aceptada se destaca para quien llegue después.',
          'Puedes quitar la marca en cualquier momento. También puedes aceptar tu propia respuesta si encontraste la solución por tu cuenta.',
        ],
      },
      {
        id: 'hilo-filtro-resueltos',
        pregunta: '¿Puedo ver solo las dudas sin resolver?',
        respuesta: [
          'Sí. Usa el filtro de estado del foro para ver solo los hilos resueltos o solo los que aún esperan respuesta.',
        ],
      },
    ],
  },
  {
    titulo: 'Anuncios',
    preguntas: [
      {
        id: 'anuncios-quien',
        pregunta: '¿Quién publica los anuncios de mi carrera?',
        respuesta: [
          'Los estudiantes con un cargo vigente de CEE o tutor en esa carrera. Por eso los anuncios son la fuente oficial de avisos de tu carrera: fechas, actividades y comunicados.',
        ],
        enlaces: [{ to: '/ayuda#cargo-solicitar', label: '¿Cómo obtengo un cargo?' }],
      },
    ],
  },
  {
    titulo: 'Búsqueda, hashtags y guardados',
    preguntas: [
      {
        id: 'buscar',
        pregunta: '¿Cómo funciona el buscador?',
        respuesta: [
          'Escribe al menos 2 caracteres. La búsqueda no distingue mayúsculas ni tildes: «dia» encuentra «día». Busca dentro de la sección en la que estás.',
        ],
      },
      {
        id: 'hashtags',
        pregunta: '¿Para qué sirven los hashtags?',
        respuesta: [
          `Puedes agregar hasta ${HASHTAGS_MAX} hashtags a una publicación. Al tocar uno, ves todas las publicaciones que lo usan.`,
          'En el buscador, empieza con # para buscar por hashtag, por ejemplo #certamen.',
        ],
      },
      {
        id: 'guardados',
        pregunta: '¿Dónde encuentro lo que guardé?',
        respuesta: [
          'Cada sección tiene una vista de Guardados con lo que guardaste ahí. En una comunidad, la vista de Guardados reúne lo que guardaste de esa carrera.',
        ],
      },
    ],
  },
  {
    titulo: 'Perfil y notificaciones',
    preguntas: [
      {
        id: 'perfil-actividad',
        pregunta: '¿Qué muestra mi perfil?',
        respuesta: [
          'Las pestañas Materiales, Foro y Anuncios muestran tus publicaciones y tus comentarios en tu carrera. La pestaña Comunidades muestra los comentarios que hiciste en otras carreras.',
        ],
      },
      {
        id: 'notificaciones',
        pregunta: '¿Cuándo recibo notificaciones?',
        respuesta: [
          'Cuando alguien comenta tu publicación o responde tu comentario, cuando moderación elimina un contenido tuyo y cuando cambia el estado de tus solicitudes o cargos. Tus propias acciones no te generan notificaciones.',
        ],
      },
    ],
  },
];

const GRUPOS_DOCENTES = [
  {
    titulo: 'Docentes en InFACE',
    preguntas: [
      {
        id: 'docente-sin-carrera',
        pregunta: '¿Por qué no tengo una carrera asignada?',
        respuesta: [
          'Los docentes hacen clases en varias carreras, así que no pertenecen a una sola: participan en las cinco comunidades de la facultad.',
        ],
      },
      {
        id: 'docente-publicar',
        pregunta: '¿Dónde subo materiales o respondo dudas?',
        respuesta: [
          'Entra a la comunidad de la carrera desde Comunidades, en el menú lateral. Ahí puedes subir materiales, abrir hilos en el foro y comentar.',
          'Las secciones académicas del menú (Materiales, Foro y Anuncios) muestran la carrera de cada estudiante. Por eso, en tu cuenta se reemplazan por las comunidades.',
        ],
      },
      {
        id: 'docente-anuncios',
        pregunta: '¿Puedo publicar anuncios oficiales?',
        respuesta: [
          'No. Los anuncios oficiales de cada carrera los publican los estudiantes con cargo de CEE o tutor. Si quieres difundir algo, puedes publicarlo en el foro de la comunidad.',
        ],
        enlaces: [{ to: '/ayuda#cargo-que-es', label: '¿Qué es un cargo?' }],
      },
      {
        id: 'docente-perfil',
        pregunta: '¿Qué muestra mi perfil?',
        respuesta: [
          'La pestaña Comunidades reúne tus publicaciones y comentarios en cada carrera, separados por módulo.',
        ],
      },
    ],
  },
];

// Fechas de vencimiento: deben coincidir con VENCIMIENTOS en
// backend/src/shared/auth/cargos.js
const GRUPOS_CARGOS = [
  {
    titulo: 'Qué es un cargo',
    preguntas: [
      {
        id: 'cargo-que-es',
        pregunta: '¿Qué es un cargo de CEE o tutor?',
        respuesta: [
          'Es un permiso que reciben los estudiantes que representan al Centro de Estudiantes (CEE) o que ejercen como tutores en su carrera. Permite publicar los anuncios oficiales de esa carrera.',
        ],
      },
      {
        id: 'cargo-permisos',
        pregunta: '¿Qué puedo hacer con un cargo?',
        respuesta: [
          'Publicar anuncios oficiales en tu carrera, editarlos y eliminarlos mientras el cargo esté vigente, y crear o editar las categorías de anuncios. Tus anuncios muestran la insignia de tu cargo.',
          'Un cargo no da permisos de moderación: los reportes los revisan las administradoras.',
        ],
      },
    ],
  },
  {
    titulo: 'Solicitar un cargo',
    preguntas: [
      {
        id: 'cargo-solicitar',
        pregunta: '¿Cómo solicito un cargo?',
        respuesta: [
          `Desde Solicitar cargo, elige el tipo (CEE o tutor) y explica por qué lo solicitas (entre ${MENSAJE_MIN} y ${MENSAJE_MAX} caracteres). Solo puedes solicitarlo para tu carrera.`,
          `Adjunta respaldos que acrediten el cargo, por ejemplo un acta o una carta: hasta ${MAX_RESPALDOS} archivos (${lista(EXTENSIONES_RESPALDO)}) de máximo ${MAX_BYTES_RESPALDO / (1024 * 1024)} MB cada uno.`,
        ],
        enlaces: [{ to: '/solicitar-cargo', label: 'Solicitar cargo' }],
      },
      {
        id: 'cargo-revision',
        pregunta: '¿Quién revisa mi solicitud?',
        respuesta: [
          'Las administradoras de InFACE. Recibirás una notificación cuando la aprueben o la rechacen, y si la rechazan verás el motivo.',
          'Mientras esté pendiente, puedes cancelarla.',
        ],
      },
      {
        id: 'cargo-respaldos',
        pregunta: '¿Qué pasa con los respaldos que adjunto?',
        respuesta: [
          `Solo tú y las administradoras pueden verlos. Se eliminan ${DIAS_CONSERVACION_RESPALDOS} días después de que la solicitud se aprueba, se rechaza o se cancela. La solicitud sigue en tu historial, con la fecha en que se eliminaron.`,
        ],
      },
    ],
  },
  {
    titulo: 'Vigencia y renovación',
    preguntas: [
      {
        id: 'cargo-vigencia',
        pregunta: '¿Cuánto dura un cargo?',
        respuesta: [
          'Los cargos vencen en fechas fijas: el de tutor, el 25 de julio o el 25 de diciembre; el de CEE, el 15 de marzo.',
          `Al aprobarse, se asigna el próximo vencimiento que deje al menos ${DIAS_MINIMOS_VIGENCIA} días de vigencia. Si falta menos, se pasa al siguiente.`,
        ],
      },
      {
        id: 'cargo-renovar',
        pregunta: '¿Cómo renuevo mi cargo?',
        respuesta: [
          `${DIAS_AVISO_VENCIMIENTO} días antes del vencimiento recibes un aviso por notificación y por correo.`,
          `Desde ${DIAS_RENOVACION} días antes del vencimiento puedes enviar una nueva solicitud. Si se aprueba, el nuevo período empieza al día siguiente del vencimiento actual, sin interrupciones.`,
        ],
      },
      {
        id: 'cargo-vencido',
        pregunta: '¿Qué pasa con mis anuncios cuando el cargo vence?',
        respuesta: [
          'Siguen publicados, pero ya no puedes publicar nuevos, ni editar o eliminar los anteriores. Si necesitas retirar uno, escríbenos.',
        ],
      },
      {
        id: 'cargo-revocado',
        pregunta: '¿Me pueden quitar el cargo?',
        respuesta: [
          'Sí. Si el cargo se usa de forma indebida, las administradoras pueden revocarlo. Recibirás un aviso por notificación y por correo.',
        ],
        enlaces: [{ to: '/reglas', label: 'Reglas de InFACE' }],
      },
    ],
  },
];

const GRUPOS_NORMAS = [
  {
    titulo: 'Reportar contenido',
    preguntas: [
      {
        id: 'reportar-como',
        pregunta: '¿Cómo reporto una publicación o un comentario?',
        respuesta: [
          'Abre el menú de la publicación o del comentario y elige Reportar. Selecciona el motivo que mejor describa el problema; si eliges «Otro», cuéntanos qué pasa.',
          'Reporta solo contenido que rompe las reglas. Si simplemente no estás de acuerdo con algo, puedes responder o votar.',
        ],
        enlaces: [{ to: '/reglas', label: 'Reglas de InFACE' }],
      },
      {
        id: 'reportar-motivos',
        pregunta: '¿Qué significa cada motivo de reporte?',
        respuesta: MOTIVOS_REPORTE.map((m) => `${m.label}: ${m.descripcion}`),
      },
      {
        id: 'reportar-privacidad',
        pregunta: '¿La persona sabrá que la reporté?',
        respuesta: [
          'No. Solo las administradoras ven quién envió un reporte.',
        ],
      },
      {
        id: 'reportar-seguimiento',
        pregunta: '¿Cómo sé qué pasó con mi reporte?',
        respuesta: [
          'En Mis reportes ves el estado de cada uno. «En revisión» significa que aún no se revisa. «Resuelto» significa que se tomó una medida, por ejemplo eliminar el contenido. «Descartado» significa que moderación lo revisó y concluyó que no rompe las reglas.',
        ],
        enlaces: [{ to: '/reportes', label: 'Mis reportes' }],
      },
    ],
  },
  {
    titulo: 'Moderación y sanciones',
    preguntas: [
      {
        id: 'moderacion-quien',
        pregunta: '¿Quién modera InFACE?',
        respuesta: [
          'Las administradoras de la plataforma: revisan los reportes, eliminan contenido y aplican sanciones. Los cargos de CEE y tutor no tienen permisos de moderación.',
        ],
      },
      {
        id: 'moderacion-eliminado',
        pregunta: '¿Qué pasa si moderación elimina mi publicación?',
        respuesta: [
          'Recibes una notificación. La eliminación de un contenido no es, por sí sola, una sanción: las sanciones se aplican aparte y siempre se te avisan.',
        ],
      },
      {
        id: 'sanciones-tipos',
        pregunta: '¿Qué sanciones existen?',
        respuesta: [
          `${ETIQUETA_SANCION.advertencia}: queda registrada en tu cuenta, pero no limita lo que puedes hacer.`,
          `${ETIQUETA_SANCION.restriccion}: durante ${DIAS_SANCION_MIN} a ${DIAS_SANCION_MAX} días no puedes crear ni editar publicaciones, comentarios, archivos ni categorías de anuncios. Sí puedes leer, votar, guardar, reportar, eliminar tus propias publicaciones y editar tu perfil.`,
          `${ETIQUETA_SANCION.suspension}: no puedes iniciar sesión mientras dure. Puede ser temporal (de ${DIAS_SANCION_MIN} a ${DIAS_SANCION_MAX} días) o permanente en casos graves o reincidentes. Si es temporal, el acceso se restablece solo al cumplirse la fecha.`,
        ],
        enlaces: [{ to: '/reglas', label: 'Reglas de InFACE' }],
      },
      {
        id: 'sanciones-aviso',
        pregunta: '¿Cómo me entero de una sanción?',
        respuesta: [
          'Por notificación y por correo, con el motivo y la fecha de término si la tiene. Si una sanción se revoca, también se te avisa.',
        ],
      },
      {
        id: 'sanciones-desacuerdo',
        pregunta: '¿Qué hago si no estoy de acuerdo con una sanción?',
        respuesta: [
          'Escríbenos a los correos que aparecen al final de esta página. Indica tu nombre de usuario y explica por qué crees que la medida no corresponde.',
        ],
      },
    ],
  },
];

export const PESTANAS_AYUDA = [
  {
    id: 'inicio',
    label: 'Primeros pasos',
    icono: 'ti-rocket',
    grupos: [
      {
        titulo: 'Conociendo InFACE',
        preguntas: [
          {
            id: 'que-es-inface',
            pregunta: '¿Qué es InFACE?',
            respuesta: [
              'InFACE es la red académica de la Facultad de Ciencias Empresariales de la Universidad del Bío-Bío. Aquí puedes compartir materiales, resolver dudas en el foro de cada ramo, leer los anuncios oficiales de tu carrera, mostrar tus proyectos y conectar con estudiantes de otras carreras.',
            ],
            enlaces: [{ to: '/acerca-de-inface', label: 'Acerca de InFACE' }],
          },
          {
            id: 'correo-y-rol',
            pregunta: '¿Por qué mi correo define si soy estudiante o docente?',
            respuesta: [
              'InFACE reconoce tu rol por el dominio de tu correo institucional: las cuentas @alumnos.ubiobio.cl son de estudiantes y las cuentas @ubiobio.cl son de docentes.',
              'Cada estudiante pertenece a una carrera. Los docentes no tienen carrera y participan en todas las comunidades.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'estudiantes',
    label: 'Estudiantes',
    icono: 'ti-school',
    grupos: GRUPOS_ESTUDIANTES,
  },
  {
    id: 'docentes',
    label: 'Docentes',
    icono: 'ti-presentation',
    grupos: GRUPOS_DOCENTES,
  },
  {
    id: 'cargos',
    label: 'Cargos CEE y tutor',
    icono: 'ti-id-badge-2',
    grupos: GRUPOS_CARGOS,
  },
  {
    id: 'normas',
    label: 'Reportes y sanciones',
    icono: 'ti-shield-check',
    grupos: GRUPOS_NORMAS,
  },
  { id: 'cuenta', label: 'Cuenta y privacidad', icono: 'ti-user-cog', grupos: [] },
];

export const CONTACTO_AYUDA = [
  { nombre: 'Silvana Araya', correo: 'silvana.araya2301@alumnos.ubiobio.cl' },
  { nombre: 'Valentina Martínez', correo: 'valentina.martinez2302@alumnos.ubiobio.cl' },
];