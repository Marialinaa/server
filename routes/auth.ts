// server/routes/auth.ts
import { Request, Response } from "express";
import { pool } from '../database';
import bcrypt from 'bcrypt';
import { notificarAdminNovoUsuario, notificarUsuarioAprovado, notificarUsuarioRejeitado } from '../email';

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Tentativa de login:", { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      });
    }

    // Buscar usuário nas tabelas separadas
    let user: any = null;
    let tipoUsuario: string = '';

    // Primeiro tentar na tabela de responsaveis
    const [responsavelRows] = await pool.execute(
      'SELECT id, nome, login, email, senha as password, funcao, status FROM responsaveis WHERE email = ?',
      [email]
    );

    if ((responsavelRows as any[]).length > 0) {
      user = (responsavelRows as any[])[0];
      tipoUsuario = 'responsavel';
      
      // Verificar se é admin (função específica ou email específico)
      if (user.funcao === 'admin' || user.email === 'admin@sistema.com' || user.email === 'admin@ufla.br') {
        user.tipo = 'admin';
      } else {
        user.tipo = 'responsavel';
      }
    } else {
      // Tentar na tabela de bolsistas
      const [bolsistaRows] = await pool.execute(
        'SELECT matricula as id, nome, login, email, senha as password, curso as funcao, status FROM bolsistas WHERE email = ?',
        [email]
      );

      if ((bolsistaRows as any[]).length > 0) {
        user = (bolsistaRows as any[])[0];
        tipoUsuario = 'bolsista';
        user.tipo = 'bolsista';
      }
    }

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado. Verifique seu email."
      });
    }

    // Verificar se o usuário está aprovado (para admins, sempre permitir)
    if (user.tipo !== 'admin' && user.status !== 'liberado') {
      const statusMessages: { [key: string]: string } = {
        'pendente': 'Sua conta ainda está pendente de aprovação pelo administrador.',
        'bloqueado': 'Sua conta foi bloqueada pelo administrador.'
      };
      
      return res.status(403).json({
        success: false,
        message: statusMessages[user.status] || 'Status da conta inválido'
      });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(password, user.password);
    
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "Senha incorreta"
      });
    }

    // Atualizar último login na tabela apropriada
    if (tipoUsuario === 'responsavel') {
      await pool.execute(
        'UPDATE responsaveis SET data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
    } else if (tipoUsuario === 'bolsista') {
      await pool.execute(
        'UPDATE bolsistas SET data_atualizacao = CURRENT_TIMESTAMP WHERE matricula = ?',
        [user.id]
      );
    }

    // Preparar dados para enviar (sem a senha)
    const { password: _, ...userWithoutPassword } = user;

    // Gerar token simples (em produção use JWT)
    const token = Buffer.from(JSON.stringify({
      user_id: user.id,
      email: user.email,
      tipo: user.tipo,
      timestamp: Date.now()
    })).toString('base64');

    res.json({
      success: true,
      message: 'Login efetuado com sucesso',
      user: userWithoutPassword,
      token: token
    });

  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const { nome, endereco, email, login, senha, tipoUsuario, funcao, matricula, curso } = req.body;

    console.log("📝 Tentativa de registro:", { email, nome, tipoUsuario });

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'email', 'login', 'senha', 'tipoUsuario'];
    for (const campo of camposObrigatorios) {
      if (!req.body[campo]) {
        return res.status(400).json({
          success: false,
          message: `Campo '${campo}' é obrigatório`
        });
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validar senha
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    let novoUsuario: any;
    let insertResult: any;

    if (tipoUsuario === 'responsavel') {
      // Validações específicas para responsável
      if (!funcao) {
        return res.status(400).json({
          success: false,
          message: 'Campo função é obrigatório para responsáveis'
        });
      }

      // Verificar se email ou login já existem em ambas as tabelas
      const [responsavelEmailRows] = await pool.execute(
        'SELECT id FROM responsaveis WHERE email = ? OR login = ?',
        [email, login]
      );

      const [bolsistaEmailRows] = await pool.execute(
        'SELECT matricula FROM bolsistas WHERE email = ? OR login = ?',
        [email, login]
      );

      if ((responsavelEmailRows as any[]).length > 0 || (bolsistaEmailRows as any[]).length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email ou login já cadastrados'
        });
      }

      // Inserir responsável
      const [result] = await pool.execute(
        `INSERT INTO responsaveis (nome, funcao, email, login, senha, status, data_solicitacao) 
         VALUES (?, ?, ?, ?, ?, 'pendente', CURRENT_TIMESTAMP)`,
        [nome, funcao, email, login, senhaHash]
      );

      insertResult = result as any;

      // Buscar dados do responsável recém-criado
      const [newUserRows] = await pool.execute(
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
        [insertResult.insertId]
      );

      novoUsuario = (newUserRows as any[])[0];

    } else if (tipoUsuario === 'bolsista') {
      // Validações específicas para bolsista
      if (!matricula || !curso) {
        return res.status(400).json({
          success: false,
          message: 'Campos matrícula e curso são obrigatórios para bolsistas'
        });
      }

      // Verificar se matrícula, email ou login já existem na tabela bolsistas
      // Verificar se matrícula, email ou login já existem em ambas as tabelas
      const [bolsistaExistingRows] = await pool.execute(
        'SELECT matricula FROM bolsistas WHERE matricula = ? OR email = ? OR login = ?',
        [matricula, email, login]
      );

      const [responsavelExistingRows] = await pool.execute(
        'SELECT id FROM responsaveis WHERE email = ? OR login = ?',
        [email, login]
      );

      if ((bolsistaExistingRows as any[]).length > 0 || (responsavelExistingRows as any[]).length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Matrícula, email ou login já cadastrados'
        });
      }

      // Inserir bolsista
      const [result] = await pool.execute(
        `INSERT INTO bolsistas (matricula, nome, curso, email, login, senha, status, data_solicitacao) 
         VALUES (?, ?, ?, ?, ?, ?, 'pendente', CURRENT_TIMESTAMP)`,
        [matricula, nome, curso, email, login, senhaHash]
      );

      // Buscar dados do bolsista recém-criado
      const [newUserRows] = await pool.execute(
        `SELECT 
          matricula as id, 
          nome as nomeCompleto, 
          email, 
          login, 
          curso,
          matricula,
          status,
          DATE_FORMAT(data_solicitacao, '%d/%m/%Y') as dataSolicitacao,
          'bolsista' as tipoUsuario
         FROM bolsistas 
         WHERE matricula = ?`,
        [matricula]
      );

      novoUsuario = (newUserRows as any[])[0];

    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário inválido. Use "responsavel" ou "bolsista"'
      });
    }

    // Enviar email para o admin sobre a nova solicitação
    console.log('📧 Enviando notificação para admin...');
    const emailResult = await notificarAdminNovoUsuario({
      nome: nome,
      email: email,
      login: login,
      endereco: endereco || ''
    });

    if (emailResult.success) {
      console.log('✅ Email enviado para admin com sucesso');
    } else {
      console.log('⚠️ Falha ao enviar email para admin:', emailResult.error);
    }

    res.json({
      success: true,
      message: `${tipoUsuario === 'responsavel' ? 'Responsável' : 'Bolsista'} registrado com sucesso! Aguarde a aprovação do administrador.`,
      data: novoUsuario
    });

  } catch (error: any) {
    console.error("❌ Erro no registro:", error);
    
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

import express from 'express';
import { db } from '../database';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../email';

const router = express.Router();

// Rota para registro de usuários
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo = 'usuario' } = req.body;
    
    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados incompletos para cadastro' 
      });
    }
    
    // Verificar se o email já existe
    const [existingUsers] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Este email já está cadastrado' 
      });
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    // Inserir usuário como pendente
    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo, status, data_solicitacao) VALUES (?, ?, ?, ?, ?, NOW())',
      [nome, email, hashedPassword, tipo, 'pendente']
    );
    
    // Obter o ID inserido
    const userId = (result as any).insertId;
    
    // Enviar notificação para admin (opcional)
    try {
      await sendEmail({
        to: 'admin@example.com', // Email do administrador
        subject: 'Nova solicitação de acesso',
        text: `O usuário ${nome} (${email}) solicitou acesso ao sistema. Acesse o painel de administração para aprovar ou rejeitar.`,
      });
      console.log('✉️ Email de notificação enviado ao admin');
    } catch (emailError) {
      console.error('Erro ao enviar email de notificação:', emailError);
      // Não interrompe o fluxo se o email falhar
    }
    
    console.log(`👤 Novo usuário registrado com ID ${userId} e status 'pendente'`);
    
    res.status(201).json({
      success: true,
      message: 'Solicitação de acesso enviada com sucesso. Aguarde aprovação.',
      userId
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação de acesso',
      error: (error as Error).message
    });
  }
});

