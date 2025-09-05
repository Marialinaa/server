"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./config/database");
const email_1 = require("./config/email");
// Carregar variáveis de ambiente
dotenv_1.default.config();
// Criar aplicação Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware de segurança
app.use((0, helmet_1.default)());
// Configurar CORS
app.use((0, cors_1.default)({
    // usar a URL real do frontend definida em CORS_ORIGIN no ambiente
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Logging de requisições
app.use((0, morgan_1.default)("dev"));
// Parser para JSON
app.use(express_1.default.json());
// Parser para dados de formulário
app.use(express_1.default.urlencoded({ extended: true }));
// Rota de teste
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "API funcionando normalmente",
        timestamp: new Date().toISOString(),
    });
});
// Usar rotas da API
app.use("/api", routes_1.default);
// Rota de fallback
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada",
    });
});
// Iniciar servidor
const startServer = async () => {
    try {
        // Testar conexão com o banco de dados
        await (0, database_1.testDatabaseConnection)();
        // Verificar configuração de email
        await (0, email_1.verificarConfiguracao)();
        // Iniciar servidor Express
        // ✅ Novo
        const HOST = "0.0.0.0"; // aceita conexões de qualquer lugar (localhost, emulador, celular na mesma rede)
        const PORT_NUM = Number(PORT) || 3001;
        app.listen(PORT_NUM, HOST, () => {
            console.log("=======================================================");
            console.log(`🚀 Servidor rodando na porta ${PORT_NUM}`);
            console.log(`📝 Localhost:     http://localhost:${PORT_NUM}/api/health`);
            console.log(`📝 Emulador AVD:  http://10.0.2.2:${PORT_NUM}/api/health`);
            console.log(`📝 Rede Local:    http://192.168.x.x:${PORT_NUM}/api/health`);
            console.log("=======================================================");
        });
    }
    catch (error) {
        console.error("❌ Erro ao iniciar o servidor:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map