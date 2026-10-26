import { prisma } from '../../config/configDb.js';
import {
  verificarContenidoExiste,
  bloquearContenido,
  actualizarVotosNetoContenido,
  notificarInteraccion,
} from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// Devuelve el estado final tras votar: { mensaje, votos_neto, mi_voto }.
// El cliente muestra esto tal cual; no tiene que calcular nada.
async function votar({ usuario_id, contenido_id, tipo_contenido, tipo }) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);

  const resultado = await prisma.$transaction(async (tx) => {
    // serializa los votos sobre este contenido (evita que el contador se desfase)
    await bloquearContenido(tipo_contenido, contenido_id, tx);

    const claveVoto = {
      usuario_id_tipo_contenido_contenido_id: {
        usuario_id,
        tipo_contenido,
        contenido_id,
      },
    };

    const votoExistente = await tx.voto.findUnique({ where: claveVoto });

    let mensaje;
    let miVoto; // estado final del voto de este usuario: 'up' | 'down' | null

    if (votoExistente) {
      if (votoExistente.tipo === tipo) {
        await tx.voto.delete({ where: claveVoto });
        mensaje = 'Voto eliminado';
        miVoto = null;
      } else {
        await tx.voto.update({ where: claveVoto, data: { tipo } });
        mensaje = 'Voto registrado';
        miVoto = tipo;
      }
    } else {
      await tx.voto.create({
        data: { usuario_id, tipo_contenido, contenido_id, tipo },
      });
      mensaje = 'Voto registrado';
      miVoto = tipo;
    }

    const [ups, downs] = await Promise.all([
      tx.voto.count({ where: { contenido_id, tipo_contenido, tipo: 'up' } }),
      tx.voto.count({ where: { contenido_id, tipo_contenido, tipo: 'down' } }),
    ]);
    const votosNeto = ups - downs;

    await actualizarVotosNetoContenido(
      tipo_contenido,
      contenido_id,
      votosNeto,
      tx,
    );

    return { mensaje, votos_neto: votosNeto, mi_voto: miVoto };
  });
  
  await notificarInteraccion(tipo_contenido, {
    clase: 'voto',
    usuario_id,
    contenido_id,
    estado: resultado.mi_voto,
  });

  return resultado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { votar };
