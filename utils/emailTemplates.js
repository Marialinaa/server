/**
 * Templates de email para o sistema AuraHub
 */

// Template para notificação de nova solicitação de acesso
const newAccessRequestTemplate = (userData, adminPanelUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Solicitação de Acesso</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <div style="background-color: #4A2E85; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; margin-bottom: 20px;">
          <h2>Nova Solicitação de Acesso - AuraHub</h2>
        </div>
        <div style="padding: 0 20px;">
          <p>Olá Administrador,</p>
          <p>Uma nova solicitação de acesso foi registrada no sistema AuraHub. Abaixo estão os detalhes:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #4A2E85;">
            <p><strong>Nome:</strong> ${userData.nome}</p>
            <p><strong>E-mail:</strong> ${userData.email}</p>
            <p><strong>Login:</strong> ${userData.login}</p>
            <p><strong>Tipo de usuário:</strong> ${userData.tipoUsuario}</p>
            ${userData.matricula ? `<p><strong>Matrícula:</strong> ${userData.matricula}</p>` : ''}
            ${userData.curso ? `<p><strong>Curso:</strong> ${userData.curso}</p>` : ''}
            ${userData.funcao ? `<p><strong>Função:</strong> ${userData.funcao}</p>` : ''}
            <p><strong>Data da solicitação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <p>É necessário aprovar ou rejeitar esta solicitação no painel administrativo.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${adminPanelUrl}" style="display: inline-block; background-color: #4A2E85; color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Acessar Painel Administrativo</a>
          </div>
          
          <p style="text-align: center; font-size: 13px; color: #666;">
            Se o botão acima não funcionar, copie e cole o seguinte link em seu navegador:
          </p>
          <p style="text-align: center; font-size: 13px;">
            ${adminPanelUrl}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Este é um email automático. Por favor, não responda diretamente a esta mensagem.</p>
          <p>&copy; ${new Date().getFullYear()} AuraHub - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  newAccessRequestTemplate
};
