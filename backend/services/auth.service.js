import bcrypt from 'bcryptjs';
import { prisma } from '../config/configDb.js';
import {
  generarAccessToken,
  generarRefreshToken,
  verificarRefreshToken,
} from '../helpers/jwt.helper.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
} from '../errors/appError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
function determinarRolPorCorreo(correo) {
  if (correo.endsWith('@alumnos.ubiobio.cl')) {
    return 'estudiante';
  }
  if (correo.endsWith('@ubiobio.cl')) {
    return 'docente';
  }
  throw new ValidationError('Dominio de correo no permitido');
}
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
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function registrar({ correo, contrasena, nombre_usuario, carrera_id }) {
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

  const carreraExiste = await prisma.carrera.findUnique({
    where: { id: carrera_id },
  });
  if (!carreraExiste) {
    throw new ValidationError('La carrera seleccionada no existe');
  }

  const rol = determinarRolPorCorreo(correo);

  const hash = await bcrypt.hash(contrasena, 10);

  const usuario = await prisma.usuario.create({
    data: {
      correo,
      contrasena: hash,
      rol: rol,
      perfil: {
        create: {
          nombre_usuario,
        },
      },
      usuario_carrera: {
        create: {
          carrera_id,
        },
      },
    },
    include: {
      perfil: true,
      usuario_carrera: { include: { carrera: true } },
    },
  });

  return formatearUsuario(usuario);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function iniciarSesion({ correo, contrasena }) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    include: {
      perfil: true,
      usuario_carrera: { include: { carrera: true } },
    },
  });

  if (!usuario) throw new UnauthorizedError('Credenciales inválidas');
  if (!usuario.esta_activo) throw new ForbiddenError('Cuenta desactivada');

  const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValido) throw new UnauthorizedError('Credenciales inválidas');

  const carrera_id = usuario.usuario_carrera[0]?.carrera_id ?? null;
  const payload = { id: usuario.id, rol: usuario.rol, carrera_id };

  return {
    accessToken: generarAccessToken(payload),
    refreshToken: generarRefreshToken(payload),
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
    include: { usuario_carrera: true },
  });

  if (!usuario || !usuario.esta_activo) {
    throw new ForbiddenError('Usuario no válido');
  }

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
async function obtenerUsuarioActual(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: {
      perfil: true,
      usuario_carrera: { include: { carrera: true } },
    },
  });

  if (!usuario) throw new NotFoundError('Usuario');
  if (!usuario.esta_activo) throw new ForbiddenError('Cuenta desactivada');

  return formatearUsuario(usuario);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  registrar,
  iniciarSesion,
  refrescarToken,
  obtenerUsuarioActual,
  determinarRolPorCorreo,
};
