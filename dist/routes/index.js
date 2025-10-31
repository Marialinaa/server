"use strict";
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
//# sourceMappingURL=index.js.map