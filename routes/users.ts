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

// GET /api/users - List all users from separate tables
export const handleListUsers: RequestHandler = async (_req, res) => {
  try {
    console.log("🔍 Buscando usuários das tabelas separadas...");

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    const usuarios: any[] = [];

    // Buscar responsáveis
    const [responsaveisRows] = await pool.execute(
      `SELECT 
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
       ORDER BY data_solicitacao DESC`
    );

    const responsaveis = responsaveisRows as any[];
    usuarios.push(...responsaveis);

    // Buscar bolsistas
    const [bolsistasRows] = await pool.execute(
      `SELECT 
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
       ORDER BY data_solicitacao DESC`
    );

    const bolsistas = bolsistasRows as any[];
    usuarios.push(...bolsistas);

    // Ordenar todos por data de solicitação (mais recentes primeiro)
    usuarios.sort((a, b) => {
      const dateA = new Date(a.dataSolicitacao.split('/').reverse().join('-'));
      const dateB = new Date(b.dataSolicitacao.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`📋 ${usuarios.length} usuários encontrados (${responsaveis.length} responsáveis, ${bolsistas.length} bolsistas)`);

    const response: ApiResponse<User[]> = {
      success: true,
      message: "Usuários carregados com sucesso",
      data: usuarios,
    };

    return res.json(response);

  } catch (error: any) {
    console.error("❌ Erro ao buscar usuários:", error);
    return handleDatabaseError(error, res);
  }
};

// PUT /api/users - Update user status (approve/reject) in separate tables
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
    } else if (acao === 'rejeitar' || acao === 'bloqueado') {
      newStatus = 'bloqueado';
    }

    let user: any = null;
    let tipoUsuario: string = '';

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    // Tentar encontrar o usuário na tabela de responsáveis
    const [responsavelRows] = await pool.execute(
      'SELECT id, nome, email, login, status FROM responsaveis WHERE id = ?',
      [id]
    );

    if ((responsavelRows as any[]).length > 0) {
      user = (responsavelRows as any[])[0];
      tipoUsuario = 'responsavel';
      
      // Atualizar status na tabela responsaveis
      await pool.execute(
        'UPDATE responsaveis SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, id]
      );
    } else {
      // Tentar encontrar o usuário na tabela de bolsistas (usar matricula como ID)
      const [bolsistaRows] = await pool.execute(
        'SELECT matricula as id, nome, email, login, status FROM bolsistas WHERE matricula = ?',
        [id]
      );

      if ((bolsistaRows as any[]).length > 0) {
        user = (bolsistaRows as any[])[0];
        tipoUsuario = 'bolsista';
        
        // Atualizar status na tabela bolsistas
        await pool.execute(
          'UPDATE bolsistas SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE matricula = ?',
          [newStatus, id]
        );
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
    let updatedUser: any;
    
    if (tipoUsuario === 'responsavel') {
      const [updatedRows] = await pool.execute(
        `SELECT 
          id, 
          nome as nomeCompleto, 
          email, 
          login, 
          funcao,
          status,
          DATE_FORMAT(data_solicitacao, '%d/%m/%Y') as dataSolicitacao,
          'responsavel' as tipoUsuario
         FROM responsaveis 
         WHERE id = ?`,
        [id]
      );
      updatedUser = (updatedRows as any[])[0];
    } else {
      const [updatedRows] = await pool.execute(
        `SELECT 
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
         WHERE matricula = ?`,
        [id]
      );
      updatedUser = (updatedRows as any[])[0];
    }

    const response: ApiResponse<User> = {
      success: true,
      message: `${tipoUsuario === 'responsavel' ? 'Responsável' : 'Bolsista'} ${newStatus} com sucesso! Email de notificação enviado.`,
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
