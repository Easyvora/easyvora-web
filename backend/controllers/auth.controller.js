const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const valid = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Error de autenticación.' });
  }
};
