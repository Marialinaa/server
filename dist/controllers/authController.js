"use strict";
// ============================================
// AUTH CONTROLLER - COMPATÍVEL COM MariaDB projeto_ufla
// ============================================
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
exports.login = login;
exports.register = register;
exports.approveUser = approveUser;
exports.rejectUser = rejectUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
// @ts-ignore - db.js tem declaração de tipos em db.d.ts
const db_1 = require("../utils/db");
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-aqui-MUDE-EM-PRODUCAO';
const JWT_EXPIRES_IN = '24h';
// ============================================
// LOGIN - Suporta email/login e senha
// ============================================
async function login(req, res) {
    try {
        const emailOrLogin = req.body.email || req.body.login;
        const password = req.body.senha || req.body.password;
        const tipoUsuario = req.body.tipo_usuario;
        if (!emailOrLogin || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/login e senha são obrigatórios'
            });
        }
        // Buscar usuário por email ou login
        let [rows] = await db_1.pool.execute('SELECT * FROM usuarios WHERE email = ? OR login = ? LIMIT 1', [emailOrLogin, emailOrLogin]);
        const user = rows[0];
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }
        // Validar tipo de usuário se informado
        if (tipoUsuario && user.tipo_usuario !== tipoUsuario) {
            return res.status(401).json({
                success: false,
                message: 'Tipo de usuário incorreto'
            });
        }
        // Validar senha com bcrypt
        const senhaValida = await bcrypt_1.default.compare(password, user.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }
        // Gerar token JWT
        const payload = {
            id: user.id,
            email: user.email,
            tipo_usuario: user.tipo_usuario
        };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        // Atualizar último acesso
        await db_1.pool.execute('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?', [user.id]);
        delete user.senha_hash;
        return res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user
        });
    }
    catch (error) {
        console.error('❌ Erro no login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
}
// ============================================
// REGISTER - Criar nova solicitação de acesso
// ============================================
async function register(req, res) {
    try {
        const { nome, email, login, senha, tipo_usuario } = req.body;
        if (!nome || !email || !login || !senha || !tipo_usuario) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }
        const tiposPermitidos = ['bolsista', 'responsavel'];
        if (!tiposPermitidos.includes(tipo_usuario)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de usuário inválido'
            });
        }
        // Verificar se já existe usuário com mesmo email/login
        const [existingUser] = await db_1.pool.execute('SELECT id FROM usuarios WHERE email = ? OR login = ? LIMIT 1', [email, login]);
        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email ou login já cadastrado no sistema'
            });
        }
        // Verificar se já há solicitação pendente
        const [existingSolicitacao] = await db_1.pool.execute('SELECT id FROM solicitacoes WHERE email = ? OR login = ? AND status = "pendente" LIMIT 1', [email, login]);
        if (existingSolicitacao.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Já existe uma solicitação pendente para este email/login'
            });
        }
        // Criar hash da senha
        const senha_hash = await bcrypt_1.default.hash(senha, 10);
        // Inserir nova solicitação
        const [result] = await db_1.pool.execute('INSERT INTO solicitacoes (nome_completo, email, senha_hash, tipo_usuario, login, status) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, senha_hash, tipo_usuario, login, 'pendente']);
        return res.status(201).json({
            success: true,
            message: 'Solicitação enviada com sucesso! Aguarde aprovação do administrador.',
            data: {
                id: result.insertId,
                nome,
                email,
                tipo_usuario,
                status: 'pendente'
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao registrar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
}
// ============================================
// APPROVE USER - Aprovar solicitação pendente
// ============================================
async function approveUser(req, res) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'ID da solicitação é obrigatório' });
        }
        // Buscar solicitação
        const [rows] = await db_1.pool.execute('SELECT * FROM solicitacoes WHERE id = ? LIMIT 1', [userId]);
        const solicitacao = rows[0];
        if (!solicitacao) {
            return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
        }
        // Inserir usuário aprovado em `usuarios`
        await db_1.pool.execute(`INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_usuario, login, data_criacao)
       VALUES (?, ?, ?, ?, ?, NOW())`, [solicitacao.nome_completo, solicitacao.email, solicitacao.senha_hash, solicitacao.tipo_usuario, solicitacao.login]);
        // Atualizar status da solicitação
        await db_1.pool.execute('UPDATE solicitacoes SET status = "aprovada" WHERE id = ?', [userId]);
        return res.json({
            success: true,
            message: 'Usuário aprovado e movido para tabela de usuários'
        });
    }
    catch (error) {
        console.error('❌ Erro ao aprovar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao aprovar solicitação'
        });
    }
}
// ============================================
// REJECT USER - Rejeitar solicitação
// ============================================
async function rejectUser(req, res) {
    try {
        const { userId, motivo } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'ID da solicitação é obrigatório' });
        }
        const [rows] = await db_1.pool.execute('SELECT * FROM solicitacoes WHERE id = ? LIMIT 1', [userId]);
        const solicitacao = rows[0];
        if (!solicitacao) {
            return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
        }
        await db_1.pool.execute('UPDATE solicitacoes SET status = "rejeitada" WHERE id = ?', [userId]);
        return res.json({
            success: true,
            message: 'Solicitação rejeitada com sucesso',
            motivo: motivo || null
        });
    }
    catch (error) {
        console.error('❌ Erro ao rejeitar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao rejeitar solicitação'
        });
    }
}
//# sourceMappingURL=authController.js.map