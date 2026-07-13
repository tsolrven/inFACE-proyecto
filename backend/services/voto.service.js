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

  const votoExistente = await prisma.voto.findUnique({
    where: {
      usuario_id_tipo_contenido_contenido_id: {
        usuario_id,
        tipo_contenido,
        contenido_id,
      },
    },
  });

  if (votoExistente) {
    if (votoExistente.tipo === tipo) {
      // si vota igual elimina el voto (toggle)
      await prisma.voto.delete({
        where: {
          usuario_id_tipo_contenido_contenido_id: {
            usuario_id,
            tipo_contenido,
            contenido_id,
          },
        },
      });
      await actualizarVotosNeto(contenido_id, tipo_contenido);
      return { mensaje: 'Voto eliminado' };
    } else {
      // si vota distinto actualiza el voto
      await prisma.voto.update({
        where: {
          usuario_id_tipo_contenido_contenido_id: {
            usuario_id,
            tipo_contenido,
            contenido_id,
          },
        },
        data: { tipo },
      });
    }
  } else {
    await prisma.voto.create({
      data: { usuario_id, tipo_contenido, contenido_id, tipo },
    });
  }

  await actualizarVotosNeto(contenido_id, tipo_contenido);
  return { mensaje: 'Voto registrado' };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarVotosNeto(contenido_id, tipo_contenido) {
  const [ups, downs] = await Promise.all([
    prisma.voto.count({ where: { contenido_id, tipo_contenido, tipo: 'up' } }),
    prisma.voto.count({
      where: { contenido_id, tipo_contenido, tipo: 'down' },
    }),
  ]);

  const neto = ups - downs;

  if (tipo_contenido === 'apunte') {
    await prisma.apunte.update({
      where: { id: contenido_id },
      data: { votos_neto: neto },
    });
  } else if (tipo_contenido === 'comentario') {
    await prisma.comentario.update({
      where: { id: contenido_id },
      data: { votos_neto: neto },
    });
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { votar };
