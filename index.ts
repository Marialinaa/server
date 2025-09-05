import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import routes from "./routes";
import { testDatabaseConnection } from "./config/database";
import { verificarConfiguracao } from "./config/email";

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());

// Configurar CORS
app.use(
  cors({
  // usar a URL real do frontend definida em CORS_ORIGIN no ambiente
  origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging de requisições
app.use(morgan("dev"));

// Parser para JSON
app.use(express.json());

// Parser para dados de formulário
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API funcionando normalmente",
    timestamp: new Date().toISOString(),
  });
});

// Usar rotas da API
app.use("/api", routes);

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
    await testDatabaseConnection();

    // Verificar configuração de email
    await verificarConfiguracao();

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
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();

// Exportar a factory do app para reutilização (ex: node-build.ts)
export const createServer = () => app;
