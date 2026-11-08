// Correo con el código para verificar el correo institucional al registrarse.
// El código son solo dígitos generados por el servidor: no hay texto del
// usuario que escapar.
function plantillaVerificacion({ codigo, vigenciaMin }) {
  const asunto = 'Tu código de verificación de InFACE';
  const intro =
    'Usa este código para verificar tu correo institucional y terminar tu registro en InFACE:';
  const cierre = `El código vence en ${vigenciaMin} minutos. Si no estás registrándote en InFACE, ignora este mensaje: nadie podrá crear una cuenta con tu correo sin este código.`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${asunto}</title>
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
            <h1 style="margin:0 0 14px 0;font-size:26px;line-height:1.2;font-weight:800;color:#F4F4F5;">Verifica tu correo</h1>
            <p style="margin:0 0 18px 0;font-size:14.5px;line-height:1.6;color:#A1A1AA;">${intro}</p>
            <div style="margin:0 0 18px 0;padding:16px;background:#17171B;border:1px solid #2C2C34;border-radius:12px;text-align:center;font-size:34px;font-weight:800;letter-spacing:10px;color:#F4F4F5;">${codigo}</div>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#71717A;">${cierre}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const texto = `Verifica tu correo\n\n${intro}\n\n${codigo}\n\n${cierre}`;

  return { asunto, html, texto };
}

export { plantillaVerificacion };