"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3002;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rota de teste simples
app.get('/api/health', (req, res) => {
    console.log('🔥 Rota /api/health chamada!');
    res.json({
        status: 'ok',
        message: 'API funcionando normalmente',
        timestamp: new Date().toISOString(),
    });
});
// Rota de teste para usuários
app.get('/api/usuarios/test', (req, res) => {
    console.log('🔥 Rota /api/usuarios/test chamada!');
    res.json({
        success: true,
        message: 'Rota de usuários funcionando',
        data: [
            {
                id: 1,
                nome: 'Admin Teste',
                email: 'admin@test.com',
                tipo_usuario: 'admin'
            }
        ]
    });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
=======================================================
🚀 Servidor SIMPLES rodando na porta ${PORT}
📝 Teste: http://localhost:${PORT}/api/health
📝 Usuários: http://localhost:${PORT}/api/usuarios/test
=======================================================
  `);
});
console.log('Iniciando servidor...');
//# sourceMappingURL=simple-server.js.map