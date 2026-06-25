import { prisma } from '../config/configDb.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function votar({ usuario_id, contenido_id, tipo_contenido, tipo }) {
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
      // Si vota igual, elimina el voto (toggle)
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
      // Si vota distinto, actualiza el voto
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
