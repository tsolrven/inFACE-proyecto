import { prisma } from '../../config/configDb.js';
import { combinarPesos } from './recomendador.config.js';
import { puntuarCandidatos, sumarSenales } from './recomendador.puro.js';

const SENALES = [
  'postulacion',
  'favorito',
  'like',
  'dislike',
  'descarte',
  'comentario',
];

// ─────────────────────────────────────────────────────────────────────────────
async function leerSenales(usuarioIds, proyectoIds = null) {
  if (usuarioIds.length === 0) return [];
  const filtroProyecto = proyectoIds ? { in: proyectoIds } : undefined;

  const [votos, favoritos, descartes, postulaciones, comentarios] =
    await Promise.all([
      prisma.voto.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          tipo_contenido: 'proyecto',
          ...(filtroProyecto && { contenido_id: filtroProyecto }),
        },
        select: { usuario_id: true, contenido_id: true, tipo: true },
      }),
      prisma.favoritoProyecto.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          ...(filtroProyecto && { proyecto_id: filtroProyecto }),
        },
        select: { usuario_id: true, proyecto_id: true },
      }),
      prisma.descarteProyecto.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          ...(filtroProyecto && { proyecto_id: filtroProyecto }),
        },
        select: { usuario_id: true, proyecto_id: true },
      }),
      prisma.postulacionProyecto.findMany({
        where: {
          postulante_id: { in: usuarioIds },
          ...(filtroProyecto && { proyecto_id: filtroProyecto }),
        },
        select: { postulante_id: true, proyecto_id: true },
      }),

      prisma.comentario.findMany({
        where: {
          autor_id: { in: usuarioIds },
          tipo_contenido: 'proyecto',
          eliminado: false,
          ...(filtroProyecto && { contenido_id: filtroProyecto }),
        },
        distinct: ['autor_id', 'contenido_id'],
        select: { autor_id: true, contenido_id: true },
      }),
    ]);

  return [
    ...votos.map((v) => ({
      usuario_id: v.usuario_id,
      proyecto_id: v.contenido_id,
      tipo: v.tipo === 'up' ? 'like' : 'dislike',
    })),
    ...favoritos.map((f) => ({
      usuario_id: f.usuario_id,
      proyecto_id: f.proyecto_id,
      tipo: 'favorito',
    })),
    ...descartes.map((d) => ({
      usuario_id: d.usuario_id,
      proyecto_id: d.proyecto_id,
      tipo: 'descarte',
    })),
    ...postulaciones.map((p) => ({
      usuario_id: p.postulante_id,
      proyecto_id: p.proyecto_id,
      tipo: 'postulacion',
    })),
    ...comentarios.map((c) => ({
      usuario_id: c.autor_id,
      proyecto_id: c.contenido_id,
      tipo: 'comentario',
    })),
  ];
}

function puntajePorProyecto(filas, pesosSenales) {
  const presentes = new Map();
  for (const f of filas) {
    if (!presentes.has(f.proyecto_id)) presentes.set(f.proyecto_id, {});
    presentes.get(f.proyecto_id)[f.tipo] = true;
  }
  return new Map(
    [...presentes].map(([proyecto_id, s]) => [
      proyecto_id,
      sumarSenales(s, pesosSenales),
    ]),
  );
}

// ─────────────────────────────────────────────────────────────────────────────

