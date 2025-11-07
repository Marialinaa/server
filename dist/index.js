"use strict";
// ============================================
// SERVER ENTRY POINT - VERSÃO CLOUD PRODUCTION
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./utils/errorHandler");
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
// ============================================
// 🔒 MIDDLEWARES GLOBAIS
// ============================================
// Segurança HTTP
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || !isProd) {
            callback(null, true);
        }
        else {
            console.warn(`🚫 CORS bloqueado para origem: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Logging
app.use((0, morgan_1.default)(isProd ? 'combined' : 'dev'));
// Parsing de body
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ============================================
// ✅ HEALTH CHECK E INFO
// ============================================
app.get('/health', async (_req, res) => {
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
    }
    catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message,
            database: { healthy: false },
        });
    }
});
app.get('/', (_req, res) => {
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
app.use('/api', routes_1.default);
// ============================================
// ⚠️ TRATAMENTO DE ERROS
// ============================================
// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado',
        path: req.path,
        method: req.method,
    });
});
// Handler global de erros
app.use(errorHandler_1.errorHandler);
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
    }
    catch (error) {
        console.error('💥 Erro ao iniciar servidor:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}
// ============================================
// 🧹 SHUTDOWN GRACEFUL
// ============================================
const shutdown = async (signal) => {
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
exports.default = app;
