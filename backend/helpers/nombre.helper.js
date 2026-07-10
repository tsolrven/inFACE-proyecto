//! deriva el nombre completo del usuario a partir de su correo institucional,
//! ya que estos siguen el patrón "nombre.apellido[código]@dominio"
//! (ej: valentina.martinez2302@alumnos.ubiobio.cl -> "Valentina Martinez")

/*
 * Quita tildes/diacríticos y deja solo minúsculas a-z
 */
function normalizarTexto(str = '') {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
}

/*
 * Extrae las "partes" del nombre a partir del correo institucional.
 * "valentina.martinez2302@alumnos.ubiobio.cl" -> ["valentina", "martinez"]
 */
function extraerPartesDeCorreo(correo = '') {
    const local = correo.split('@')[0] || '';
    const sinCodigoFinal = local.replace(/\d+$/, ''); // quita el código numérico final (generación/matrícula)
    return sinCodigoFinal
        .split(/[._-]+/)
        .map(normalizarTexto)
        .filter(Boolean);
}

/*
 * Pone en mayúscula la primera letra de una palabra
 */
function capitalizar(palabra = '') {
    if (!palabra) return palabra;
    return palabra[0].toUpperCase() + palabra.slice(1);
}

/*
 * Deriva un nombre completo "presentable" a partir del correo institucional.
 * "valentina.martinez2302@alumnos.ubiobio.cl" -> "Valentina Martinez"
 * "nao@alumnos.ubiobio.cl" -> "Nao"
 * Nota: al venir solo del correo, no puede recuperar tildes (ej. "Martínez"
 * queda como "Martinez"); el usuario no puede editarlo después de todos modos.
 */
function derivarNombreDesdeCorreo(correo = '') {
    const partes = extraerPartesDeCorreo(correo);
    if (partes.length === 0) return null;
    return partes.map(capitalizar).join(' ');
}

export { derivarNombreDesdeCorreo, extraerPartesDeCorreo, normalizarTexto, capitalizar };
