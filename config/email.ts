import * as nodemailer from 'nodemailer';

export const verificarConfiguracao = async () => {
  try {
    console.log('📧 Verificando configuração de email...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Configurações de email não encontradas no .env');
      return false;
    }
    
    console.log('✅ Configuração de email verificada');
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação de email:', error);
    return false;
  }
};

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Configurações para resolver timeout
    connectionTimeout: 30000, // 30 segundos
    greetingTimeout: 10000,   // 10 segundos
    socketTimeout: 30000,     // 30 segundos
    // Configurações adicionais para Gmail
    tls: {
      rejectUnauthorized: false
    }
  });
};
