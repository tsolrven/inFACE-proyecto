import { prisma } from '../../config/configDb.js';
import { BadRequestError } from '../../errors/appError.js';
import {
  verificarContenidoExiste,
  hidratarGuardados,
  tiposContenidoValidos,
} from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function guardarContenido({ usuario_id, tipo_contenido, contenido_id }) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);
  await prisma.guardado.createMany({
    data: [{ usuario_id, tipo_contenido, contenido_id }],
    skipDuplicates: true,
  });
  return { guardado: true };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// No exige que el contenido siga disponible: siempre se puede dejar de guardar.
async function quitarGuardado({ usuario_id, tipo_contenido, contenido_id }) {
  await prisma.guardado.deleteMany({
    where: { usuario_id, tipo_contenido, contenido_id },
  });
  return { guardado: false };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarGuardados({
  usuario_id,
  tipo_contenido = 'apunte',
  pagina = 1,
  limite = 20,
}) {
  if (!tiposContenidoValidos().includes(tipo_contenido)) {
    throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
  }

  const [registros, total] = await Promise.all([
    prisma.guardado.findMany({
      where: { usuario_id, tipo_contenido },
      orderBy: { creado_en: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.guardado.count({ where: { usuario_id, tipo_contenido } }),
  ]);

  const ids = registros.map((r) => r.contenido_id);
  const paginas = Math.ceil(total / limite);

  if (ids.length === 0) {
    return { items: [], total, pagina, paginas };
  }

  const items = await hidratarGuardados(tipo_contenido, ids, usuario_id);
  return { items, total, pagina, paginas };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { guardarContenido, quitarGuardado, listarGuardados };
