import { prisma } from '../config/configDb.js';
import { BadRequestError, NotFoundError } from '../errors/appError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function verificarContenidoExiste(tipo_contenido, contenido_id) {
  if (tipo_contenido === 'apunte') {
    const existe = await prisma.apunte.findUnique({
      where: { id: contenido_id },
      select: { id: true },
    });
    if (!existe) throw new NotFoundError('Apunte');
  } else if (tipo_contenido === 'comentario') {
    const existe = await prisma.comentario.findUnique({
      where: { id: contenido_id },
      select: { id: true },
    });
    if (!existe) throw new NotFoundError('Comentario');
  } else {
    throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function votar({ usuario_id, contenido_id, tipo_contenido, tipo }) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);

  return prisma.$transaction(async (tx) => {
    const votoExistente = await tx.voto.findUnique({
      where: {
        usuario_id_tipo_contenido_contenido_id: {
          usuario_id,
          tipo_contenido,
          contenido_id,
        },
      },
    });

    let mensaje;

    if (votoExistente) {
      if (votoExistente.tipo === tipo) {
        // si vota igual elimina el voto (toggle)
        await tx.voto.delete({
          where: {
            usuario_id_tipo_contenido_contenido_id: {
              usuario_id,
              tipo_contenido,
              contenido_id,
            },
          },
        });
        mensaje = 'Voto eliminado';
      } else {
        // si vota distinto actualiza el voto
        await tx.voto.update({
          where: {
            usuario_id_tipo_contenido_contenido_id: {
              usuario_id,
              tipo_contenido,
              contenido_id,
            },
          },
          data: { tipo },
        });
        mensaje = 'Voto registrado';
      }
    } else {
      await tx.voto.create({
        data: { usuario_id, tipo_contenido, contenido_id, tipo },
      });
      mensaje = 'Voto registrado';
    }

    await actualizarVotosNeto(tx, contenido_id, tipo_contenido);
    return { mensaje };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarVotosNeto(tx, contenido_id, tipo_contenido) {
  const [ups, downs] = await Promise.all([
    tx.voto.count({ where: { contenido_id, tipo_contenido, tipo: 'up' } }),
    tx.voto.count({
      where: { contenido_id, tipo_contenido, tipo: 'down' },
    }),
  ]);

  const neto = ups - downs;

  if (tipo_contenido === 'apunte') {
    await tx.apunte.update({
      where: { id: contenido_id },
      data: { votos_neto: neto },
    });
  } else if (tipo_contenido === 'comentario') {
    await tx.comentario.update({
      where: { id: contenido_id },
      data: { votos_neto: neto },
    });
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { votar };
