// server/routes/auth_new.ts
import { Request, Response } from "express";
import DatabaseConnection from '../database';
import bcrypt from 'bcrypt';

// ============================================
// HELPER: Tratamento centralizado de erros
// ============================================
function handleDatabaseError(error: any, res: Response) {
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

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    // Buscar usuário no banco de dados
    const [rows] = await pool.execute(
      'SELECT id, nome, login, email, password, tipo, status FROM usuarios WHERE email = ?',
      [email]
    );

    const users = rows as any[];
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado. Verifique seu email."
      });
    }

    const user = users[0];

    // Verificar se o usuário está aprovado (para admins, sempre permitir)
    if (user.tipo !== 'admin' && user.status !== 'aprovado') {
      const statusMessages: { [key: string]: string } = {
        'pendente': 'Sua conta ainda está pendente de aprovação pelo administrador.',
        'rejeitado': 'Sua conta foi rejeitada pelo administrador.'
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

    // Atualizar último login
    await pool.execute(
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Preparar dados para enviar (sem a senha)
    const { password: _, ...userWithoutPassword } = user;

    // Gerar token simples (em produção use JWT)
    const token = Buffer.from(JSON.stringify({
      user_id: user.id,
      email: user.email,
      tipo: user.tipo,
      timestamp: Date.now()
    })).toString('base64');

    return res.json({
      success: true,
      message: 'Login efetuado com sucesso',
      user: userWithoutPassword,
      token: token
    });

  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    return handleDatabaseError(error, res);
  }
};

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const { nome, funcao, endereco, email, login, senha, tipoUsuario } = req.body;

    console.log("📝 Tentativa de registro:", { email, nome, funcao, tipoUsuario });

    // Validar campos obrigatórios básicos
    const camposObrigatorios = ['nome', 'email', 'login', 'senha', 'tipoUsuario'];
    for (const campo of camposObrigatorios) {
      if (!req.body[campo]) {
        return res.status(400).json({
          success: false,
          message: `Campo '${campo}' é obrigatório`
        });
      }
    }

    // Validar campos específicos por tipo de usuário
    if (tipoUsuario === 'responsavel' && !funcao) {
      return res.status(400).json({
        success: false,
        message: 'Campo "funcao" é obrigatório para responsáveis'
      });
    }

    // Validar tipoUsuario
    if (!['responsavel', 'bolsista'].includes(tipoUsuario)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário deve ser "responsavel" ou "bolsista"'
      });
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

    // ✅ Obter pool de forma segura
    const pool = await DatabaseConnection.getInstance();

    // Verificar se email já existe
    const [emailRows] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if ((emailRows as any[]).length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado no sistema'
      });
    }

    // Verificar se login já existe
    const [loginRows] = await pool.execute(
      'SELECT id FROM usuarios WHERE login = ?',
      [login]
    );

    if ((loginRows as any[]).length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Login já está em uso'
      });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo usuário
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome, funcao, endereco, email, login, password, tipo_usuario, tipo, status, data_criacao) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'usuario', 'pendente', CURRENT_TIMESTAMP)`,
      [nome, funcao, endereco, email, login, senhaHash, tipoUsuario]
    );

    const insertResult = result as any;
    const novoId = insertResult.insertId;

    // Buscar dados do usuário recém-criado
    const [newUserRows] = await pool.execute(
      `SELECT 
        id, 
        nome as nomeCompleto,
        funcao,
        email, 
        login, 
        endereco,
        tipo_usuario as tipoUsuario,
        status,
        DATE_FORMAT(data_criacao, '%Y/%m/%d') as dataSolicitacao
       FROM usuarios 
       WHERE id = ?`,
      [novoId]
    );

    const novoUsuario = (newUserRows as any[])[0];
    novoUsuario.status = 'pendente';

    return res.json({
      success: true,
      message: 'Usuário registrado com sucesso! Aguarde a aprovação do administrador.',
      data: novoUsuario
    });

  } catch (error: any) {
    console.error("❌ Erro no registro:", error);
    return handleDatabaseError(error, res);
  }
};
