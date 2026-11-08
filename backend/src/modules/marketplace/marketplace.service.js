import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import {
  borrarArchivosFisicos,
  formatearArchivo,
  datosArchivo,
} from '../../shared/files/files.service.js';
import { revisarCoherencia } from './marketplace.validation.js';
import { eliminarContenido } from '../../shared/content/contentCleanup.js';
import {
  registrarHidratadorGuardados,
  registrarAlQuitarArchivo,
} from '../../shared/content/contentRegistry.js';
import { obtenerEnriquecimiento } from '../../shared/content/contentEnrichment.js';
import { esStaff } from '../../shared/auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const EXTRACTO_MAX = 160;
const INCLUDE = { vendedor: { select: AUTOR_PUBLICO_SELECT } };

function recortar(texto) {
  if (!texto || texto.length <= EXTRACTO_MAX) return texto ?? null;
  return `${texto.slice(0, EXTRACTO_MAX).trimEnd()}…`;
}

function formatearProducto(
  p,
  { extracto = false, comentarios = 0, archivos = [], esta_guardado = false },
) {
  return {
    id: p.id,
    tipo_contenido: 'producto',
    titulo: p.titulo,
    descripcion: extracto ? recortar(p.descripcion) : p.descripcion,
    precio: p.precio,
    categoria: p.categoria,
    condicion: p.condicion,
    estado: p.estado,
    negociable: p.negociable,
    ubicacion: p.ubicacion,
    entrega_domicilio: p.entrega_domicilio,
    unidad_precio: p.unidad_precio,
    modalidad: p.modalidad,
    ...(!extracto && {
      contacto_whatsapp: p.contacto_whatsapp,
      contacto_instagram: p.contacto_instagram,
      contacto_discord: p.contacto_discord,
    }),
    esta_guardado,
    creado_en: p.creado_en,
    editado_en: p.editado_en,
    vendedor: {
      id: p.vendedor.id,
      nombre_usuario: p.vendedor.perfil?.nombre_usuario,
    },
    archivos: archivos.map(formatearArchivo),
    comentarios_count: comentarios,
  };
}

async function formatearProductos(productos, usuario_id, opciones = {}) {
  const ids = productos.map((p) => p.id);
  const { setGuardados, mapComentarios, mapArchivos } =
    await obtenerEnriquecimiento('producto', ids, usuario_id);

  return productos.map((p) =>
    formatearProducto(p, {
      ...opciones,
      comentarios: mapComentarios.get(p.id) ?? 0,
      archivos: mapArchivos.get(p.id) ?? [],
      esta_guardado: setGuardados.has(p.id),
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarProductos({
  categoria,
  condicion,
  estado,
  orden = 'recientes',
  precio_min,
  precio_max,
  solo_mios = false,
  busqueda,
  pagina = 1,
  limite = 20,
  usuario_id,
}) {
  const where = { AND: [] };
  if (solo_mios) where.AND.push({ vendedor_id: usuario_id });
  if (categoria?.length) where.AND.push({ categoria: { in: categoria } });
  if (condicion) where.AND.push({ condicion });
  if (estado) where.AND.push({ estado });
  if (precio_min !== undefined) where.AND.push({ precio: { gte: precio_min } });
  if (precio_max !== undefined) where.AND.push({ precio: { lte: precio_max } });
  if (busqueda) {
    where.AND.push({
      OR: [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ],
    });
  }

  const orderBy =
    orden === 'precio_asc'
      ? [{ precio: 'asc' }, { id: 'desc' }]
      : orden === 'precio_desc'
        ? [{ precio: 'desc' }, { id: 'desc' }]
        : [{ creado_en: 'desc' }, { id: 'desc' }];

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: INCLUDE,
    }),
    prisma.producto.count({ where }),
  ]);

  return {
    productos: await formatearProductos(productos, usuario_id, {
      extracto: true,
    }),
    total,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerProducto(id, usuario_id) {
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: INCLUDE,
  });
  if (!producto) throw new NotFoundError('Producto');
  const [formateado] = await formatearProductos([producto], usuario_id);
  return formateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearProducto({ vendedor_id, archivos = [], ...datos }) {
  if (archivos.length === 0) {
    throw new BadRequestError('Sube al menos una foto del producto');
  }

  const id = await prisma.$transaction(async (tx) => {
    const creado = await tx.producto.create({
      data: { vendedor_id, ...datos },
    });
    for (const archivo of archivos) {
      await tx.archivo.create({
        data: {
          tipo_contenido: 'producto',
          contenido_id: creado.id,
          ...datosArchivo(archivo),
        },
      });
    }
    return creado.id;
  });

  return obtenerProducto(id, vendedor_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarProducto(id, usuario_id, datos) {
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) throw new NotFoundError('Producto');
  if (producto.vendedor_id !== usuario_id) {
    throw new ForbiddenError('Solo el vendedor puede editar este producto');
  }

  const final = { ...producto, ...datos };
  if (
    !final.contacto_whatsapp &&
    !final.contacto_instagram &&
    !final.contacto_discord
  ) {
    throw new BadRequestError(
      'Deja al menos un medio de contacto (WhatsApp, Instagram o Discord)',
    );
  }

  const incoherencias = [];
  revisarCoherencia(final, {
    addIssue: (i) => incoherencias.push(i.message),
  });
  if (incoherencias.length > 0) throw new BadRequestError(incoherencias[0]);
  const esServicio = final.categoria === 'servicios';
  const ajuste = esServicio
    ? { condicion: 'servicio' }
    : { modalidad: null, unidad_precio: null };

  await prisma.producto.update({
    where: { id },
    data: { ...datos, ...ajuste, editado_en: new Date() },
  });
  return obtenerProducto(id, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarProducto(id, usuario_id, rol) {
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) throw new NotFoundError('Producto');
  if (producto.vendedor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este producto');
  }

  const archivos = await prisma.$transaction(async (tx) => {
    const { archivos } = await eliminarContenido(tx, 'producto', id);
    await tx.producto.delete({ where: { id } });
    return archivos;
  });

  await borrarArchivosFisicos(archivos);
  logger.info('Producto eliminado', {
    producto_id: id,
    eliminado_por: usuario_id,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarProductosGuardados(ids, usuario_id) {
  const productos = await prisma.producto.findMany({
    where: { id: { in: ids } },
    include: INCLUDE,
  });
  const mapa = new Map(productos.map((p) => [p.id, p]));
  const ordenados = ids.map((id) => mapa.get(id)).filter(Boolean);
  return formatearProductos(ordenados, usuario_id, { extracto: true });
}

registrarHidratadorGuardados('producto', hidratarProductosGuardados);

registrarAlQuitarArchivo('producto', async (tx, archivo) => {
  const otras = await tx.archivo.count({
    where: {
      tipo_contenido: 'producto',
      contenido_id: archivo.contenido_id,
      id: { not: archivo.id },
    },
  });
  if (otras === 0) {
    throw new BadRequestError('El producto necesita al menos una foto');
  }
});
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
