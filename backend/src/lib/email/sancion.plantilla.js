function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Un bloque por tipo de sanción. Hoy solo la advertencia envía correo.
const CONTENIDO = {
  advertencia: {
    asunto: 'Recibiste una advertencia en InFACE',
    etiqueta: 'Advertencia',
    color: '#FBBF24',
    titulo: 'Recibiste una advertencia',
    intro:
      'El equipo de moderación de InFACE te envía esta advertencia:',
    cierre:
      'Una advertencia no limita el uso de tu cuenta. Si estas conductas se repiten, podrían aplicarse otras medidas, como restricciones temporales o la suspensión de la cuenta. Puedes revisar las reglas de InFACE dentro de la plataforma.',
  },
};

// `motivo` lo escribe el superadmin: se escapa siempre, nunca va como HTML.
function plantillaSancion({ tipo, motivo }) {
  const c = CONTENIDO[tipo];
  if (!c) return null;
  const motivoHtml = escapar(motivo).replace(/\r?\n/g, '<br>');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${c.asunto}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B0E;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0B0B0E;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">
      <tr><td style="padding:0 4px 20px 4px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#F4F4F5;">
        In<span style="color:#EC4899;">FACE</span>
      </td></tr>
      <tr><td style="background:#1E1E24;border:1px solid #2C2C34;border-radius:18px;padding:0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td style="height:4px;background:#EC4899;border-radius:18px 18px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:32px 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
            <div style="margin:0 0 14px 0;">
              <span style="display:inline-block;border:1px solid ${c.color};color:${c.color};border-radius:999px;padding:4px 12px;font-size:12.5px;font-weight:700;">${c.etiqueta}</span>
            </div>
            <h1 style="margin:0 0 14px 0;font-size:26px;line-height:1.2;font-weight:800;color:#F4F4F5;">${c.titulo}</h1>
            <p style="margin:0 0 14px 0;font-size:14.5px;line-height:1.6;color:#A1A1AA;">${c.intro}</p>
            <div style="margin:0 0 18px 0;padding:14px 16px;background:#17171B;border:1px solid #2C2C34;border-radius:12px;font-size:14.5px;line-height:1.6;color:#E4E4E7;">${motivoHtml}</div>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#71717A;">${c.cierre}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const texto = `${c.titulo}\n\n${c.intro}\n\n${motivo}\n\n${c.cierre}`;

  return { asunto: c.asunto, html, texto };
}

export { plantillaSancion };