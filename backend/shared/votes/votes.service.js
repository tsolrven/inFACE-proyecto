import { prisma } from '../../config/configDb.js';
import {
  verificarContenidoExiste,
  bloquearContenido,
  actualizarVotosNetoContenido,
} from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function votar({ usuario_id, contenido_id, tipo_contenido, tipo }) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);

  return prisma.$transaction(async (tx) => {
    // serializa los votos sobre este contenido (evita que el contador se desfase)
    await bloquearContenido(tipo_contenido, contenido_id, tx);

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

    const [ups, downs] = await Promise.all([
      tx.voto.count({ where: { contenido_id, tipo_contenido, tipo: 'up' } }),
      tx.voto.count({ where: { contenido_id, tipo_contenido, tipo: 'down' } }),
    ]);
    await actualizarVotosNetoContenido(
      tipo_contenido,
      contenido_id,
      ups - downs,
      tx,
    );

    return { mensaje };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { votar };
