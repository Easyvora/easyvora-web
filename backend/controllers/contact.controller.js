const db          = require('../config/database');
const transporter = require('../config/email');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.submit = async (req, res) => {
  try {
    const { nombre, empresa, email, telefono, servicio, mensaje } = req.body;

    if (!nombre?.trim() || !empresa?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Nombre, empresa y email son obligatorios.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Email no válido.' });
    }

    // Persist to DB
    await db.execute(
      `INSERT INTO contacts (nombre, empresa, email, telefono, servicio, mensaje)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        empresa.trim(),
        email.trim().toLowerCase(),
        telefono?.trim() || null,
        servicio?.trim() || null,
        mensaje?.trim()  || null,
      ]
    );

    const from = `"EasyVora" <${process.env.SMTP_USER}>`;

    // Internal notification
    await transporter.sendMail({
      from,
      to:      process.env.SMTP_USER,
      replyTo: email,
      subject: `Solicitud — ${empresa}`,
      html: `
        <h2 style="font-family:sans-serif">Nueva solicitud de contacto</h2>
        <table style="font-family:sans-serif;border-collapse:collapse" cellpadding="8">
          <tr><td><b>Nombre</b></td><td>${nombre}</td></tr>
          <tr><td><b>Empresa</b></td><td>${empresa}</td></tr>
          <tr><td><b>Email</b></td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td><b>Teléfono</b></td><td>${telefono || '—'}</td></tr>
          <tr><td><b>Servicio</b></td><td>${servicio || '—'}</td></tr>
          <tr><td><b>Mensaje</b></td><td style="max-width:400px">${mensaje || '—'}</td></tr>
        </table>`,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from,
      to:      email,
      subject: 'Hemos recibido tu solicitud — EasyVora',
      html: `
        <div style="font-family:sans-serif;max-width:520px">
          <p>Hola <b>${nombre}</b>,</p>
          <p>Gracias por contactar con <b>EasyVora</b>. Hemos recibido tu solicitud
             y te responderemos en un plazo de <b>24 horas</b>.</p>
          <p style="color:#555">El equipo de EasyVora<br/>
          <a href="mailto:info@easyvoraproyect.com">info@easyvoraproyect.com</a></p>
        </div>`,
    });

    res.json({ ok: true, message: 'Solicitud recibida. Te contactaremos pronto.' });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: 'Error al enviar la solicitud. Inténtalo de nuevo.' });
  }
};

exports.list = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nombre, empresa, email, telefono, servicio, mensaje, created_at FROM contacts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Contact list error:', err);
    res.status(500).json({ error: 'Error al obtener los contactos.' });
  }
};
