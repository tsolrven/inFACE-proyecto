import { prisma } from '../../config/configDb.js';
import { NotFoundError } from '../../errors/appError.js';
import { hoyEnChile } from '../../shared/auth/cargos.js';
import { ORDEN_CARRERAS_USUARIO } from '../../shared/auth/carreraPrincipal.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
import { ESTADOS_REPORTE } from '../../shared/moderation/reports.constants.js';
import { obtenerVistasContenido } from '../../shared/content/contentRegistry.js';
import { recortar } from '../../shared/content/extracto.js';

// Tope de resultados de la búsqueda. Se pide uno más para saber si hay otros.
const LIMITE_BUSQUEDA = 20;

// Tope de cada lista de reportes de la ficha. Se pide uno más para saber si
// hay otros.
const LIMITE_LISTA_FICHA = 20;
const EXTRACTO_MAX = 280;

// Contenidos eliminados por el superadmin. El contador de la ficha y la lista
// «eliminados» usan ESTE filtro, así los dos números no pueden divergir. El
// revisor distingue la moderación de la autoeliminación (esa no deja revisor).
const filtroEliminadosModeracion = (usuarioId) => ({
  contenido_autor_id: usuarioId,
  estado: ESTADOS_REPORTE.CONTENIDO_ELIMINADO,
  revisado_por: { not: null },
});

const extracto = (texto) => recortar(texto ?? '', EXTRACTO_MAX).texto;

// Sin correo ni contraseña: la ficha de moderación no los necesita.
const RESUMEN_SELECT = {
  id: true,
  rol: true,
  esta_activo: true,
  eliminacion_programada_en: true,
  anonimizado_en: true,
  perfil: { select: { nombre_usuario: true, nombre_completo: true } },
  usuario_carrera: {
    orderBy: ORDEN_CARRERAS_USUARIO,
    select: { carrera: { select: { id: true, nombre: true } } },
  },
};

function estadoDeCuenta(u) {
  if (u.anonimizado_en) return 'anonimizada';
  if (u.eliminacion_programada_en) return 'eliminacion_programada';
  if (!u.esta_activo) return 'inactiva';
  return 'activa';
}

