require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const db = require('./utils/db');
const authController = require('./controllers/authController');
const usuariosController = require('./controllers/usuariosController');
const horariosController = require('./controllers/horariosController');
const atribuicoesController = require('./controllers/atribuicoesController');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
// Lê CORS_ORIGIN da env (lista separada por vírgula). Em dev garante localhost:5173
const rawCors = process.env.CORS_ORIGIN || '';
let configuredOrigins = rawCors
  ? rawCors.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

// Em modo de desenvolvimento, sempre inclua origins de localhost para facilitar testes
if (process.env.NODE_ENV !== 'production') {
  const devDefaults = ['http://localhost:5173', 'http://localhost:3000'];
  devDefaults.forEach((o) => {
    if (!configuredOrigins.includes(o)) configuredOrigins.push(o);
  });
}

// Se nada estiver configurado, use localhost:5173 como fallback (cautela em produção)
if (configuredOrigins.length === 0) configuredOrigins = ['http://localhost:5173'];

console.log('🌐 CORS configured origins:', configuredOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (like curl, mobile apps) when origin is undefined
    if (!origin) return callback(null, true);
    if (configuredOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// route: /api_unificada.php?rota=XXX to keep front-end compatibility
app.all('/api_unificada.php', async (req, res) => {
  const rota = req.query.rota || req.body.rota || '';
  console.log('[API_UNIFICADA] rota=', rota, 'method=', req.method);

  try {
    switch (rota) {
      case 'login':
        return authController.login(req, res);
      case 'usuarios':
        return usuariosController.register(req, res);
      case 'horarios':
        return horariosController.handle(req, res);
      case 'responsavel':
        return usuariosController.responsavelRoutes(req, res);
      case 'atribuicoes':
        return atribuicoesController.handle(req, res);
      case 'listar_usuarios':
        return usuariosController.listarUsuarios(req, res);
      default:
        console.log('[API_UNIFICADA] rota não implementada:', rota);
        return res.status(404).json({ success: false, message: 'Rota não encontrada: ' + rota });
    }
  } catch (err) {
    console.error('[API_UNIFICADA] erro geral:', err);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: err.message });
  }
});

// keep compatibility test route
app.get(['/test', '/api/test'], (req, res) => {
  res.status(200).json({ message: 'API está funcionando!' });
});
// ✅ Novo
const HOST = "0.0.0.0"; 

app.listen(PORT, HOST, () => {
  console.log("=======================================================");
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Localhost:     http://localhost:${PORT}/api/health`);
  console.log(`📝 Emulador AVD:  http://10.0.2.2:${PORT}/api/health`);
  console.log(`📝 Rede Local:    http://192.168.x.x:${PORT}/api/health`);
  console.log("=======================================================");
});
