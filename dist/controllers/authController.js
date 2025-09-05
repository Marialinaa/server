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
exports.rejectUser = exports.approveUser = exports.login = exports.register = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';
// Email do admin para notificações
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const register = async (req, res) => {
    try {
        console.log('📝 Iniciando registro de usuário:', req.body);
        const { nome, email, login, senha, tipo_usuario } = req.body;
        // Validar campos obrigatórios
        if (!nome || !email || !login || !senha || !tipo_usuario) {
            console.log('❌ Dados incompletos na requisição');
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios: nome, email, login, senha, tipo_usuario'
            });
        }
        // Verificar se o email já está cadastrado
        const existingUser = await User_1.default.getByEmail(email);
        if (existingUser) {
            console.log('⚠️ Email já cadastrado:', email);
            return res.status(409).json({
                success: false,
                message: 'Este email já está cadastrado no sistema'
            });
        }
        // Criar o novo usuário
        const newUser = await User_1.default.create({
            nome_completo: nome,
            email,
            login,
            senha_hash: senha,
            tipo_usuario,
            status: 'pendente'
        });
        // Enviar email de notificação para o admin
        try {
            // await sendEmail(
            //   ADMIN_EMAIL,
            //   'Nova solicitação de acesso - AURA-HUBB',
            //   templates.solicitacaoAcesso(nome, tipo_usuario)
            // );
            console.log('📧 Email de notificação enviado para o admin (simulado)');
        }
        catch (emailError) {
            console.error('⚠️ Erro ao enviar email, mas o registro foi criado:', emailError);
        }
        // Retornar sucesso
        console.log('✅ Usuário registrado com sucesso:', { id: newUser.id, nome, email });
        return res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso. Aguardando aprovação do administrador.',
            data: {
                id: newUser.id,
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
            message: 'Erro ao processar o registro',
            error: error.message
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        console.log('🔑 Tentativa de login:', req.body);
        const { email, password, tipo_usuario } = req.body;
        // Validar campos obrigatórios
        if (!email || !password) {
            console.log('❌ Email ou senha não fornecidos');
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        // Buscar usuário pelo email
        const user = await User_1.default.getByEmail(email);
        if (!user) {
            console.log('❌ Usuário não encontrado:', email);
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        // Verificar se o tipo de usuário corresponde (se fornecido)
        if (tipo_usuario && user.tipo_usuario !== tipo_usuario) {
            console.log(`❌ Tipo de usuário incorreto. Esperado: ${tipo_usuario}, Atual: ${user.tipo_usuario}`);
            return res.status(401).json({
                success: false,
                message: 'Tipo de usuário incorreto'
            });
        }
        // Verificar status do usuário
        if (user.status !== 'aprovado' && user.status !== 'liberado') {
            console.log(`❌ Usuário com status "${user.status}" tentando login`);
            return res.status(403).json({
                success: false,
                message: 'Sua solicitação de acesso ainda está pendente de aprovação'
            });
        }
        // Validar senha
        const isValidPassword = await User_1.default.validatePassword(user, password);
        if (!isValidPassword) {
            console.log('❌ Senha incorreta para usuário:', email);
            return res.status(401).json({
                success: false,
                message: 'Senha incorreta'
            });
        }
        // Gerar token JWT
        const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, JWT_SECRET, { expiresIn: '24h' });
        // Retornar usuário e token
        console.log('✅ Login bem-sucedido:', { id: user.id, nome: user.nome_completo, tipo: user.tipo_usuario });
        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nome: user.nome_completo,
                email: user.email,
                tipo_usuario: user.tipo_usuario,
                nomeCompleto: user.nome_completo
            },
            message: 'Login realizado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro durante login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar o login',
            error: error.message
        });
    }
};
exports.login = login;
const approveUser = async (req, res) => {
    try {
        console.log('👍 Aprovando usuário:', req.body);
        const { userId } = req.body;
        if (!userId) {
            console.log('❌ ID de usuário não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID de usuário é obrigatório'
            });
        }
        // Buscar usuário
        const user = await User_1.default.getById(userId);
        if (!user) {
            console.log('❌ Usuário não encontrado:', userId);
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        // Atualizar status para aprovado
        await User_1.default.updateStatus(userId, 'aprovado');
        // Enviar email de aprovação
        try {
            // await sendEmail(
            //   user.email,
            //   'Solicitação Aprovada - AURA-HUBB',
            //   templates.aprovacaoAcesso(user.nome_completo, user.tipo_usuario)
            // );
            console.log('📧 Email de aprovação enviado para:', user.email, '(simulado)');
        }
        catch (emailError) {
            console.error('⚠️ Erro ao enviar email de aprovação:', emailError);
        }
        console.log('✅ Usuário aprovado com sucesso:', userId);
        return res.json({
            success: true,
            message: 'Usuário aprovado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao aprovar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao aprovar usuário',
            error: error.message
        });
    }
};
exports.approveUser = approveUser;
const rejectUser = async (req, res) => {
    try {
        console.log('👎 Rejeitando usuário:', req.body);
        const { userId } = req.body;
        if (!userId) {
            console.log('❌ ID de usuário não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID de usuário é obrigatório'
            });
        }
        // Buscar usuário
        const user = await User_1.default.getById(userId);
        if (!user) {
            console.log('❌ Usuário não encontrado:', userId);
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        // Atualizar status para rejeitado
        await User_1.default.updateStatus(userId, 'rejeitado');
        // Enviar email de rejeição
        try {
            // await sendEmail(
            //   user.email,
            //   'Solicitação Não Aprovada - AURA-HUBB',
            //   templates.rejeicaoAcesso(user.nome_completo)
            // );
            console.log('📧 Email de rejeição enviado para:', user.email, '(simulado)');
        }
        catch (emailError) {
            console.error('⚠️ Erro ao enviar email de rejeição:', emailError);
        }
        console.log('✅ Usuário rejeitado com sucesso:', userId);
        return res.json({
            success: true,
            message: 'Usuário rejeitado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao rejeitar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao rejeitar usuário',
            error: error.message
        });
    }
};
exports.rejectUser = rejectUser;
exports.default = {
    register: exports.register,
    login: exports.login,
    approveUser: exports.approveUser,
    rejectUser: exports.rejectUser
};
//# sourceMappingURL=authController.js.map