// Rota para login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }
    
    // Buscar usuário pelo email
    const [users] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    // Verificar status do usuário
    if (user.status === 'pendente') {
      return res.status(403).json({
        success: false,
        message: 'Sua conta está aguardando aprovação por um administrador'
      });
    }
    
    if (user.status === 'bloqueado') {
      return res.status(403).json({
        success: false,
        message: 'Sua conta está bloqueada. Entre em contato com o administrador.'
      });
    }
    
    // Verificar senha
    const passwordMatch = await bcrypt.compare(senha, user.senha);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tipo: user.tipo
      },
      process.env.JWT_SECRET || 'secret_default_key', // Use uma variável de ambiente real
      { expiresIn: '24h' }
    );
    
    console.log(`🔓 Login bem-sucedido: ${user.email} (${user.tipo})`);
    
    // Remover senha antes de enviar resposta
    const { senha: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar login',
      error: (error as Error).message
    });
  }
});

// Rota para listar todos os usuários (para o painel admin)
router.get('/usuarios', async (req, res) => {
  try {
    // Em produção, adicione verificação de permissão aqui
    
    // Buscar todos os usuários
    const [users] = await db.execute(
      'SELECT id, nome, email, tipo, status, data_solicitacao FROM usuarios ORDER BY data_solicitacao DESC'
    );
    
    console.log(`📋 Listando ${Array.isArray(users) ? users.length : 0} usuários`);
    
    res.json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: (error as Error).message
    });
  }
});

