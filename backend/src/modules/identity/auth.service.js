import bcrypt from 'bcryptjs';
import { prisma } from '../../config/configDb.js';
import {
  generarAccessToken,
  generarRefreshToken,
  verificarRefreshToken,
} from '../../shared/auth/jwt.helper.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  AccountSuspendedError,
} from '../../errors/appError.js';
import { derivarNombreDesdeCorreo } from './nombre.helper.js';
import { VERSION_TERMINOS } from './terminos.constants.js';
import {
  verificarCodigo,
  consumirVerificacion,
} from './verificacionCorreo.service.js';
import { ORDEN_CARRERAS_USUARIO } from '../../shared/auth/carreraPrincipal.js';
import { obtenerSancionesVigentes } from '../../shared/moderation/sanctions.service.js';
import { generacionDesdeCorreo } from './generacion.helper.js';
import { esModerador } from './moderadoras.constants.js';
import { hoyEnChile, filtroCargoVigente } from '../../shared/auth/cargos.js';
import { determinarRolPorCorreo } from './rolCorreo.helper.js';
// ────────────────────────────────────────────────────────────────────────────────────────
function formatearUsuario(usuario) {
  const carreras = usuario.usuario_carrera ?? [];
  return {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
    nombre_usuario: usuario.perfil.nombre_usuario,
    carrera_id: carreras[0]?.carrera_id ?? null,
    carreras: carreras.map((uc) => ({
      id: uc.carrera.id,
      nombre: uc.carrera.nombre,
      codigo: uc.carrera.codigo,
    })),
    tiene_intereses: (usuario.usuario_etiquetas?.length ?? 0) > 0,
    cargo: usuario.perfil?.cargo ?? null,
    avatar: usuario.perfil?.avatar ?? null,
    generacion: usuario.correo.endsWith('@alumnos.ubiobio.cl')
      ? generacionDesdeCorreo(usuario.correo)
      : null,
    es_moderador: usuario.rol === 'superadmin',
    cargos: (usuario.cargos_asignados ?? []).map((c) => ({
      tipo: c.tipo,
      carrera_id: c.carrera_id,
      hasta: c.hasta,
    })),
    terminos_vigentes: usuario.terminos_version === VERSION_TERMINOS,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function registrar({
  correo,
  contrasena,
  nombre_usuario,
  carrera_id,
  codigo,
  cargo,
  nombre_completo: nombreIngresado,
  acepta_investigacion = false,
}) {
  const usuarioExiste = await prisma.usuario.findUnique({
    where: { correo },
  });
  if (usuarioExiste) {
    throw new ConflictError('El correo ya está registrado');
  }

  const nombreExiste = await prisma.perfil.findUnique({
    where: { nombre_usuario },
  });
  if (nombreExiste) {
    throw new ConflictError('El nombre de usuario ya está en uso');
  }

  if (carrera_id) {
    const carreraExiste = await prisma.carrera.findUnique({
      where: { id: carrera_id },
    });
    if (!carreraExiste) {
      throw new ValidationError('La carrera seleccionada no existe');
    }
  }

  // después de las validaciones baratas: un formulario mal llenado no gasta intentos
  await verificarCodigo(correo, codigo);

  // el rol base sale del dominio; los moderadores (lista en código) nacen superadmin
  const rolBase = determinarRolPorCorreo(correo);
  const esAcademico = rolBase === 'docente';
  const rol = esModerador(correo) ? 'superadmin' : rolBase;

  const hash = await bcrypt.hash(contrasena, 10);

  const nombre_completo =
    esAcademico && nombreIngresado
      ? nombreIngresado
      : derivarNombreDesdeCorreo(correo);


  const usuario = await prisma.$transaction(async (tx) => {
    await consumirVerificacion(tx, correo);

    return tx.usuario.create({
      data: {
        correo,
        contrasena: hash,
        rol: rol,
        terminos_version: VERSION_TERMINOS,
        terminos_aceptados_en: new Date(),
        consentimiento_investigacion: acepta_investigacion,
        consentimiento_investigacion_en: acepta_investigacion
          ? new Date()
          : null,
        perfil: {
          create: {
            nombre_usuario,
            nombre_completo,
            cargo: esAcademico ? cargo : null,
          },
        },
        ...(carrera_id && {
          usuario_carrera: {
            create: { carrera_id },
          },
        }),
      },
      include: {
        perfil: true,
        usuario_carrera: { include: { carrera: true } },
        usuario_etiquetas: true,
        cargos_asignados: {
          where: filtroCargoVigente(hoyEnChile()),
          select: { tipo: true, carrera_id: true, hasta: true },
        },
      },
    });
  });

  return formatearUsuario(usuario);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function aceptarTerminos(id, { acepta_investigacion = false } = {}) {
  await prisma.usuario.update({
    where: { id },
    data: {
      terminos_version: VERSION_TERMINOS,
      terminos_aceptados_en: new Date(),
      consentimiento_investigacion: acepta_investigacion,
      consentimiento_investigacion_en: acepta_investigacion ? new Date() : null,
    },
  });
  return obtenerUsuarioActual(id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function iniciarSesion({ correo, contrasena }) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    include: {
      perfil: true,
      usuario_carrera: {
        include: { carrera: true },
        orderBy: ORDEN_CARRERAS_USUARIO,
      },
      usuario_etiquetas: true,
      cargos_asignados: {
        where: filtroCargoVigente(hoyEnChile()),
        select: { tipo: true, carrera_id: true, hasta: true },
      },
    },
  });
  if (!usuario) throw new UnauthorizedError('Credenciales inválidas');

  const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValido) throw new UnauthorizedError('Credenciales inválidas');

  if (!usuario.esta_activo) throw new ForbiddenError('Cuenta desactivada');

  // igual que la desactivación: el motivo solo se revela con la contraseña
  // correcta, para no delatar qué cuentas están suspendidas
  const { suspension } = await obtenerSancionesVigentes(usuario.id);
  if (suspension) throw new AccountSuspendedError(suspension);

  const carrera_id = usuario.usuario_carrera[0]?.carrera_id ?? null;
  const payload = { id: usuario.id, rol: usuario.rol, carrera_id };

  return {
    accessToken: generarAccessToken(payload),
    refreshToken: generarRefreshToken({
      ...payload,
      vt: usuario.version_token,
    }),
    usuario: formatearUsuario(usuario),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function refrescarToken(token) {
  if (!token) throw new UnauthorizedError('No hay refresh token');
  let payload;
  try {
    payload = verificarRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.id },
    include: { usuario_carrera: { orderBy: ORDEN_CARRERAS_USUARIO } },
  });

  if (!usuario || !usuario.esta_activo) {
    throw new ForbiddenError('Usuario no válido');
  }

  if (payload.vt !== usuario.version_token) {
    throw new UnauthorizedError('Sesión cerrada, inicia sesión nuevamente');
  }

  // sin cookie ni token nuevo; si la suspensión se revoca o vence, la misma
  // sesión vuelve a refrescar sola
  const { suspension } = await obtenerSancionesVigentes(usuario.id);
  if (suspension) throw new AccountSuspendedError(suspension);

  const carrera_id = usuario.usuario_carrera[0]?.carrera_id ?? null;

  return {
    accessToken: generarAccessToken({
      id: usuario.id,
      rol: usuario.rol,
      carrera_id,
    }),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function cerrarSesion(token) {
  if (!token) return;

  let payload;
  try {
    payload = verificarRefreshToken(token);
  } catch {
    return;
  }

  await prisma.usuario.updateMany({
    where: { id: payload.id, version_token: payload.vt },
    data: { version_token: { increment: 1 } },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerUsuarioActual(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: {
      perfil: true,
      usuario_carrera: {
        include: { carrera: true },
        orderBy: ORDEN_CARRERAS_USUARIO,
      },
      usuario_etiquetas: true,
      cargos_asignados: {
        where: filtroCargoVigente(hoyEnChile()),
        select: { tipo: true, carrera_id: true, hasta: true },
      },
    },
  });

  if (!usuario) throw new NotFoundError('Usuario');
  if (!usuario.esta_activo) throw new ForbiddenError('Cuenta desactivada');

  return formatearUsuario(usuario);
}
// ───────────────────────────F─────────────────────────────────────────────────────────────
export {
  registrar,
  iniciarSesion,
  refrescarToken,
  cerrarSesion,
  obtenerUsuarioActual,
  determinarRolPorCorreo,
  aceptarTerminos,
};