async function calcularPuntajesHibridos(
  usuario_id,
  candidatos,
  misEtiquetasIds,
) {
  const modelo = await prisma.modeloCluster.findFirst({
    where: { activo: true },
    select: { id: true, parametros: true },
    orderBy: { entrenado_en: 'desc' },
  });
  const parametros = modelo?.parametros ?? null;
  const { senales } = combinarPesos(parametros);
  const idsCandidatos = candidatos.map((c) => c.id);

  const propias = await leerSenales([usuario_id]);
  const puntajePropio = puntajePorProyecto(propias, senales);
  const idsHistorial = [...puntajePropio.keys()];
  const etiquetasHistorial = idsHistorial.length
    ? await prisma.proyectoEtiqueta.findMany({
        where: { proyecto_id: { in: idsHistorial } },
        select: { proyecto_id: true, etiqueta_id: true },
      })
    : [];
  const etiquetasDe = new Map();
  for (const e of etiquetasHistorial) {
    if (!etiquetasDe.has(e.proyecto_id)) etiquetasDe.set(e.proyecto_id, []);
    etiquetasDe.get(e.proyecto_id).push(e.etiqueta_id);
  }
  const historial = idsHistorial
    .map((id) => ({
      etiquetas: etiquetasDe.get(id) ?? [],
      puntaje: puntajePropio.get(id),
    }))
    .filter((h) => h.etiquetas.length > 0 && h.puntaje !== 0);

  let clusterUsuario = null;
  const clusterDeProyecto = new Map();
  const netoPares = new Map();
  let hayPares = false;
  if (modelo) {
    const mio = await prisma.clusterUsuario.findUnique({
      where: { modelo_id_usuario_id: { modelo_id: modelo.id, usuario_id } },
      select: { cluster: true },
    });
    if (mio) {
      clusterUsuario = mio.cluster;
      const [clustersProyecto, pares] = await Promise.all([
        prisma.clusterProyecto.findMany({
          where: { modelo_id: modelo.id, proyecto_id: { in: idsCandidatos } },
          select: { proyecto_id: true, cluster: true },
        }),
        prisma.clusterUsuario.findMany({
          where: {
            modelo_id: modelo.id,
            cluster: mio.cluster,
            usuario_id: { not: usuario_id },
          },
          select: { usuario_id: true },
        }),
      ]);
      for (const c of clustersProyecto)
        clusterDeProyecto.set(c.proyecto_id, c.cluster);
      const idsPares = pares.map((p) => p.usuario_id);
      hayPares = idsPares.length > 0;
      if (hayPares) {
        const filasPares = await leerSenales(idsPares, idsCandidatos);

        const porParProyecto = new Map();
        for (const f of filasPares) {
          const clave = `${f.usuario_id}|${f.proyecto_id}`;
          if (!porParProyecto.has(clave))
            porParProyecto.set(clave, { proyecto_id: f.proyecto_id, s: {} });
          porParProyecto.get(clave).s[f.tipo] = true;
        }
        for (const { proyecto_id, s } of porParProyecto.values()) {
          netoPares.set(
            proyecto_id,
            (netoPares.get(proyecto_id) ?? 0) + sumarSenales(s, senales),
          );
        }
      }
    }
  }

  const puntajes = puntuarCandidatos({
    candidatos: candidatos.map((c) => ({
      id: c.id,
      etiquetas: c.etiquetas.map((e) => e.id),
    })),
    misEtiquetas: new Set(misEtiquetasIds),
    historial,
    clusterUsuario,
    clusterDeProyecto,
    netoPares,
    hayPares,
    parametros,
  });

  return { puntajes, modelo_id: modelo?.id ?? null };
}

// ─────────────────────────────────────────────────────────────────────────────
function intercalarTeamDraft(listaEtiquetas, listaHibrida, rng = Math.random) {
  const usados = new Set();
  const resultado = [];
  const punteros = { etiquetas: 0, hibrido: 0 };
  const listas = { etiquetas: listaEtiquetas, hibrido: listaHibrida };

  function tomar(algoritmo) {
    const lista = listas[algoritmo];
    let i = punteros[algoritmo];
    while (i < lista.length && usados.has(lista[i].id)) i++;
    punteros[algoritmo] = i + 1;
    if (i >= lista.length) return false;
    usados.add(lista[i].id);
    resultado.push({ proyecto: lista[i], algoritmo });
    return true;
  }

  for (;;) {
    const orden =
      rng() < 0.5 ? ['etiquetas', 'hibrido'] : ['hibrido', 'etiquetas'];
    const aporto = orden.map(tomar);
    if (!aporto.some(Boolean)) break;
  }
  return resultado;
}

function crearRng(semilla) {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i++) {
    h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export {
  SENALES,
  leerSenales,
  calcularPuntajesHibridos,
  intercalarTeamDraft,
  crearRng,
};
