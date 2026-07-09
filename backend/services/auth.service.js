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
// formatea el usuario SIEMPRE igual, sin importar si viene de registrar,
// login o /me — así el frontend nunca recibe shapes distintos según el
// endpoint que haya llamado.
function formatearUsuario(usuario) {
  // usuario.usuario_carrera puede no venir incluido si algún caller
  // olvida el include (defensivo); en login/registrar/me siempre se
  // incluye explícitamente.
  const carreras = usuario.usuario_carrera ?? [];
  return {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
    nombre_usuario: usuario.perfil.nombre_usuario,
    // la carrera "principal" del usuario: tomamos la primera asociada.
    // si más adelante un usuario puede tener varias carreras a la vez,
    // aquí es donde habría que decidir cuál mostrar como activa.
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

  // la carrera la elige el usuario en el formulario de registro (select
  // poblado desde GET /repositorio/carreras). Si mandan un id que no
  // existe (o alguien pega el request a mano), lo cortamos acá con un
  // mensaje claro en vez de reventar con un error de FK de Prisma.
  const carreraExiste = await prisma.carrera.findUnique({
    where: { id: carrera_id },
  });
  if (!carreraExiste) {
    throw new ValidationError('La carrera seleccionada no existe');
  }

  const rol = determinarRolPorCorreo(correo);

  const hash = await bcrypt.hash(contrasena, 10);

  // Usuario + Perfil + UsuarioCarrera se crean en un solo `create` anidado:
  // Prisma envuelve las nested writes en una única transacción, así que
  // si algo falla no queda un Usuario huérfano sin carrera.
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

  const payload = { id: usuario.id, rol: usuario.rol };

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
  });

  if (!usuario || !usuario.esta_activo) {
    throw new ForbiddenError('Usuario no válido');
  }

  return {
    accessToken: generarAccessToken({ id: usuario.id, rol: usuario.rol }),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// usado por GET /auth/me — devuelve el usuario dueño del access token
// actual, con el mismo shape exacto que login/registrar.
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
