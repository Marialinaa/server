import { RequestHandler } from "express";
import { pool } from '../database';
import { notificarUsuarioAprovado, notificarUsuarioRejeitado } from '../email';
import type { User, ApiResponse } from "../shared/types";

// GET /api/users - List all users
export const handleListUsers: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Buscando usuários do banco de dados...");

    const [rows] = await pool.execute(
      `SELECT 
        id, 
        nome as nomeCompleto, 
        email, 
        login, 
        endereco, 
        status,
        DATE_FORMAT(created_at, '%Y/%m/%d') as dataSolicitacao
       FROM usuarios 
       ORDER BY created_at DESC`
    );

    const users = rows as any[];

    console.log(`📋 ${users.length} usuários encontrados`);

    const response: ApiResponse<User[]> = {
      success: true,
      message: "Usuários carregados com sucesso",
      data: users,
    };

    res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao buscar usuários:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao conectar com o banco de dados",
    });
  }
};

// PUT /api/users - Update user status (approve/reject)
export const handleUpdateUserStatus: RequestHandler = async (req, res) => {
  try {
    const { id, acao } = req.body;

    console.log("🔄 Atualizando status do usuário:", { id, acao });

    if (!id || !acao) {
      return res.status(400).json({
        success: false,
        message: "ID do usuário e ação são obrigatórios",
      });
    }

    if (!['aprovar', 'rejeitar'].includes(acao)) {
      return res.status(400).json({
        success: false,
        message: "Ação deve ser 'aprovar' ou 'rejeitar'",
      });
    }

    // Buscar dados do usuário antes de atualizar
    const [userRows] = await pool.execute(
      'SELECT id, nome, email, login, status FROM usuarios WHERE id = ?',
      [id]
    );

    const users = userRows as any[];
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const user = users[0];
    const newStatus = acao === 'aprovar' ? 'aprovado' : 'rejeitado';

    // Atualizar status no banco
    await pool.execute(
      'UPDATE usuarios SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );

    console.log(`✅ Status do usuário ${user.nome} atualizado para: ${newStatus}`);

    // Enviar email de notificação
    console.log('📧 Enviando email de notificação...');
    let emailResult;
    
    if (acao === 'aprovar') {
      emailResult = await notificarUsuarioAprovado({
        nome: user.nome,
        email: user.email,
        login: user.login
      });
    } else {
      emailResult = await notificarUsuarioRejeitado({
        nome: user.nome,
        email: user.email,
        login: user.login
      });
    }

    if (emailResult.success) {
      console.log('✅ Email de notificação enviado com sucesso');
    } else {
      console.log('⚠️ Falha ao enviar email de notificação:', emailResult.error);
    }

    // Buscar dados atualizados do usuário
    const [updatedRows] = await pool.execute(
      `SELECT 
        id, 
        nome as nomeCompleto, 
        email, 
        login, 
        endereco, 
        status,
        DATE_FORMAT(created_at, '%Y/%m/%d') as dataSolicitacao
       FROM usuarios 
       WHERE id = ?`,
      [id]
    );

    const updatedUser = (updatedRows as any[])[0];

    const response: ApiResponse<User> = {
      success: true,
      message: `Usuário ${newStatus} com sucesso! Email de notificação enviado.`,
      data: updatedUser,
    };

    res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao atualizar status:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao atualizar status do usuário",
    });
  }
};

// GET /api/users/:id - Get specific user
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 Buscando usuário específico:", id);

    const [rows] = await pool.execute(
      `SELECT 
        id, 
        nome as nomeCompleto, 
        email, 
        login, 
        endereco, 
        status,
        DATE_FORMAT(created_at, '%Y/%m/%d') as dataSolicitacao
       FROM usuarios 
       WHERE id = ?`,
      [id]
    );

    const users = rows as any[];
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const user = users[0];

    const response: ApiResponse<User> = {
      success: true,
      message: "Usuário encontrado",
      data: user,
    };

    res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao buscar usuário:", error);

    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
