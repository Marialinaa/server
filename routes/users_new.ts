import { RequestHandler } from "express";
import DatabaseConnection from '../database';
import { notificarUsuarioAprovado, notificarUsuarioRejeitado } from '../email';
import type { User, ApiResponse } from "../shared/types";

// ============================================
// HELPER: Tratamento centralizado de erros
// ============================================
function handleDatabaseError(error: any, res: any) {
  if (error.message && error.message.includes('pool not initialized')) {
    return res.status(503).json({ 
      success: false,
      message: 'Serviço temporariamente indisponível'
    });
  }
  console.error('Database error:', error);
  return res.status(500).json({ 
    success: false,
    message: 'Erro interno do servidor' 
  });
}

// GET /api/users - List all users  
export const handleListUsers: RequestHandler = async (_req, res) => {
  try {
    console.log("🔍 Buscando usuários do banco de dados...");

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

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

    return res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao buscar usuários:", error);
    return handleDatabaseError(error, res);
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

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

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

    return res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao atualizar status:", error);
    return handleDatabaseError(error, res);
  }
};

// GET /api/users/:id - Get specific user
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 Buscando usuário específico:", id);

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

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

    return res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao buscar usuário:", error);
    return handleDatabaseError(error, res);
  }
};
