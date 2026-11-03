
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plantillaRecuperacion({ enlace, minutos }) {
  const url = escapar(enlace);
  const asunto = 'Restablece tu contraseña de InFACE';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${asunto}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B0E;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Usa este enlace para elegir una contraseña nueva. Vence en ${minutos} minutos.</div>
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
            <div style="font-size:13px;font-weight:600;color:#F472B6;margin-bottom:10px;">Recuperar acceso</div>
            <h1 style="margin:0 0 14px 0;font-size:26px;line-height:1.2;font-weight:800;color:#F4F4F5;">Elige una contraseña nueva</h1>
            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#A1A1AA;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta de InFACE.
              Pulsa el botón para elegir una nueva. El enlace vence en <b style="color:#F4F4F5;">${minutos} minutos</b> y solo sirve una vez.
            </p>
          </td></tr>
          <tr><td align="left" style="padding:0 28px 28px 28px;">
            <a href="${url}" target="_blank" style="display:inline-block;background:#EC4899;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;">Restablecer contraseña</a>
          </td></tr>
          <tr><td style="padding:0 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
            <div style="border-top:1px solid #2C2C34;padding-top:18px;font-size:12.5px;line-height:1.6;color:#71717A;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${url}" target="_blank" style="color:#F472B6;word-break:break-all;">${url}</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#71717A;">
        Si tú no pediste este cambio, ignora este correo: tu contraseña seguirá siendo la misma.<br>
        InFACE · Universidad del Bío-Bío, Facultad de Ciencias Empresariales
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const texto = `Restablece tu contraseña de InFACE

Recibimos una solicitud para restablecer la contraseña de tu cuenta. Abre este enlace para elegir una nueva (vence en ${minutos} minutos y sirve una sola vez):

${enlace}

Si tú no pediste este cambio, ignora este correo.

InFACE · Universidad del Bío-Bío`;

  return { asunto, html, texto };
}

export { plantillaRecuperacion };
