import { prisma } from '../../config/configDb.js';
import { NotFoundError } from '../../errors/appError.js';
import { ORDEN_CARRERAS_USUARIO } from '../../shared/auth/carreraPrincipal.js';
import { ESTADOS_REPORTE } from '../../shared/moderation/reports.constants.js';

// Tope de resultados de la búsqueda. Se pide uno más para saber si hay otros.
const LIMITE_BUSQUEDA = 20;

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
        where: {
          contenido_autor_id: id,
          estado: ESTADOS_REPORTE.CONTENIDO_ELIMINADO,
          revisado_por: { not: null },
        },
      }),
    ]);

  return {
    ...darFormato(usuario),
    creado_en: usuario.creado_en,
    reportes: {
      recibidos,
      recibidos_pendientes: recibidosPendientes,
      realizados,
      realizados_descartados: descartados,
      contenido_eliminado_moderacion: eliminados.length,
    },
  };
}

export { buscarUsuarios, obtenerFichaUsuario, LIMITE_BUSQUEDA };