function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ETIQUETAS_ESTADO = {
  resuelto: { texto: 'Resuelto', color: '#34D399' },
  descartado: { texto: 'Descartado', color: '#A1A1AA' },
  contenido_eliminado: { texto: 'Contenido eliminado', color: '#F87171' },
};

// `mensaje` es la respuesta del moderador (predeterminada o personalizada):
// se escapa siempre, nunca se inserta como HTML.
function plantillaReporte({ estado, mensaje, tipo, motivo, contexto }) {
  const asunto = 'Actualización de tu reporte en InFACE';
  const etiqueta = ETIQUETAS_ESTADO[estado] ?? {
    texto: 'Cerrado',
    color: '#A1A1AA',
  };
  const mensajeHtml = escapar(mensaje).replace(/\r?\n/g, '<br>');
  const contextoHtml = contexto ? ` · «${escapar(contexto)}»` : '';
  const contextoTexto = contexto ? ` · «${contexto}»` : '';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${asunto}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B0E;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Revisamos el reporte que enviaste.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0B0B0E;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">
      <tr><td style="padding:0 4px 20px 4px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#F4F4F5;">
        In<span style="color:#EC4899;">FACE</span>
      </td></tr>
      <tr><td style="background:#1E1E24;border:1px solid #2C2C34;border-radius:18px;padding:0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td style="height:4px;background:#EC4899;border-radius:18px 18px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:32px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:13px;font-weight:600;color:#F472B6;margin-bottom:10px;">Tu reporte</div>
            <h1 style="margin:0 0 14px 0;font-size:26px;line-height:1.2;font-weight:800;color:#F4F4F5;">Actualización de tu reporte</h1>
            <div style="margin:0 0 18px 0;">
              <span style="display:inline-block;border:1px solid ${etiqueta.color};color:${etiqueta.color};border-radius:999px;padding:4px 12px;font-size:12.5px;font-weight:700;">${etiqueta.texto}</span>
            </div>
            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#A1A1AA;">${mensajeHtml}</p>
          </td></tr>
          <tr><td style="padding:0 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
            <div style="background:#16161B;border:1px solid #2C2C34;border-radius:12px;padding:14px 16px;font-size:13px;line-height:1.7;color:#A1A1AA;">
              <div><span style="color:#71717A;">Contenido reportado:</span> <b style="color:#F4F4F5;">${escapar(tipo)}</b>${contextoHtml}</div>
              <div><span style="color:#71717A;">Motivo:</span> <b style="color:#F4F4F5;">${escapar(motivo)}</b></div>
            </div>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#71717A;">
        Recibes este mensaje automático porque enviaste un reporte en InFACE.<br>
        InFACE · Universidad del Bío-Bío, Facultad de Ciencias Empresariales
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const texto = `Actualización de tu reporte en InFACE

Estado: ${etiqueta.texto}

${mensaje}

Contenido reportado: ${tipo}${contextoTexto}
Motivo: ${motivo}

Este es un mensaje automático porque enviaste un reporte en InFACE.

InFACE · Universidad del Bío-Bío`;

  return { asunto, html, texto };
}

export { plantillaReporte };