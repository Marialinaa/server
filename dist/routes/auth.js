"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRegister = exports.handleLogin = void 0;
const db_1 = __importDefault(require("../utils/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// ============================================
// HELPER: Tratamento centralizado de erros
// ============================================
function handleDatabaseError(error, res) {
    if (error.message && error.message.includes('pool not initialized')) {
        return res.status(503).json({
            success: false,
            message: 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.'
        });
    }
    console.error('Database error:', error);
    return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
}
// ============================================
// LOGIN - APENAS USUÁRIOS APROVADOS
// ============================================
const handleLogin = async (req, res) => {
    try {
        console.log("🔐 [SISTEMA NOVO v3.0] Iniciando função de login - DIRECT ROUTE!");
        console.log("🆕 [DEPLOY FORÇADO] HandleLogin executando - REDIRECTO TESTING!");
        const { email, password } = req.body;
        console.log("🔐 Tentativa de login:", { email });
        if (!email || !password) {
            console.log("❌ [handleLogin] Campos obrigatórios não fornecidos");
            res.status(400).json({
                success: false,
                message: "SISTEMA NOVO - Email e senha são obrigatórios",
            });
            return;
        }
        console.log("🔌 [handleLogin] Obtendo conexão com banco...");
        // ✅ Obter pool de forma segura
        const pool = await db_1.default.getInstance();
        console.log("✅ [handleLogin] Conexão obtida com sucesso");
        // Buscar usuário APENAS na tabela usuarios (somente aprovados)
        console.log("🔍 [handleLogin] Buscando usuário na tabela usuarios...");
        const [rows] = await pool.execute('SELECT id, nome_completo, login, email, senha_hash, tipo_usuario FROM usuarios WHERE email = ?', [email]);
        const users = rows;
        console.log(`📋 [handleLogin] Usuários encontrados: ${users.length}`);
        if (users.length === 0) {
            console.log("❌ [handleLogin] Usuário não encontrado");
            res.status(404).json({
                success: false,
                message: "SISTEMA NOVO - Usuário não encontrado ou não aprovado. Verifique se sua conta foi aprovada pelo administrador."
            });
            return;
        }
        const user = users[0];
        console.log(`👤 [handleLogin] Usuário encontrado: ${user.email}, tipo: ${user.tipo_usuario}`);
        // Verificar senha
        console.log("🔐 [handleLogin] Verificando senha...");
        const passwordMatch = await bcrypt_1.default.compare(password, user.senha_hash);
        if (!passwordMatch) {
            console.log("❌ [handleLogin] Senha incorreta");
            res.status(401).json({
                success: false,
                message: "Senha incorreta."
            });
            return;
        }
        console.log("✅ Login bem-sucedido para:", user.email);
        // SE FOR BOLSISTA, REGISTRAR ENTRADA AUTOMATICAMENTE
        if (user.tipo_usuario === 'bolsista') {
            try {
                console.log("📝 [handleLogin] Registrando entrada automática para bolsista:", user.id);
                // Verificar se já há entrada em aberto hoje
                const hoje = new Date().toISOString().split('T')[0];
                const [entradaAberta] = await pool.execute('SELECT id FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? AND hora_saida IS NULL', [user.id, hoje]);
                if (!entradaAberta || entradaAberta.length === 0) {
                    // Registrar nova entrada
                    const agora = new Date();
                    const horaAtual = agora.toTimeString().split(' ')[0];
                    await pool.execute(`INSERT INTO registros_entrada (usuario_id, data_entrada, hora_entrada) 
             VALUES (?, ?, ?)`, [user.id, hoje, horaAtual]);
                    console.log(`✅ [handleLogin] Entrada registrada para bolsista ${user.id} às ${horaAtual}`);
                }
                else {
                    console.log(`ℹ️ [handleLogin] Bolsista ${user.id} já tem entrada registrada hoje`);
                }
            }
            catch (entradaError) {
                console.error('❌ [handleLogin] Erro ao registrar entrada automática:', entradaError);
                // Não falhar o login por causa do erro de entrada
            }
        }
        // Atualizar último login
        try {
            console.log("📝 [handleLogin] Atualizando último login...");
            await pool.execute('UPDATE usuarios SET data_ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        }
        catch (updateError) {
            console.warn('⚠️ [handleLogin] Erro ao atualizar último login:', updateError);
            // Não falhar o login por causa deste erro
        }
        // Determinar dashboard baseado no tipo de usuário
        let redirectTo = '/dashboard'; // default
        if (user.tipo_usuario === 'bolsista') {
            redirectTo = '/bolsista-dashboard';
        }
        else if (user.tipo_usuario === 'responsavel') {
            redirectTo = '/responsavel-dashboard';
        }
        else if (user.tipo_usuario === 'admin') {
            redirectTo = '/admin';
        }
        console.log(`🔄 [handleLogin] Redirecionando ${user.tipo_usuario} para: ${redirectTo}`);
        // Importar JWT dinamicamente
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, email: user.email, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET || 'secret-jwt-key', { expiresIn: '24h' });
        // Criar resposta com redirectTo
        const responseData = {
            success: true,
            message: "Login realizado com sucesso",
            token: token,
            redirectTo: user.tipo_usuario === 'admin' ? '/admin' :
                user.tipo_usuario === 'bolsista' ? '/bolsista-dashboard' :
                    '/responsavel-dashboard',
            user: {
                id: user.id,
                nome_completo: user.nome_completo,
                email: user.email,
                login: user.login,
                tipo_usuario: user.tipo_usuario,
                data_criacao: user.data_criacao,
                ultimo_acesso: new Date().toISOString()
            }
        };
        console.log('🚀 [handleLogin] RESPONSE FINAL:', JSON.stringify(responseData, null, 2));
        console.log('🔍 [handleLogin] redirectTo specifically:', responseData.redirectTo);
        console.log('🔍 [handleLogin] Object keys:', Object.keys(responseData));
        // Retorno do login bem-sucedido - tentar com header explícito
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(responseData));
    }
    catch (error) {
        console.error('❌ [handleLogin] Erro no login:', error);
        console.error('❌ [handleLogin] Stack trace:', error.stack);
        handleDatabaseError(error, res);
    }
};
exports.handleLogin = handleLogin;
// ============================================
// REGISTRO - VIA SOLICITAÇÕES 
// ============================================
const handleRegister = async (req, res) => {
    try {
        console.log("📝 [SISTEMA NOVO v3.0] Iniciando função de registro");
        console.log("🆕 [DEPLOY FORÇADO] HandleRegister executando - COM DEBUG!");
        console.log("📋 [DEBUG] req.body completo:", JSON.stringify(req.body, null, 2));
        const { nome, email, login, senha, tipoUsuario, funcao } = req.body;
        console.log("📝 Tentativa de registro:", { email, nome, tipoUsuario });
        console.log("🔍 [DEBUG] Valores extraídos:", { nome, email, login, senha: senha ? '***' : 'undefined', tipoUsuario });
        // Validar campos obrigatórios básicos
        const camposObrigatorios = ['nome', 'email', 'login', 'senha', 'tipoUsuario'];
        for (const campo of camposObrigatorios) {
            if (!req.body[campo]) {
                console.log(`❌ [handleRegister] Campo obrigatório não fornecido: ${campo}`);
                res.status(400).json({
                    success: false,
                    message: `Campo '${campo}' é obrigatório`
                });
                return;
            }
        }
        // Validar campos específicos por tipo de usuário
        if (tipoUsuario === 'responsavel' && !funcao) {
            console.log("❌ [handleRegister] Função obrigatória para responsáveis");
            res.status(400).json({
                success: false,
                message: 'Campo "funcao" é obrigatório para responsáveis'
            });
            return;
        }
        // Validar tipoUsuario
        if (!['responsavel', 'bolsista'].includes(tipoUsuario)) {
            console.log("❌ [handleRegister] Tipo de usuário inválido:", tipoUsuario);
            res.status(400).json({
                success: false,
                message: 'Tipo de usuário deve ser "responsavel" ou "bolsista"'
            });
            return;
        }
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log("❌ [handleRegister] Email inválido:", email);
            res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
            return;
        }
        // Validar senha
        if (senha.length < 6) {
            console.log("❌ [handleRegister] Senha muito curta");
            res.status(400).json({
                success: false,
                message: 'Senha deve ter pelo menos 6 caracteres'
            });
            return;
        }
        console.log("🔌 [handleRegister] Obtendo conexão com banco...");
        // ✅ Obter pool de forma segura
        const pool = await db_1.default.getInstance();
        console.log("✅ [handleRegister] Conexão obtida com sucesso");
        // Verificar se email já existe nas duas tabelas
        console.log("🔍 [handleRegister] Verificando duplicidade de email...");
        const [emailUsuarios] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        const [emailSolicitacoes] = await pool.execute('SELECT id FROM solicitacoes WHERE email = ?', [email]);
        if (emailUsuarios.length > 0 || emailSolicitacoes.length > 0) {
            console.log("❌ [handleRegister] Email já existe:", email);
            res.status(409).json({
                success: false,
                message: 'Email já cadastrado no sistema'
            });
            return;
        }
        // Verificar se login já existe nas duas tabelas
        console.log("🔍 [handleRegister] Verificando duplicidade de login...");
        const [loginUsuarios] = await pool.execute('SELECT id FROM usuarios WHERE login = ?', [login]);
        const [loginSolicitacoes] = await pool.execute('SELECT id FROM solicitacoes WHERE login = ?', [login]);
        if (loginUsuarios.length > 0 || loginSolicitacoes.length > 0) {
            console.log("❌ [handleRegister] Login já existe:", login);
            res.status(409).json({
                success: false,
                message: 'Login já está em uso'
            });
            return;
        }
        // Criptografar senha
        console.log("🔐 [handleRegister] Criptografando senha...");
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
        // Inserir na tabela solicitacoes (aguardando aprovação)
        console.log("💾 [handleRegister] Salvando solicitação...");
        const [result] = await pool.execute(`INSERT INTO solicitacoes (nome_completo, email, login, senha_hash, tipo_usuario, status, data_solicitacao) 
       VALUES (?, ?, ?, ?, ?, 'pendente', CURRENT_TIMESTAMP)`, [nome, email, login, senhaHash, tipoUsuario]);
        const insertResult = result;
        const novoId = insertResult.insertId;
        console.log(`✅ [handleRegister] Solicitação criada com ID: ${novoId}`);
        const responseData = {
            success: true,
            message: 'Solicitação de cadastro enviada com sucesso! Aguarde a aprovação do administrador.',
            data: {
                id: novoId,
                nome: nome,
                email: email,
                login: login,
                tipo_usuario: tipoUsuario,
                status: 'pendente'
            }
        };
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(responseData));
    }
    catch (error) {
        console.error("❌ [handleRegister] ERRO DETALHADO:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: `Erro no registro: ${error.message}`,
            debug: error.name
        });
    }
};
exports.handleRegister = handleRegister;
