// ============================================
// AUTH CONTROLLER - COMPATÍVEL COM MariaDB projeto_ufla
// ============================================

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import DatabaseConnection from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-aqui-MUDE-EM-PRODUCAO';
const JWT_EXPIRES_IN = '24h';

// ============================================
// HELPER: Tratamento centralizado de erros
// ============================================
function handleDatabaseError(error: any, res: Response) {
  if (error.message && error.message.includes('pool not initialized')) {
    return res.status(503).json({ 
      success: false,
      error: 'Serviço temporariamente indisponível',
      message: 'Banco de dados está inicializando, por favor tente novamente em alguns segundos'
    });
  }
  console.error('Database error:', error);
  return res.status(500).json({ 
    success: false,
    error: 'Erro interno do servidor' 
  });
}

// ============================================
// LOGIN - Suporta email/login e senha
// ============================================
export async function login(req: Request, res: Response) {
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

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    // Buscar usuário por email ou login
    let [rows]: any = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? OR login = ? LIMIT 1',
      [emailOrLogin, emailOrLogin]
    );

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
    const senhaValida = await bcrypt.compare(password, user.senha_hash);
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
    await pool.execute('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?', [user.id]);

    delete user.senha_hash;

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user
    });

  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    return handleDatabaseError(error, res);
  }
}

// ============================================
// REGISTER - Criar nova solicitação de acesso
// ============================================
export async function register(req: Request, res: Response) {
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

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    // Verificar se já existe usuário com mesmo email/login
    const [existingUser]: any = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ? OR login = ? LIMIT 1',
      [email, login]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email ou login já cadastrado no sistema'
      });
    }

    // Verificar se já há solicitação pendente
    const [existingSolicitacao]: any = await pool.execute(
      'SELECT id FROM solicitacoes WHERE email = ? OR login = ? AND status = "pendente" LIMIT 1',
      [email, login]
    );
    if (existingSolicitacao.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma solicitação pendente para este email/login'
      });
    }

    // Criar hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Inserir nova solicitação
    const [result]: any = await pool.execute(
      'INSERT INTO solicitacoes (nome_completo, email, senha_hash, tipo_usuario, login, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, senha_hash, tipo_usuario, login, 'pendente']
    );

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

  } catch (error: any) {
    console.error('❌ Erro ao registrar usuário:', error);
    return handleDatabaseError(error, res);
  }
}

// ============================================
// APPROVE USER - Aprovar solicitação pendente
// ============================================
export async function approveUser(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID da solicitação é obrigatório' });
    }

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    // Buscar solicitação
    const [rows]: any = await pool.execute('SELECT * FROM solicitacoes WHERE id = ? LIMIT 1', [userId]);
    const solicitacao = rows[0];

    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    // Inserir usuário aprovado em `usuarios`
    await pool.execute(
      `INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_usuario, login, data_criacao)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [solicitacao.nome_completo, solicitacao.email, solicitacao.senha_hash, solicitacao.tipo_usuario, solicitacao.login]
    );

    // Atualizar status da solicitação
    await pool.execute('UPDATE solicitacoes SET status = "aprovada" WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Usuário aprovado e movido para tabela de usuários'
    });

  } catch (error: any) {
    console.error('❌ Erro ao aprovar usuário:', error);
    return handleDatabaseError(error, res);
  }
}

// ============================================
// REJECT USER - Rejeitar solicitação
// ============================================
export async function rejectUser(req: Request, res: Response) {
  try {
    const { userId, motivo } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID da solicitação é obrigatório' });
    }

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    const [rows]: any = await pool.execute('SELECT * FROM solicitacoes WHERE id = ? LIMIT 1', [userId]);
    const solicitacao = rows[0];
    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    await pool.execute('UPDATE solicitacoes SET status = "rejeitada" WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Solicitação rejeitada com sucesso',
      motivo: motivo || null
    });

  } catch (error: any) {
    console.error('❌ Erro ao rejeitar usuário:', error);
    return handleDatabaseError(error, res);
  }
}
