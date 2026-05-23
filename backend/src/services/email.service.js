const nodemailer = require('nodemailer');

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail con Contraseña de Aplicación de 16 dígitos
    _transporter = nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    console.log('📧 Gmail SMTP configurado —', process.env.EMAIL_USER);
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    console.log('📧 SMTP configurado con credenciales del .env');
  } else {
    const test = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('📧 Ethereal SMTP (demo) — usuario:', test.user);
  }

  return _transporter;
}

function plantillaCorreo({ nombre, nombreEvento, fechaEvento, ubicacion, idRsvp, qrDataUri }) {
  const fecha = fechaEvento
    ? new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
        .format(new Date(fechaEvento))
    : '—';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de Registro — Convexa</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4338ca,#6366f1);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;margin-bottom:12px;">
                <span style="font-size:22px;font-weight:900;color:#fff;">C</span>
              </div>
              <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:0.5px;">CONVEXA · Sistema de Gestión de Eventos</p>
            </td>
          </tr>

          <!-- Check + título -->
          <tr>
            <td style="padding:36px 40px 0;text-align:center;">
              <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <svg width="28" height="28" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">¡Inscripción Confirmada!</h1>
              <p style="margin:0;color:#64748b;font-size:14px;">Hola <strong>${nombre}</strong>, tu lugar está reservado.</p>
            </td>
          </tr>

          <!-- Detalle del evento -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
                <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Detalles del evento</p>
                <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1e293b;">${nombreEvento}</p>
                <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;">
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#64748b;width:36px;">📅</td>
                    <td style="padding:4px 0;font-size:13px;color:#334155;">${fecha}</td>
                  </tr>
                  ${ubicacion ? `<tr>
                    <td style="padding:4px 0;font-size:13px;color:#64748b;">📍</td>
                    <td style="padding:4px 0;font-size:13px;color:#334155;">${ubicacion}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#64748b;">🎫</td>
                    <td style="padding:4px 0;font-size:13px;color:#334155;">N° de registro: <strong>#${String(idRsvp).padStart(6, '0')}</strong></td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- QR -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Presenta este código QR en la entrada del evento</p>
              <div style="display:inline-block;background:#ffffff;border:2px solid #e2e8f0;border-radius:16px;padding:16px;">
                <img src="${qrDataUri}" alt="Código QR de acceso" width="200" height="200" style="display:block;border-radius:8px;" />
              </div>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">Guarda este correo o toma una captura de pantalla</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Convexa · Sistema de Gestión de Eventos · Todos los derechos reservados</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendRsvpConfirmacion({ nombre, correo, nombreEvento, fechaEvento, ubicacion, idRsvp, qrDataUri }) {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from:    process.env.SMTP_FROM || (process.env.EMAIL_USER ? `"Convexa" <${process.env.EMAIL_USER}>` : '"Convexa" <noreply@convexa.com>'),
      to:      correo,
      subject: `✅ Tu registro para ${nombreEvento} — Convexa`,
      html:    plantillaCorreo({ nombre, nombreEvento, fechaEvento, ubicacion, idRsvp, qrDataUri }),
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('📧 Vista previa Ethereal:', preview);
  } catch (err) {
    console.error('⚠️  Error al enviar correo RSVP:', err.message);
  }
}

module.exports = { sendRsvpConfirmacion };
