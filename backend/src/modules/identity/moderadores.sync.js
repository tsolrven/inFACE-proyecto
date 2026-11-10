import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { correosModeradores } from './moderadoras.constants.js';
import { determinarRolPorCorreo } from './rolCorreo.helper.js';

// Al arrancar: sube a superadmin a quien esté en la lista y devuelve a su rol
// base a quien tenga superadmin y ya no esté. `autenticar` lee el rol de la BD
// en cada petición: el cambio rige de inmediato (la persona debe volver a
// iniciar sesión para ver su interfaz actualizada).
async function sincronizarModeradores() {
  const correos = correosModeradores();
  if (correos.length === 0) {
    logger.warn('Moderadores: la lista está vacía; no se sincroniza nada');
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    logger.warn(
      'Moderadores: cuentas de prueba (admin, admin2) habilitadas por no estar en producción',
    );
  }

  const promovidos = await prisma.usuario.updateMany({
    where: {
      correo: { in: correos },
      rol: { not: 'superadmin' },
      anonimizado_en: null,
    },
    data: { rol: 'superadmin' },
  });

  const aDegradar = await prisma.usuario.findMany({
    where: { rol: 'superadmin', correo: { notIn: correos } },
    select: { id: true, correo: true },
  });
  for (const u of aDegradar) {
    let rol = 'estudiante';
    try {
      rol = determinarRolPorCorreo(u.correo);
    } catch {
      // correo fuera de los dominios (p. ej. cuenta anonimizada): estudiante
    }
    await prisma.usuario.update({ where: { id: u.id }, data: { rol } });
  }

  if (promovidos.count > 0 || aDegradar.length > 0) {
    logger.info('Moderadores sincronizados', {
      promovidos: promovidos.count,
      degradados: aDegradar.length,
    });
  }
}

export { sincronizarModeradores };