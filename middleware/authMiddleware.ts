import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

// Estender interface do Express Request para incluir usuário
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token não fornecido.'
      });
    }

    // Verificar formato do token
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        message: 'Erro no formato do token.'
      });
    }

    const [scheme, token] = parts;

    // Verificar se o esquema começa com Bearer
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        success: false,
        message: 'Token mal formatado.'
      });
    }

    // Verificar e decodificar o token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('❌ Erro na verificação do token:', err);
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado.'
        });
      }

      // Adicionar informações do usuário decodificadas à requisição
      req.user = decoded;
      console.log('🔑 Token validado para usuário:', req.user.id);
      return next();
    });
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
};

export default authMiddleware;
