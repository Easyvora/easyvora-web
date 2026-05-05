require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes    = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:8080')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (no origin header) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── RATE LIMITS ───────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas solicitudes. Inténtalo en una hora.' },
});

// ── ROUTES ────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// ── ERROR HANDLER ─────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EasyVora API running on port ${PORT}`));
