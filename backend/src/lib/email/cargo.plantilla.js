function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Aviso de que un cargo (CEE o tutor) está por vencer. Todos los valores se
// escapan: la carrera viene de la BD, pero nunca va como HTML.
function plantillaCargoPorVencer({ etiqueta, carrera, fecha, plazo }) {
  const asunto = `Tu cargo de ${etiqueta} en InFACE vence ${plazo}`;
  const titulo = `Tu cargo de ${escapar(etiqueta)} vence ${escapar(plazo)}`;
  const intro = `Tu cargo de ${escapar(etiqueta)} en ${escapar(carrera)} vence el ${escapar(fecha)}.`;
  const cierre =
    'Al vencer, dejarás de poder publicar anuncios y administrar flairs en tu carrera. Para continuar, deberás enviar una nueva solicitud dentro de la plataforma.';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${escapar(asunto)}</title>
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
              <span style="display:inline-block;border:1px solid #FBBF24;color:#FBBF24;border-radius:999px;padding:4px 12px;font-size:12.5px;font-weight:700;">Cargo por vencer</span>
            </div>
            <h1 style="margin:0 0 14px 0;font-size:26px;line-height:1.2;font-weight:800;color:#F4F4F5;">${titulo}</h1>
            <p style="margin:0 0 14px 0;font-size:14.5px;line-height:1.6;color:#E4E4E7;">${intro}</p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#71717A;">${cierre}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const texto = `Tu cargo de ${etiqueta} vence ${plazo}\n\nTu cargo de ${etiqueta} en ${carrera} vence el ${fecha}.\n\n${cierre}`;

  return { asunto, html, texto };
}

export { plantillaCargoPorVencer };