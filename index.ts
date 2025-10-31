// ============================================
// SERVER ENTRY POINT - VERSÃO CLOUD PRODUCTION
// ============================================

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './utils/errorHandler';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// ============================================
// 🔒 MIDDLEWARES GLOBAIS
// ============================================

// Segurança HTTP
app.use(helmet({
  contentSecurityPolicy: isProd, // CSP só em produção
  crossOriginEmbedderPolicy: false,
}));

// Configuração de CORS dinâmica
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://aura-hub.vercel.app',
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || !isProd) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS bloqueado para origem: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
app.use(morgan(isProd ? 'combined' : 'dev'));

// Parsing de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// ✅ HEALTH CHECK E INFO
// ============================================

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const { checkHealth } = require('./utils/db');
    const dbHealth = await checkHealth();

    res.json({
      status: 'ok',
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
      database: dbHealth,
      uptime: process.uptime(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      message: error.message,
      database: { healthy: false },
    });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Aura-Hub API',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs',
    },
  });
});

// ============================================
// 🌐 ROTAS DA API
// ============================================

app.use('/api', routes);

// ============================================
// ⚠️ TRATAMENTO DE ERROS
// ============================================

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.path,
    method: req.method,
  });
});

// Handler global de erros
app.use(errorHandler);

// ============================================
// 🚀 START SERVER
// ============================================

async function startServer() {
  try {
    console.log('⏳ Aguardando conexão com banco de dados...');
    const { checkHealth } = require('./utils/db');
    const dbHealth = await checkHealth();

    if (!dbHealth.healthy) {
      throw new Error(`Database não está saudável: ${dbHealth.message}`);
    }

    console.log('✅ Banco de dados conectado!');

    app.listen(PORT, () => {
      console.log('\n================================');
      console.log(`🚀 AURA-HUB API - ${NODE_ENV.toUpperCase()}`);
      console.log('================================');
      console.log(`� Servidor ativo na porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${NODE_ENV}`);
      console.log(`�️  Database: Conectado`);
      console.log(`� Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
      console.log('================================\n');
    });

  } catch (error: any) {
    console.error('💥 Erro ao iniciar servidor:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// 🧹 SHUTDOWN GRACEFUL
// ============================================

const shutdown = async (signal: string) => {
  console.log(`⚠️  ${signal} recebido, encerrando servidor...`);
  const { closePool } = require('./utils/db');
  await closePool();
  console.log('👋 Servidor encerrado com segurança.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Iniciar servidor
startServer();

export default app;
