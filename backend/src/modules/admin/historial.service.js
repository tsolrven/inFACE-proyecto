import { prisma } from '../../config/configDb.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';

// Acciones administrativas, de la más reciente a la más antigua. Solo lo ven
// los superadmins (el router de /api/admin ya lo exige).
async function listarHistorialAdmin({ tipo, pagina, limite }) {
  const where = tipo ? { tipo } : {};
  const [items, total] = await Promise.all([
    prisma.accionAdmin.findMany({
      where,
      orderBy: [{ creado_en: 'desc' }, { id: 'asc' }],
      skip: (pagina - 1) * limite,
      take: limite,
      include: {
        admin: { select: AUTOR_PUBLICO_SELECT },
        afectado: { select: AUTOR_PUBLICO_SELECT },
      },
    }),
    prisma.accionAdmin.count({ where }),
  ]);
  return { items, total };
}

export { listarHistorialAdmin };