// Rota para aprovar um usuário
router.put('/usuarios/:id/aprovar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const [users] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Atualizar status para "liberado"
    await db.execute(
      'UPDATE usuarios SET status = ? WHERE id = ?',
      ['liberado', id]
    );
    
    const user = users[0];
    
    // Enviar email de notificação ao usuário
    try {
      await sendEmail({
        to: user.email,
        subject: 'Acesso Aprovado',
        text: `Olá ${user.nome}, sua solicitação de acesso foi aprovada. Você já pode fazer login no sistema.`,
      });
      console.log(`✉️ Email de aprovação enviado para ${user.email}`);
    } catch (emailError) {
      console.error('Erro ao enviar email de aprovação:', emailError);
      // Não interrompe o fluxo se o email falhar
    }
    
    console.log(`✅ Usuário ${id} aprovado com sucesso`);
    
    res.json({
      success: true,
      message: 'Usuário aprovado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar usuário',
      error: (error as Error).message
    });
  }
});

// Rota para rejeitar/bloquear um usuário
router.put('/usuarios/:id/rejeitar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const [users] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Atualizar status para "bloqueado"
    await db.execute(
      'UPDATE usuarios SET status = ? WHERE id = ?',
      ['bloqueado', id]
    );
    
    const user = users[0];
    
    // Enviar email de notificação ao usuário
    try {
      await sendEmail({
        to: user.email,
        subject: 'Acesso Bloqueado',
        text: `Olá ${user.nome}, sua solicitação de acesso foi rejeitada ou sua conta foi bloqueada. Entre em contato com o administrador para mais informações.`,
      });
      console.log(`✉️ Email de rejeição enviado para ${user.email}`);
    } catch (emailError) {
      console.error('Erro ao enviar email de rejeição:', emailError);
      // Não interrompe o fluxo se o email falhar
    }
    
    console.log(`🚫 Usuário ${id} bloqueado com sucesso`);
    
    res.json({
      success: true,
      message: 'Usuário bloqueado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao bloquear usuário',
      error: (error as Error).message
    });
  }
});

// Rota para verificar status do backend
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando normalmente',
    timestamp: new Date().toISOString()
  });
});

export default router;

