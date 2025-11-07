// Teste simples de email
require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testando configuração de email...');
  
  // Verificar variáveis de ambiente
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('📧 EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('📧 EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('📧 ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  console.log('📧 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configurada***' : 'não configurada');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('🔗 Verificando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');
    
    console.log('📤 Enviando email de teste...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'Teste de Email - AURA-HUBB',
      html: `
        <h2>🧪 Teste de Email</h2>
        <p>Este é um email de teste do sistema AURA-HUBB.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p>Se você recebeu este email, o sistema está funcionando corretamente!</p>
      `
    });
    
    console.log('✅ Email enviado com sucesso!');
    console.log('📄 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Erro no teste de email:', error.message);
    if (error.code) {
      console.error('🔍 Código do erro:', error.code);
    }
  }
}

testEmail();