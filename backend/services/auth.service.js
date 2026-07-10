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
} from '../errors/AppError.js';
import { validarEtiquetasExisten } from './etiqueta.service.js';
import { derivarNombreDesdeCorreo } from '../helpers/nombre.helper.js';

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
//! función register momentanea hasta que sepamos bien como va a ser el registro
async function registrar({ correo, contrasena, nombre_usuario, etiqueta_ids = [] }) {
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

  await validarEtiquetasExisten(etiqueta_ids);

  const rol = determinarRolPorCorreo(correo);

  const hash = await bcrypt.hash(contrasena, 10);

  const nombre_completo = derivarNombreDesdeCorreo(correo);

  const usuario = await prisma.usuario.create({
    data: {
      correo,
      contrasena: hash,
      rol: rol,
      perfil: {
        create: {
          nombre_usuario,
          nombre_completo,
        },
      },
      usuario_etiquetas: {
        create: [...new Set(etiqueta_ids)].map((etiqueta_id) => ({
          etiqueta_id,
        })),
      },
    },
    include: {
      perfil: true,
      usuario_etiquetas: { include: { etiqueta: true } },
    },
  });

  return {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
    nombre_usuario: usuario.perfil.nombre_usuario,
    nombre_completo: usuario.perfil.nombre_completo,
    intereses: usuario.usuario_etiquetas.map((ue) => ({
      id: ue.etiqueta.id,
      nombre: ue.etiqueta.nombre_etiqueta,
    })),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function iniciarSesion({ correo, contrasena }) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    include: { perfil: true, usuario_etiquetas: true },
  });

  if (!usuario) throw new UnauthorizedError('Credenciales inválidas');
  if (!usuario.esta_activo) throw new ForbiddenError('Cuenta desactivada');

  const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValido) throw new UnauthorizedError('Credenciales inválidas');

  const payload = { id: usuario.id, rol: usuario.rol };

  return {
    accessToken: generarAccessToken(payload),
    refreshToken: generarRefreshToken(payload),
    usuario: {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre_usuario: usuario.perfil.nombre_usuario,
      tiene_intereses: usuario.usuario_etiquetas.length > 0,
    },
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
export { registrar, iniciarSesion, refrescarToken, determinarRolPorCorreo };
