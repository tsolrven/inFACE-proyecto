import React from 'react';

/*
 * Genera las iniciales de un usuario a partir de su nombre.
 */
export function getInitials(name) {
    if (!name) return '??';

    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/*
 * Devuelve un set de clases de Tailwind fijas basadas en un ID numérico o String
 */
export function avatarColor(id) {
    const colors = [
        { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
        { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
        { bg: 'bg-amber-500/10', text: 'text-amber-400' },
        { bg: 'bg-rose-500/10', text: 'text-rose-400' },
        { bg: 'bg-sky-500/10', text: 'text-sky-400' },
        { bg: 'bg-violet-500/10', text: 'text-violet-400' },
        { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400' },
    ];

    if (!id) return colors[0];

    const stringId = String(id);
    let hash = 0;
    for (let i = 0; i < stringId.length; i++) {
        hash = stringId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

/*
 * Formatea una fecha ISO a un formato local legible.
 */
export function formatFecha(fecha) {
    if (!fecha) return '---';
    const date = new Date(fecha);

    if (isNaN(date.getTime())) return '---';

    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/*
 * Devuelve una cadena de tiempo relativo simplificada (ej. "hace 5 min", "hace 2 días")
 */
export function tiempoRelativo(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';

    const ahora = new Date();
    const diferenciaMs = ahora - date;

    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) return 'hace unos instantes';
    if (minutos < 60) return `hace ${minutos} min`;
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

    return formatFecha(fecha);
}

/*
 * Paleta de colores por etiqueta (consistente con la estética rosa/oscura de la app).
 * Se usa tanto en los chips de etiquetas como en las barras de "habilidades en demanda",
 * para que una misma etiqueta siempre se vea del mismo color en todos lados.
 */
const PALETA_ETIQUETAS = [
    { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/25', hex: '#E8546A' },
    { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/25', hex: '#818CF8' },
    { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25', hex: '#34D399' },
    { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25', hex: '#FBBF24' },
    { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/25', hex: '#38BDF8' },
    { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/25', hex: '#A78BFA' },
    { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25', hex: '#FB7185' },
    { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/25', hex: '#2DD4BF' },
    { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25', hex: '#FB923C' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/25', hex: '#E879F9' },
];

export function etiquetaColor(idOrNombre) {
    const str = String(idOrNombre || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETA_ETIQUETAS[Math.abs(hash) % PALETA_ETIQUETAS.length];
}

/*
 * Asignación FIJA de color por carrera (no por hash), para que cada carrera
 * conocida tenga siempre un color distinto y nunca choque con otra. Las
 * carreras que no estén en esta lista igual reciben un color (por hash del
 * código), solo que sin la garantía de no-choque entre ellas.
 */
const COLOR_POR_CODIGO_CARRERA = {
    IECI: PALETA_ETIQUETAS[4], // sky
    ICINF: PALETA_ETIQUETAS[1], // indigo
    DER: PALETA_ETIQUETAS[6], // rose
    ICO: PALETA_ETIQUETAS[3], // amber
    CPA: PALETA_ETIQUETAS[2], // emerald
};

export function carreraColor(codigo) {
    if (!codigo) return PALETA_ETIQUETAS[0];
    return COLOR_POR_CODIGO_CARRERA[codigo] || etiquetaColor(codigo);
}

/*
 * Helper para renderizar los estados generales (Compatible con .js)
 */
export function EstadoChip({ estado }) {
    const map = {
        abierto: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
        en_progreso: 'border-blue-400/25 bg-blue-400/10 text-blue-400',
        cerrado: 'border-white/10 bg-white/[0.06] text-neutral-400',
        pendiente: 'border-amber-400/25 bg-amber-400/10 text-amber-400',
        aceptada: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
        rechazada: 'border-white/10 bg-white/[0.06] text-red-400',
    };

    const label = { 
        abierto: 'Abierto', 
        en_progreso: 'En Progreso', 
        cerrado: 'Cerrado',
        pendiente: 'Pendiente', 
        aceptada: 'Aceptada', 
        rechazada: 'Rechazada' 
    };

    const clave = String(estado).toLowerCase();

    return React.createElement(
        'span',
        { className: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[clave] || map.cerrado}` },
        label[clave] || estado
    );
}

/*
 * Helper para renderizar los estados de las postulaciones compatible con archivos .js
 */
export function EstadoPostulacionChip({ estado }) {
    const map = {
        pendiente: 'border-amber-400/25 bg-amber-400/10 text-amber-400',
        aceptada: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
        rechazada: 'border-white/10 bg-white/[0.06] text-red-400',
        abierto: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
        en_progreso: 'border-blue-400/25 bg-blue-400/10 text-blue-400',
        cerrado: 'border-white/10 bg-white/[0.06] text-neutral-400',
    };

    const label = { 
        pendiente: 'Pendiente', 
        aceptada: 'Aceptada', 
        rechazada: 'Rechazada',
        abierto: 'Abierto',
        en_progreso: 'En Progreso',
        cerrado: 'Cerrado'
    };

    return React.createElement(
        'span',
        { className: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[estado] || map.pendiente}` },
        label[estado] || estado
    );
}

/*
 * Helper para renderizar la modalidad del proyecto (Presencial, Remoto, etc.)
 */
export function ModalidadChip({ modalidad }) {
    const map = {
        presencial: 'border-sky-400/25 bg-sky-400/10 text-sky-400',
        remoto: 'border-purple-400/25 bg-purple-400/10 text-purple-400',
        hibrido: 'border-teal-400/25 bg-teal-400/10 text-teal-400',
    };

    const label = {
        presencial: 'Presencial',
        remoto: 'Remoto',
        hibrido: 'Híbrido',
    };

    const clave = String(modalidad).toLowerCase();

    return React.createElement(
        'span',
        { className: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[clave] || 'border-white/10 bg-white/[0.06] text-neutral-400'}` },
        label[clave] || modalidad
    );
}