function darFormato(u) {
  return {
    id: u.id,
    rol: u.rol,
    nombre_usuario: u.perfil?.nombre_usuario ?? null,
    nombre_completo: u.perfil?.nombre_completo ?? null,
    carreras: u.usuario_carrera.map((uc) => uc.carrera),
    estado_cuenta: estadoDeCuenta(u),
    eliminacion_programada_en: u.eliminacion_programada_en,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function buscarUsuarios(q) {
  const filas = await prisma.usuario.findMany({
    where: {
      perfil: {
        OR: [
          { nombre_usuario: { contains: q, mode: 'insensitive' } },
          { nombre_completo: { contains: q, mode: 'insensitive' } },
        ],
      },
    },
    orderBy: { perfil: { nombre_usuario: 'asc' } },
    take: LIMITE_BUSQUEDA + 1,
    select: RESUMEN_SELECT,
  });

  return {
    items: filas.slice(0, LIMITE_BUSQUEDA).map(darFormato),
    hay_mas: filas.length > LIMITE_BUSQUEDA,
    limite: LIMITE_BUSQUEDA,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Tope de cargos de la ficha (una persona acumula pocos: 1 o 2 por año).
const LIMITE_CARGOS_FICHA = 50;

// Estado de una asignación frente a hoy (fecha de Chile).
function estadoDeCargo(a, hoy) {
  if (a.revocada_en) return 'revocado';
  if (a.hasta < hoy) return 'vencido';
  if (a.desde > hoy) return 'futuro';
  return 'vigente';
}

// Cargos (CEE/tutor) del usuario, el más reciente primero. La ficha es solo
// del superadmin: ve el motivo de la revocación y quién revocó. `revocable`
// indica si tiene sentido mostrar el botón de revocar (vigente o futuro).
async function listarCargosDeUsuario(usuarioId) {
  const hoy = hoyEnChile();
  const filas = await prisma.asignacionRol.findMany({
    where: { usuario_id: usuarioId },
    orderBy: [{ desde: 'desc' }, { id: 'asc' }],
    take: LIMITE_CARGOS_FICHA,
    select: {
      id: true,
      tipo: true,
      desde: true,
      hasta: true,
      revocada_en: true,
      motivo_revocacion: true,
      carrera: { select: { id: true, nombre: true, codigo: true } },
      revocador: { select: AUTOR_PUBLICO_SELECT },
    },
  });
  return filas.map(({ revocador, ...a }) => {
    const estado = estadoDeCargo(a, hoy);
    return {
      ...a,
      estado,
      revocable: estado === 'vigente' || estado === 'futuro',
      revocada_por: revocador
        ? {
          id: revocador.id,
          nombre_usuario: revocador.perfil?.nombre_usuario ?? null,
        }
        : null,
    };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerFichaUsuario(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ...RESUMEN_SELECT, creado_en: true },
  });
  if (!usuario) throw new NotFoundError('Usuario');

  const [recibidos, recibidosPendientes, realizados, descartados, eliminados] =
    await Promise.all([
      prisma.reporte.count({ where: { contenido_autor_id: id } }),
      prisma.reporte.count({
        where: {
          contenido_autor_id: id,
          estado: ESTADOS_REPORTE.PENDIENTE,
        },
      }),
      prisma.reporte.count({ where: { reportado_por: id } }),
      prisma.reporte.count({
        where: { reportado_por: id, estado: ESTADOS_REPORTE.DESCARTADO },
      }),
      // contenidos distintos eliminados por el superadmin: el estado
      // contenido_eliminado con revisor distingue la moderación de la
      // autoeliminación (esa no deja revisor)
      prisma.reporte.groupBy({
        by: ['tipo_contenido', 'contenido_id'],
        where: filtroEliminadosModeracion(id),
      }),
    ]);

  return {
    ...darFormato(usuario),
    creado_en: usuario.creado_en,
    cargos: await listarCargosDeUsuario(id),
    reportes: {
      recibidos,
      recibidos_pendientes: recibidosPendientes,
      realizados,
      realizados_descartados: descartados,
      contenido_eliminado_moderacion: eliminados.length,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Listas de reportes de la ficha. Nunca se seleccionan `reportador`,
// `reportado_por` (en recibidos y eliminados) ni `detalle`: la ficha no expone
// quién reportó ni el texto libre que pudo escribir. Esa información queda en
// el detalle individual del reporte.
const WHERE_LISTA = {
  recibidos: (usuarioId) => ({ contenido_autor_id: usuarioId }),
  realizados: (usuarioId) => ({ reportado_por: usuarioId }),
  eliminados: filtroEliminadosModeracion,
};

// Vistas en vivo, una consulta por tipo de contenido.
async function cargarVistas(pares) {
  const idsPorTipo = {};
  for (const { tipo_contenido, contenido_id } of pares) {
    (idsPorTipo[tipo_contenido] ??= new Set()).add(contenido_id);
  }
  const vistas = {};
  await Promise.all(
    Object.entries(idsPorTipo).map(async ([tipo, ids]) => {
      vistas[tipo] = await obtenerVistasContenido(tipo, [...ids]);
    }),
  );
  return vistas;
}

// Título en vivo si el contenido existe; si no, el del snapshot.
function describirContenido(vistas, tipo, id, snapshot) {
  const vivo = vistas[tipo]?.get(id);
  const existe = !!vivo && !vivo.eliminado;
  const titulo = existe
    ? extracto(vivo.texto)
    : (snapshot?.titulo ?? (vivo?.texto ? extracto(vivo.texto) : null));
  return { contenido_existe: existe, titulo };
}

// Un ítem por reporte: son los reportes que hizo esta persona.
async function listarRealizados(where) {
  const filas = await prisma.reporte.findMany({
    where,
    orderBy: [{ creado_en: 'desc' }, { id: 'asc' }],
    take: LIMITE_LISTA_FICHA + 1,
    select: {
      id: true,
      tipo_contenido: true,
      contenido_id: true,
      motivo: true,
      estado: true,
      eliminado_por: true,
      creado_en: true,
      contenido_snapshot: true,
    },
  });
  const vistas = await cargarVistas(filas);
  return filas.map(({ contenido_snapshot: snapshot, ...r }) => ({
    ...r,
    ...describirContenido(vistas, r.tipo_contenido, r.contenido_id, snapshot),
  }));
}

// Un ítem por contenido (un contenido con 5 reportes aparece una vez).
// `ultimo_en`: fecha del último reporte (recibidos) o del último cierre
// (eliminados).
async function listarAgrupados(where, campoOrden) {
  const grupos = await prisma.reporte.groupBy({
    by: ['tipo_contenido', 'contenido_id'],
    where,
    _max: { [campoOrden]: true },
    orderBy: [{ _max: { [campoOrden]: 'desc' } }, { contenido_id: 'asc' }],
    take: LIMITE_LISTA_FICHA + 1,
  });
  if (grupos.length === 0) return [];

  const reportes = await prisma.reporte.findMany({
    where: {
      ...where,
      OR: grupos.map((g) => ({
        tipo_contenido: g.tipo_contenido,
        contenido_id: g.contenido_id,
      })),
    },
    select: {
      tipo_contenido: true,
      contenido_id: true,
      motivo: true,
      estado: true,
      eliminado_por: true,
      contenido_snapshot: true,
    },
  });
  const vistas = await cargarVistas(grupos);

  return grupos.map((g) => {
    const propios = reportes.filter(
      (r) =>
        r.tipo_contenido === g.tipo_contenido &&
        r.contenido_id === g.contenido_id,
    );
    const motivos = {};
    const estados = {};
    for (const r of propios) {
      motivos[r.motivo] = (motivos[r.motivo] ?? 0) + 1;
      estados[r.estado] = (estados[r.estado] ?? 0) + 1;
    }
    const snapshot = propios.find((r) => r.contenido_snapshot)
      ?.contenido_snapshot;

    return {
      tipo_contenido: g.tipo_contenido,
      contenido_id: g.contenido_id,
      total_reportes: propios.length,
      estados,
      eliminado_por:
        propios.find((r) => r.eliminado_por)?.eliminado_por ?? null,
      motivos: Object.entries(motivos)
        .map(([motivo, cantidad]) => ({ motivo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad),
      ultimo_en: g._max[campoOrden],
      ...describirContenido(
        vistas,
        g.tipo_contenido,
        g.contenido_id,
        snapshot,
      ),
    };
  });
}

async function listarReportesDeUsuario(usuarioId, lista) {
  // sin esto, un UUID inexistente devolvería una lista vacía en vez de 404
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true },
  });
  if (!usuario) throw new NotFoundError('Usuario');

  const where = WHERE_LISTA[lista](usuarioId);
  const filas =
    lista === 'realizados'
      ? await listarRealizados(where)
      : await listarAgrupados(
        where,
        lista === 'eliminados' ? 'revisado_en' : 'creado_en',
      );

  return {
    lista,
    items: filas.slice(0, LIMITE_LISTA_FICHA),
    hay_mas: filas.length > LIMITE_LISTA_FICHA,
    limite: LIMITE_LISTA_FICHA,
  };
}

export {
  buscarUsuarios,
  obtenerFichaUsuario,
  listarReportesDeUsuario,
  LIMITE_BUSQUEDA,
  LIMITE_LISTA_FICHA,
};