"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Servidor mínimo para testar se o problema está no código principal
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3002; // Porta diferente para evitar conflitos
// Middlewares básicos
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware de logging
app.use((req, _res, next) => {
    console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});
// Rota de teste básica
app.get('/', (_req, res) => {
    console.log('✅ Rota raiz chamada');
    res.json({
        status: 'ok',
        message: 'Servidor mínimo funcionando',
        timestamp: new Date().toISOString()
    });
});
// Rota de teste para auth
app.post('/api/auth/test', (req, res) => {
    console.log('✅ Rota auth/test chamada');
    console.log('📋 Body:', req.body);
    res.json({
        success: true,
        message: 'Teste de auth funcionando',
        body: req.body
    });
});
// Error handler
app.use((error, _req, res, _next) => {
    console.error('❌ Erro capturado:', error);
    res.status(500).json({ error: error.message });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor mínimo rodando na porta ${PORT}`);
    console.log(`📡 Teste: http://localhost:${PORT}`);
});
// Handlers de shutdown
process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM recebido - encerrando...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('⚠️ SIGINT recebido - encerrando...');
    process.exit(0);
});
console.log('🔍 Servidor mínimo iniciado para diagnóstico');
