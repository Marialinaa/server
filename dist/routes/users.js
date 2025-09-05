"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetUser = exports.handleUpdateUserStatus = exports.handleListUsers = void 0;
const database_1 = require("../database");
const email_1 = require("../email");
// GET /api/users - List all users from separate tables
const handleListUsers = async (req, res) => {
    try {
        console.log("🔍 Buscando usuários das tabelas separadas...");
        const usuarios = [];
        // Buscar responsáveis
        const [responsaveisRows] = await database_1.pool.execute(`SELECT 
        id, 
        nome as nomeCompleto, 
        email, 
        login, 
        funcao, 
        CASE 
          WHEN status = 'liberado' THEN 'liberado'
          WHEN status = 'bloqueado' THEN 'bloqueado'
          ELSE 'pendente'
        END as status,
        DATE_FORMAT(data_solicitacao, '%d/%m/%Y') as dataSolicitacao,
        'responsavel' as tipoUsuario
       FROM responsaveis 
       ORDER BY data_solicitacao DESC`);
        const responsaveis = responsaveisRows;
        usuarios.push(...responsaveis);
        // Buscar bolsistas
        const [bolsistasRows] = await database_1.pool.execute(`SELECT 
        matricula as id, 
        nome as nomeCompleto, 
        email, 
        login, 
        curso as funcao,
        matricula,
        CASE 
          WHEN status = 'liberado' THEN 'liberado'
          WHEN status = 'bloqueado' THEN 'bloqueado'
          ELSE 'pendente'
        END as status,
        DATE_FORMAT(data_solicitacao, '%d/%m/%Y') as dataSolicitacao,
        'bolsista' as tipoUsuario
       FROM bolsistas 
       ORDER BY data_solicitacao DESC`);
        const bolsistas = bolsistasRows;
        usuarios.push(...bolsistas);
        // Ordenar todos por data de solicitação (mais recentes primeiro)
        usuarios.sort((a, b) => {
            const dateA = new Date(a.dataSolicitacao.split('/').reverse().join('-'));
            const dateB = new Date(b.dataSolicitacao.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
        });
        console.log(`📋 ${usuarios.length} usuários encontrados (${responsaveis.length} responsáveis, ${bolsistas.length} bolsistas)`);
        const response = {
            success: true,
            message: "Usuários carregados com sucesso",
            data: usuarios,
        };
        res.json(response);
    }
    catch (error) {
        console.error("❌ Erro ao buscar usuários:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao conectar com o banco de dados",
        });
    }
};
exports.handleListUsers = handleListUsers;
// PUT /api/users - Update user status (approve/reject) in separate tables
const handleUpdateUserStatus = async (req, res) => {
    try {
        const { id, acao } = req.body;
        console.log("🔄 Atualizando status do usuário:", { id, acao });
        if (!id || !acao) {
            return res.status(400).json({
                success: false,
                message: "ID do usuário e ação são obrigatórios",
            });
        }
        if (!['aprovar', 'rejeitar', 'liberado', 'bloqueado'].includes(acao)) {
            return res.status(400).json({
                success: false,
                message: "Ação deve ser 'aprovar', 'rejeitar', 'liberado' ou 'bloqueado'",
            });
        }
        // Mapear ações do frontend para status do banco
        let newStatus;
        if (acao === 'aprovar' || acao === 'liberado') {
            newStatus = 'liberado';
        }
        else if (acao === 'rejeitar' || acao === 'bloqueado') {
            newStatus = 'bloqueado';
        }
        let user = null;
        let tipoUsuario = '';
        // Tentar encontrar o usuário na tabela de responsáveis
        const [responsavelRows] = await database_1.pool.execute('SELECT id, nome, email, login, status FROM responsaveis WHERE id = ?', [id]);
        if (responsavelRows.length > 0) {
            user = responsavelRows[0];
            tipoUsuario = 'responsavel';
            // Atualizar status na tabela responsaveis
            await database_1.pool.execute('UPDATE responsaveis SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
        }
        else {
            // Tentar encontrar o usuário na tabela de bolsistas (usar matricula como ID)
            const [bolsistaRows] = await database_1.pool.execute('SELECT matricula as id, nome, email, login, status FROM bolsistas WHERE matricula = ?', [id]);
            if (bolsistaRows.length > 0) {
                user = bolsistaRows[0];
                tipoUsuario = 'bolsista';
                // Atualizar status na tabela bolsistas
                await database_1.pool.execute('UPDATE bolsistas SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE matricula = ?', [newStatus, id]);
            }
        }
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }
        console.log(`✅ Status do ${tipoUsuario} ${user.nome} atualizado para: ${newStatus}`);
        // Enviar email de notificação
        console.log('📧 Enviando email de notificação...');
        let emailResult;
        if (acao === 'aprovar' || acao === 'liberado') {
            emailResult = await (0, email_1.notificarUsuarioAprovado)({
                nome: user.nome,
                email: user.email,
                login: user.login
            });
        }
        else {
            emailResult = await (0, email_1.notificarUsuarioRejeitado)({
                nome: user.nome,
                email: user.email,
                login: user.login
            });
        }
        if (emailResult.success) {
            console.log('✅ Email de notificação enviado com sucesso');
        }
        else {
            console.log('⚠️ Falha ao enviar email de notificação:', emailResult.error);
        }
        // Buscar dados atualizados do usuário
        let updatedUser;
        if (tipoUsuario === 'responsavel') {
            const [updatedRows] = await database_1.pool.execute(`SELECT 
          id, 
          nome as nomeCompleto, 
          email, 
          login, 
          funcao,
          status,
          DATE_FORMAT(data_solicitacao, '%d/%m/%Y') as dataSolicitacao,
          'responsavel' as tipoUsuario
         FROM responsaveis 
         WHERE id = ?`, [id]);
            updatedUser = updatedRows[0];
        }
        else {
            const [updatedRows] = await database_1.pool.execute(`SELECT 
          matricula as id, 
          nome as nomeCompleto, 
          email, 
          login, 
          curso as funcao,
          matricula,
          status,
          DATE_FORMAT(data_solicitacao, '%d/%m/%Y') as dataSolicitacao,
          'bolsista' as tipoUsuario
         FROM bolsistas 
         WHERE matricula = ?`, [id]);
            updatedUser = updatedRows[0];
        }
        const response = {
            success: true,
            message: `${tipoUsuario === 'responsavel' ? 'Responsável' : 'Bolsista'} ${newStatus} com sucesso! Email de notificação enviado.`,
            data: updatedUser,
        };
        res.json(response);
    }
    catch (error) {
        console.error("❌ Erro ao atualizar status:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar status do usuário",
        });
    }
};
exports.handleUpdateUserStatus = handleUpdateUserStatus;
// GET /api/users/:id - Get specific user
const handleGetUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🔍 Buscando usuário específico:", id);
        const [rows] = await database_1.pool.execute(`SELECT 
        id, 
        nome as nomeCompleto, 
        email, 
        login, 
        endereco, 
        status,
        DATE_FORMAT(created_at, '%Y/%m/%d') as dataSolicitacao
       FROM usuarios 
       WHERE id = ?`, [id]);
        const users = rows;
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }
        const user = users[0];
        const response = {
            success: true,
            message: "Usuário encontrado",
            data: user,
        };
        res.json(response);
    }
    catch (error) {
        console.error("❌ Erro ao buscar usuário:", error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor",
        });
    }
};
exports.handleGetUser = handleGetUser;
//# sourceMappingURL=users.js.map