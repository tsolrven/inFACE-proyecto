// Registro de decisiones administrativas: quién hizo qué y cuándo. Recibe el
// cliente de Prisma (normalmente `tx`) para escribirse en la MISMA transacción
// que la acción: si la acción se revierte, el registro también.
const TIPOS_ACCION_ADMIN = Object.freeze({
  SANCION_APLICADA: 'sancion_aplicada',
  SANCION_REVOCADA: 'sancion_revocada',
  REPORTES_CERRADOS: 'reportes_cerrados',
  CONTENIDO_ELIMINADO: 'contenido_eliminado',
});

async function registrarAccionAdmin(
  client,
  {
    admin_id,
    tipo,
    entidad_tipo = null,
    entidad_id = null,
    afectado_id = null,
    detalle = null,
  },
) {
  return client.accionAdmin.create({
    data: {
      admin_id,
      tipo,
      entidad_tipo,
      entidad_id,
      afectado_id,
      ...(detalle && { detalle }),
    },
  });
}

export { TIPOS_ACCION_ADMIN, registrarAccionAdmin };