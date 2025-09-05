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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carregar .env do diretório correto
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env') });
console.log('🔍 Variáveis de ambiente carregadas:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3001; // Backend rodará na 3001, frontend no 3000 com proxy
// Middleware
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express_1.default.json());
// Rota de teste simples
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor backend funcionando!',
        timestamp: new Date().toISOString()
    });
});
// Rota para criar usuário de teste
app.post('/api/create-test-user', async (req, res) => {
    try {
        const { default: pool } = await Promise.resolve().then(() => __importStar(require('./config/database')));
        const testUser = {
            nome: 'Admin Teste',
            email: 'admin@example.com',
            senha: 'admin123',
            tipo_usuario: 'admin'
        };
        // Verificar se usuário já existe
        const [existingUsers] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [testUser.email]);
        if (existingUsers.length > 0) {
            return res.json({
                success: true,
                message: 'Usuário de teste já existe',
                user: { email: testUser.email, tipo_usuario: testUser.tipo_usuario }
            });
        }
        // Verificar estrutura da tabela
        const [colunas] = await pool.execute('DESCRIBE usuarios');
        const hasNomeCompleto = colunas.some((col) => col.Field === 'nome_completo');
        const nomeField = hasNomeCompleto ? 'nome_completo' : 'nome';
        const senhaField = colunas.some((col) => col.Field === 'senha_hash') ? 'senha_hash' : 'senha';
        // Inserir usuário de teste
        const [result] = await pool.execute(`INSERT INTO usuarios (${nomeField}, email, ${senhaField}, tipo_usuario) VALUES (?, ?, ?, ?)`, [testUser.nome, testUser.email, testUser.senha, testUser.tipo_usuario]);
        console.log('✅ Usuário de teste criado:', testUser.email);
        res.json({
            success: true,
            message: 'Usuário de teste criado com sucesso',
            user: {
                id: result.insertId,
                email: testUser.email,
                tipo_usuario: testUser.tipo_usuario
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar usuário de teste:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário de teste',
            error: error.message
        });
    }
});
// Rota básica de usuários para teste
app.get('/api/usuarios', async (req, res) => {
    try {
        // Import dinâmico para evitar problemas de inicialização
        const { default: pool } = await Promise.resolve().then(() => __importStar(require('./config/database')));
        // Verificar qual banco estamos usando
        const [dbInfo] = await pool.execute('SELECT DATABASE() as current_db');
        console.log('📂 Banco conectado:', dbInfo[0].current_db);
        // Verificar estrutura da tabela
        const [colunas] = await pool.execute('DESCRIBE usuarios');
        const hasNomeCompleto = colunas.some((col) => col.Field === 'nome_completo');
        const hasNome = colunas.some((col) => col.Field === 'nome');
        console.log('🏗️ Campos disponíveis:', { hasNomeCompleto, hasNome });
        // Usar a query correta baseada na estrutura do banco
        const nomeField = hasNomeCompleto ? 'nome_completo' : 'nome';
        const [users] = await pool.execute(`SELECT id, ${nomeField} as nome, email, tipo_usuario FROM usuarios LIMIT 10`);
        res.json({
            success: true,
            data: users,
            banco: dbInfo[0].current_db,
            estrutura: { hasNomeCompleto, hasNome }
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários',
            error: error.message
        });
    }
});
// Rota de login simples para teste
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log('🔐 Tentativa de login para:', email);
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        // Import dinâmico para evitar problemas de inicialização
        const { default: pool } = await Promise.resolve().then(() => __importStar(require('./config/database')));
        // Verificar estrutura da tabela para usar o campo correto
        const [colunas] = await pool.execute('DESCRIBE usuarios');
        const hasNomeCompleto = colunas.some((col) => col.Field === 'nome_completo');
        const nomeField = hasNomeCompleto ? 'nome_completo' : 'nome';
        const senhaField = colunas.some((col) => col.Field === 'senha_hash') ? 'senha_hash' : 'senha';
        // Buscar usuário
        const [users] = await pool.execute(`SELECT id, ${nomeField} as nome, email, ${senhaField} as senha, tipo_usuario FROM usuarios WHERE email = ?`, [email]);
        if (users.length === 0) {
            console.log('❌ Usuário não encontrado:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }
        const user = users[0];
        // Verificação simples de senha (sem hash por enquanto)
        if (user.senha !== senha) {
            console.log('❌ Senha incorreta para:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }
        console.log('✅ Login bem-sucedido:', email);
        // Retornar dados do usuário (sem senha)
        const { senha: _, ...userSemSenha } = user;
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            user: userSemSenha,
            token: 'fake-jwt-token-for-testing'
        });
    }
    catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// Rota para registro de usuários
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nome, email, login, senha, tipo_usuario } = req.body;
        console.log('📝 Registrando novo usuário:', { nome, email, tipo_usuario });
        if (!nome || !email || !senha || !tipo_usuario) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }
        const { default: pool } = await Promise.resolve().then(() => __importStar(require('./config/database')));
        // Verificar se usuário já existe
        const [existingUsers] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }
        // Inserir novo usuário
        const [result] = await pool.execute('INSERT INTO usuarios (nome_completo, email, login, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?, ?)', [nome, email, login || email.split('@')[0], senha, tipo_usuario]);
        console.log('✅ Usuário registrado com ID:', result.insertId);
        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            data: {
                id: result.insertId,
                nome,
                email,
                tipo_usuario
            }
        });
    }
    catch (error) {
        console.error('❌ Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 CORS configurado para: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    console.log(`🗃️ Banco de dados: ${process.env.DB_NAME || 'aura_hubb'}`);
    console.log('🔍 Configuração de banco:', {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'aura_hubb',
        password: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'
    });
});
exports.default = app;
//# sourceMappingURL=server-simples.js.map