"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const os_1 = __importDefault(require("os"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const usuariosRoutes_1 = __importDefault(require("./usuariosRoutes"));
const atribuicoesRoutes_1 = __importDefault(require("./atribuicoesRoutes"));
const horariosRoutes_1 = __importDefault(require("./horariosRoutes"));
const router = express_1.default.Router();
// Rota de teste simples
router.get('/test', (_req, res) => {
    res.json({
        success: true,
        message: 'API funcionando normalmente',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3005
    });
});
// Rota de teste para redirectTo
router.post('/test-redirect', (_req, res) => {
    res.json({
        success: true,
        message: 'Teste de redirectTo',
        redirectTo: '/admin',
        testField: 'TESTE_FUNCIONANDO',
        timestamp: new Date().toISOString()
    });
});
// Rota de debug para verificar estrutura da tabela
router.post('/debug/sql', async (req, res) => {
    try {
        const DatabaseConnection = await Promise.resolve().then(() => __importStar(require('../utils/db')));
        const pool = await DatabaseConnection.default.getInstance();
        console.log('🔍 [DEBUG-SQL] Executando:', req.body.sql);
        const [rows] = await pool.execute(req.body.sql);
        res.json({
            success: true,
            message: 'SQL executado com sucesso',
            data: rows,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ [DEBUG-SQL] Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro executando SQL',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Rota de teste para email
router.post('/test-email', async (_req, res) => {
    try {
        const { sendEmail, notificarAdminNovoUsuario } = await Promise.resolve().then(() => __importStar(require('../email')));
        console.log('📧 [TEST] Testando função de email...');
        // Testar email simples
        const resultadoSimples = await sendEmail('mariaxxlina@gmail.com', 'Teste de Email - Sistema Funcionando', '<h1>✅ Sistema de Email Funcionando!</h1><p>Este é um teste para verificar se o email está sendo enviado corretamente.</p>');
        console.log('📧 [TEST] Resultado email simples:', resultadoSimples);
        // Testar notificação de admin
        const resultadoAdmin = await notificarAdminNovoUsuario({
            nome: 'Usuario Teste Email',
            tipo_usuario: 'bolsista',
            email: 'teste@exemplo.com',
            login: 'teste123'
        });
        console.log('📧 [TEST] Resultado notificação admin:', resultadoAdmin);
        res.json({
            success: true,
            message: 'Teste de email executado',
            resultados: {
                emailSimples: resultadoSimples,
                notificacaoAdmin: resultadoAdmin
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ [TEST] Erro no teste de email:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no teste de email',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Rota de teste para registro
router.post('/test-register', (req, res) => {
    console.log('📋 [TEST-REGISTER] Requisição recebida:', req.body);
    res.json({
        success: true,
        message: 'Teste de registro funcionando',
        body: req.body,
        timestamp: new Date().toISOString()
    });
});
// Teste simplificado de auth/register
router.post('/simple-register', async (req, res) => {
    try {
        console.log('🧪 [SIMPLE-REGISTER] Iniciando teste simples...');
        console.log('📋 [SIMPLE-REGISTER] Body:', req.body);
        res.json({
            success: true,
            message: 'Função de registro simplificada funcionando',
            receivedData: req.body
        });
    }
    catch (error) {
        console.error('❌ [SIMPLE-REGISTER] Erro:', error);
        res.status(500).json({
            success: false,
            message: `Erro: ${error.message}`
        });
    }
});
// Rota que retorna configuração útil para clientes em desenvolvimento
// Detecta o IP local da máquina para facilitar o uso do frontend em outros dispositivos na mesma rede
router.get('/config', (_req, res) => {
    try {
        const interfaces = os_1.default.networkInterfaces();
        let localIP = 'localhost';
        for (const name of Object.keys(interfaces)) {
            const addrs = interfaces[name];
            if (!addrs)
                continue;
            for (const iface of addrs) {
                // procurar IPv4 não-interna
                if ((iface.family === 'IPv4' || (typeof iface.family === 'string' && iface.family.includes('4'))) && !iface.internal) {
                    localIP = iface.address;
                    break;
                }
            }
            if (localIP !== 'localhost')
                break;
        }
        const port = process.env.PORT || 3005;
        const apiUrl = `http://${localIP}:${port}/api`;
        return res.json({ success: true, apiUrl, localIP, port });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao detectar configuração', error: String(error) });
    }
});
// Rotas públicas
router.use('/auth', authRoutes_1.default);
// Middleware de autenticação para rotas protegidas
// router.use(authMiddleware); // Temporariamente desabilitado para testes
// Rotas protegidas
router.use('/usuarios', usuariosRoutes_1.default);
router.use('/atribuicoes', atribuicoesRoutes_1.default);
router.use('/horarios', horariosRoutes_1.default);
exports.default = router;
