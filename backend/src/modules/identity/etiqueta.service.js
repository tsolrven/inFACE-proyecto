import { prisma } from '../../config/configDb.js';
import { BadRequestError } from '../../errors/appError.js';

// Orden en que se muestran los grupos de etiquetas en pantalla.
const ORDEN_TIPOS = [
  'Tecnología',
  'Administración y Negocios',
  'Economía y Finanzas',
  'Contabilidad y Auditoría',
  'Derecho',
  'Área de Interés',
  'Metodología',
  'Habilidad',
];

async function obtenerEtiquetas({ q } = {}) {
  const etiquetas = await prisma.etiqueta.findMany({
    where: {
      estado: 'aprobada',
      ...(q?.trim() && {
        nombre_etiqueta: { contains: q.trim(), mode: 'insensitive' },
      }),
    },
    include: { tipo_etiqueta: true },
    orderBy: [
      { tipo_etiqueta: { nombre_tipo_etiqueta: 'asc' } },
      { nombre_etiqueta: 'asc' },
    ],
  });

  const lista = etiquetas.map((e) => ({
    id: e.id,
    nombre: e.nombre_etiqueta,
    tipo: e.tipo_etiqueta?.nombre_tipo_etiqueta ?? null,
    descripcion: e.descripcion ?? null,
  }));

  const posicion = (tipo) => {
    const i = ORDEN_TIPOS.indexOf(tipo);
    return i === -1 ? ORDEN_TIPOS.length : i;
  };
  return lista.sort(
    (a, b) =>
      posicion(a.tipo) - posicion(b.tipo) ||
      (a.tipo ?? '').localeCompare(b.tipo ?? ''),
  );
}

// ╰─────────────────────────────✧────────────────────────────────╮

/*
 * Verifica que todas las etiquetas enviadas existan y estén aprobadas.
 * Se usa antes de guardar intereses de usuario o etiquetas de proyecto.
 */
async function validarEtiquetasExisten(ids = []) {
  if (!ids?.length) return;

  const unicos = [...new Set(ids)];
  const encontradas = await prisma.etiqueta.count({
    where: { id: { in: unicos }, estado: 'aprobada' },
  });

  if (encontradas !== unicos.length) {
    throw new BadRequestError(
      'Una o más etiquetas seleccionadas no existen o no están aprobadas',
    );
  }
}

export { obtenerEtiquetas, validarEtiquetasExisten };
