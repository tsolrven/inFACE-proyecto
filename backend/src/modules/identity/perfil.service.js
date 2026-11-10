import { Prisma } from '@prisma/client';
import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from '../../errors/appError.js';
import { validarEtiquetasExisten } from './etiqueta.service.js';
import { generacionDesdeCorreo } from './generacion.helper.js';

const MAX_INTERESES = 15;

//──────────────────────────────────────────────────────────────────────────────
// HELPERS
//──────────────────────────────────────────────────────────────────────────────

function formatearPerfil(usuario, stats = {}) {
  if (!usuario) return null;

  const primeraCarrera = usuario.usuario_carrera?.[0]?.carrera ?? null;

  return {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
    creado_en: usuario.creado_en,
    eliminacion_programada_en: usuario.eliminacion_programada_en ?? null,
    consentimiento_investigacion: usuario.consentimiento_investigacion ?? false,
    nombre_usuario: usuario.perfil?.nombre_usuario ?? null,
    nombre_completo: usuario.perfil?.nombre_completo ?? null,
    biografia: usuario.perfil?.biografia ?? null,
    campus: usuario.perfil?.campus ?? null,
    cargo: usuario.perfil?.cargo ?? null,
    avatar: usuario.perfil?.avatar ?? null,
    generacion: usuario.correo.endsWith('@alumnos.ubiobio.cl')
      ? generacionDesdeCorreo(usuario.correo)
      : null,
    es_moderador: usuario.rol === 'superadmin',
    carrera: primeraCarrera
      ? {
        id: primeraCarrera.id,
        nombre: primeraCarrera.nombre,
        codigo: primeraCarrera.codigo,
      }
      : null,
    intereses: (usuario.usuario_etiquetas || []).map((ue) => ({
      id: ue.etiqueta.id,
      nombre: ue.etiqueta.nombre_etiqueta,
      tipo: ue.etiqueta.tipo_etiqueta?.nombre_tipo_etiqueta ?? null,
      descripcion: ue.etiqueta.descripcion ?? null,
    })),
    stats: {
      proyectos_creados: stats.proyectos_creados ?? 0,
      postulaciones_enviadas: stats.postulaciones_enviadas ?? 0,
    },
  };
}

function incluirPerfilCompleto() {
  return {
    perfil: true,
    usuario_etiquetas: {
      include: { etiqueta: { include: { tipo_etiqueta: true } } },
    },
    usuario_carrera: {
      include: { carrera: true },
    },
  };
}

//──────────────────────────────────────────────────────────────────────────────
// PERFIL (datos básicos)
//──────────────────────────────────────────────────────────────────────────────

async function obtenerPerfilPropio(usuario_id) {
  const [usuario, proyectos_creados, postulaciones_enviadas] =
    await Promise.all([
      prisma.usuario.findUnique({
        where: { id: usuario_id },
        include: incluirPerfilCompleto(),
      }),
      prisma.proyecto.count({ where: { creador_id: usuario_id } }),
      prisma.postulacionProyecto.count({
        where: { postulante_id: usuario_id },
      }),
    ]);

  if (!usuario) throw new NotFoundError('Usuario');

  return formatearPerfil(usuario, {
    proyectos_creados,
    postulaciones_enviadas,
  });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerPerfilPublico(nombre_usuario) {
  const perfilBuscado = await prisma.perfil.findUnique({
    where: { nombre_usuario },
  });
  if (!perfilBuscado) throw new NotFoundError('Usuario');

  const [usuario, proyectos_creados, postulaciones_enviadas] =
    await Promise.all([
      prisma.usuario.findUnique({
        where: { id: perfilBuscado.usuario_id },
        include: incluirPerfilCompleto(),
      }),
      prisma.proyecto.count({
        where: { creador_id: perfilBuscado.usuario_id },
      }),
      prisma.postulacionProyecto.count({
        where: { postulante_id: perfilBuscado.usuario_id },
      }),
    ]);

  if (!usuario || !usuario.esta_activo) throw new NotFoundError('Usuario');

  const formateado = formatearPerfil(usuario, {
    proyectos_creados,
    postulaciones_enviadas,
  });
  delete formateado.correo;
  return formateado;
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function actualizarPerfil(
  usuario_id,
  { nombre_usuario, nombre_completo, biografia, avatar },
) {
  if (nombre_completo !== undefined) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
      select: { rol: true },
    });
    if (usuario?.rol !== 'docente') {
      throw new ForbiddenError(
        'Tu nombre se toma de tu correo institucional y no se puede editar',
      );
    }
  }

  if (nombre_usuario) {
    const enUso = await prisma.perfil.findFirst({
      where: { nombre_usuario, usuario_id: { not: usuario_id } },
    });
    if (enUso) throw new ConflictError('El nombre de usuario ya está en uso');
  }

  await prisma.perfil.update({
    where: { usuario_id },
    data: {
      ...(nombre_usuario !== undefined && { nombre_usuario }),
      ...(nombre_completo !== undefined && { nombre_completo }),
      ...(biografia !== undefined && { biografia }),
      ...(avatar !== undefined && {
        avatar: avatar === null ? Prisma.DbNull : avatar,
      }),
    },
  });

  logger.info('Perfil actualizado', { usuario_id });
  return obtenerPerfilPropio(usuario_id);
}

//──────────────────────────────────────────────────────────────────────────────
// INTERESES (etiquetas del usuario)
//──────────────────────────────────────────────────────────────────────────────

async function actualizarMisEtiquetas(usuario_id, etiqueta_ids = []) {
  if (etiqueta_ids.length > MAX_INTERESES)
    throw new BadRequestError(
      `Puedes seleccionar como máximo ${MAX_INTERESES} intereses`,
    );

  await validarEtiquetasExisten(etiqueta_ids);

  const unicos = [...new Set(etiqueta_ids)];

  await prisma.$transaction([
    prisma.usuarioEtiqueta.deleteMany({ where: { usuario_id } }),
    ...(unicos.length
      ? [
        prisma.usuarioEtiqueta.createMany({
          data: unicos.map((etiqueta_id) => ({ usuario_id, etiqueta_id })),
          skipDuplicates: true,
        }),
      ]
      : []),
  ]);

  logger.info('Intereses de usuario actualizados', {
    usuario_id,
    total: unicos.length,
  });
  return obtenerPerfilPropio(usuario_id);
}

export {
  obtenerPerfilPropio,
  obtenerPerfilPublico,
  actualizarPerfil,
  actualizarMisEtiquetas,
  MAX_INTERESES,
};