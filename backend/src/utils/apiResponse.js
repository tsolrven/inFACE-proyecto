//! clase utilitaria que estandariza las respuestas json de la api (siguiendo un formato consistente para todos los endpoints)

class ApiResponse {
  // respuesta exitosa genérica (200)
  static success(res, data = null, statusCode = 200, meta = null) {
    const body = { success: true, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }
  // recursos creados (201)
  static created(res, data) {
    return ApiResponse.success(res, data, 201);
  }
  // respuestas sin contenido (204)
  static noContent(res) {
    return res.status(204).send();
  }
  // respuesta de error genérica
  static error(
    res,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    message = 'Error interno',
    details = null,
  ) {
    const body = { success: false, error: { code, message } };
    if (details) body.error.details = details;
    return res.status(statusCode).json(body);
  }
  // respuestas con paginación
  static paginated(res, items, total, page, limit) {
    return ApiResponse.success(res, items, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    });
  }
}

export default ApiResponse;
