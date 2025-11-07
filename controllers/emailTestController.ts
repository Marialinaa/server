import { Request, Response } from 'express';
import { notificarAdminNovoUsuario } from '../email';

export const testarEmail = async (_req: Request, res: Response) => {
  try {
    console.log('🧪 Endpoint de teste de email chamado');
    
    // Verificar variáveis de ambiente
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER || 'não configurado',
      EMAIL_HOST: process.env.EMAIL_HOST || 'não configurado', 
      EMAIL_PORT: process.env.EMAIL_PORT || 'não configurado',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'não configurado',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'configurada' : 'não configurada',
      EMAIL_FROM: process.env.EMAIL_FROM || 'não configurado'
    };
    
    console.log('📧 Configurações de email:', emailConfig);
    
    // Tentar enviar email de teste
    console.log('📤 Tentando enviar email de teste...');
    const resultado = await notificarAdminNovoUsuario({
      nome: 'Teste Debug',
      email: 'teste@debug.com',
      tipo_usuario: 'teste',
      login: 'teste'
    });
    
    console.log('📋 Resultado do envio:', resultado);
    
    return res.json({
      success: true,
      message: 'Teste de email executado',
      configuracoes: emailConfig,
      resultadoEmail: resultado
    });
    
  } catch (error: any) {
    console.error('❌ Erro no teste de email:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro no teste de email',
      detalhes: error?.message || String(error)
    });
  }
};