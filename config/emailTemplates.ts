// Templates de email para o sistema

const templates = {
  // Template para notificar admin sobre nova solicitação
  solicitacaoAcesso: (nome: string, tipo_usuario: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nova Solicitação de Acesso - AURA-HUBB</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            Nova Solicitação de Acesso
          </h2>
          
          <p>Uma nova solicitação de acesso foi recebida no sistema AURA-HUBB:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Tipo de Usuário:</strong> ${tipo_usuario}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <p>Acesse o painel administrativo para aprovar ou rejeitar esta solicitação.</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" 
               style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Acessar Painel Admin
            </a>
          </div>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Este email foi enviado automaticamente pelo sistema AURA-HUBB.
          </p>
        </div>
      </body>
      </html>
    `;
  },

  // Template para notificar usuário sobre aprovação
  aprovacaoAcesso: (nome: string, tipo_usuario: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Solicitação Aprovada - AURA-HUBB</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">
            ✅ Solicitação Aprovada
          </h2>
          
          <p>Olá, ${nome}!</p>
          
          <p>Sua solicitação de acesso ao sistema AURA-HUBB foi aprovada com sucesso!</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <p><strong>Tipo de Usuário:</strong> ${tipo_usuario}</p>
            <p><strong>Status:</strong> Aprovado</p>
            <p><strong>Data da Aprovação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <p>Agora você pode fazer login no sistema usando suas credenciais.</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Fazer Login
            </a>
          </div>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Este email foi enviado automaticamente pelo sistema AURA-HUBB.
          </p>
        </div>
      </body>
      </html>
    `;
  },

  // Template para notificar usuário sobre rejeição
  rejeicaoAcesso: (nome: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Solicitação Não Aprovada - AURA-HUBB</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
            ❌ Solicitação Não Aprovada
          </h2>
          
          <p>Olá, ${nome}!</p>
          
          <p>Infelizmente, sua solicitação de acesso ao sistema AURA-HUBB não foi aprovada no momento.</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <p><strong>Status:</strong> Não aprovado</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <p>Se você acredita que isto foi um erro ou tem dúvidas sobre os critérios de acesso, entre em contato com o administrador do sistema.</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Este email foi enviado automaticamente pelo sistema AURA-HUBB.
          </p>
        </div>
      </body>
      </html>
    `;
  }
};

export default templates;
