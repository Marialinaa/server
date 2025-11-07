"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../email");
const listarUsuarios = async (req, res) => {
    try {
        console.log('🔍 Listando usuários com filtros:', req.query);
        const { tipo_usuario, status } = req.query;
        const filtros = {};
        if (tipo_usuario)
            filtros.tipo_usuario = tipo_usuario;
        if (status)
            filtros.status = status;
        const users = await User_1.default.list(filtros);
        console.log(`✅ ${users.length} usuários encontrados`);
        return res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar usuários',
            error: error.message
        });
    }
};
const getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Buscando usuário com ID: ${id}`);
        const user = await User_1.default.getById(Number(id));
        if (!user) {
            console.log(`❌ Usuário não encontrado: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        console.log(`✅ Usuário encontrado: ${user.nome_completo}`);
        return res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error(`❌ Erro ao buscar usuário:`, error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário',
            error: error.message
        });
    }
};
const criarResponsavel = async (req, res) => {
    try {
        console.log('📝 Criando novo responsável:', req.body);
        const { nomeCompleto, email, funcao, instituicao, senha } = req.body;
        // Validar campos obrigatórios
        if (!nomeCompleto || !email) {
            console.log('❌ Dados incompletos na requisição');
            return res.status(400).json({
                success: false,
                message: 'Nome completo e email são obrigatórios'
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
        // Criar o novo responsável
        const newUser = await User_1.default.create({
            nome_completo: nomeCompleto,
            email,
            login: email.split('@')[0], // Login padrão baseado no email
            senha_hash: senha || 'responsavel123', // Senha padrão ou fornecida
            tipo_usuario: 'responsavel',
            status: 'aprovado'
        });
        console.log('✅ Responsável criado com sucesso:', { id: newUser.id, nome: nomeCompleto, email });
        // Notificar administrador sobre novo usuário
        try {
            await (0, email_1.notificarAdminNovoUsuario)({
                nome: nomeCompleto,
                tipo_usuario: 'responsavel',
                email: email,
                login: email.split('@')[0]
            });
            console.log('📧 Email de notificação enviado ao administrador');
        }
        catch (emailError) {
            console.error('❌ Erro ao enviar email ao administrador:', emailError);
        }
        return res.status(201).json({
            success: true,
            message: 'Responsável criado com sucesso',
            data: {
                id: newUser.id,
                nomeCompleto,
                email,
                tipo_usuario: 'responsavel',
                status: 'aprovado',
                funcao,
                instituicao
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar responsável:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar responsável',
            error: error.message
        });
    }
};
const criarBolsista = async (req, res) => {
    try {
        console.log('📝 Criando novo bolsista:', req.body);
        const { nomeCompleto, email, matricula, curso, periodo, instituicao, senha } = req.body;
        // Validar campos obrigatórios
        if (!nomeCompleto || !email) {
            console.log('❌ Dados incompletos na requisição');
            return res.status(400).json({
                success: false,
                message: 'Nome completo e email são obrigatórios'
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
        // Criar o novo bolsista
        const newUser = await User_1.default.create({
            nome_completo: nomeCompleto,
            email,
            login: matricula || email.split('@')[0], // Matrícula ou login baseado no email
            senha_hash: senha || 'bolsista123', // Senha padrão ou fornecida
            tipo_usuario: 'bolsista',
            status: 'aprovado'
        });
        console.log('✅ Bolsista criado com sucesso:', { id: newUser.id, nome: nomeCompleto, email });
        // Notificar administrador sobre novo usuário
        try {
            await (0, email_1.notificarAdminNovoUsuario)({
                nome: nomeCompleto,
                tipo_usuario: 'bolsista',
                email: email,
                login: matricula || email.split('@')[0]
            });
            console.log('📧 Email de notificação enviado ao administrador');
        }
        catch (emailError) {
            console.error('❌ Erro ao enviar email ao administrador:', emailError);
        }
        return res.status(201).json({
            success: true,
            message: 'Bolsista criado com sucesso',
            data: {
                id: newUser.id,
                nomeCompleto,
                email,
                tipo_usuario: 'bolsista',
                status: 'aprovado',
                matricula,
                curso,
                periodo,
                instituicao
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar bolsista:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar bolsista',
            error: error.message
        });
    }
};
const listarSolicitacoes = async (_req, res) => {
    try {
        console.log('🔍 Listando solicitações pendentes');
        const solicitacoes = await User_1.default.list({ status: 'pendente' });
        console.log(`✅ ${solicitacoes.length} solicitações pendentes encontradas`);
        return res.json({
            success: true,
            data: solicitacoes
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar solicitações:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar solicitações',
            error: error.message
        });
    }
};
const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};
        console.log(`✏️ Atualizando usuário ${id} com:`, updates);
        // Permitir apenas atualização de status por enquanto
        if (updates.status) {
            const ok = await User_1.default.updateStatus(Number(id), updates.status);
            if (!ok) {
                return res.status(400).json({ success: false, message: 'Falha ao atualizar status' });
            }
        }
        // Retornar usuário atualizado
        const user = await User_1.default.getById(Number(id));
        return res.json({ success: true, data: user });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar usuário', error: error.message });
    }
};
exports.default = {
    listarUsuarios,
    getUsuario,
    criarResponsavel,
    criarBolsista,
    listarSolicitacoes,
    atualizarUsuario
};
//# sourceMappingURL=usuariosController.js.map