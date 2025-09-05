import * as crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

/**
 * Funções para manipulação de data e hora
 */
export const dateUtils = {
  /**
   * Formata uma data para o formato brasileiro (DD/MM/YYYY)
   */
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  },

  /**
   * Formata um horário (HH:MM:SS)
   */
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString('pt-BR');
  },

  /**
   * Formata data e hora completos
   */
  formatDateTime: (date: Date): string => {
    return date.toLocaleString('pt-BR');
  },

  /**
   * Calcula a diferença em horas entre duas datas
   */
  calculateHoursDifference: (startDate: Date, endDate: Date): number => {
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60);
  },

  /**
   * Retorna o início do dia atual
   */
  startOfDay: (date: Date = new Date()): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  },

  /**
   * Retorna o fim do dia atual
   */
  endOfDay: (date: Date = new Date()): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }
};

/**
 * Funções de validação
 */
export const validationUtils = {
  /**
   * Valida um endereço de e-mail
   */
  isValidEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Valida se uma string não está vazia
   */
  isNotEmpty: (value: string): boolean => {
    return value !== null && value !== undefined && value.trim() !== '';
  },

  /**
   * Valida um CPF (formato básico)
   */
  isValidCPF: (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) return false;
    
    // Verifica CPFs com dígitos repetidos (que são inválidos)
    if (/^(\d)\1+$/.test(cpfClean)) return false;
    
    // Implementação básica - para uma validação completa seria necessário
    // incluir o algoritmo de verificação dos dígitos
    return true;
  }
};

/**
 * Utilitários para respostas HTTP
 */
export const httpUtils = {
  /**
   * Envia resposta de sucesso
   */
  sendSuccess: (res: Response, data: any = null, message: string = 'Operação realizada com sucesso'): Response => {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  },

  /**
   * Envia resposta de erro
   */
  sendError: (res: Response, message: string = 'Ocorreu um erro', statusCode: number = 400): Response => {
    return res.status(statusCode).json({
      success: false,
      message
    });
  },

  /**
   * Envia resposta de erro interno
   */
  sendServerError: (res: Response, error: any): Response => {
    console.error('Erro interno do servidor:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Utilitários para segurança
 */
export const securityUtils = {
  /**
   * Gera um hash para uma senha
   */
  hashPassword: (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  },

  /**
   * Verifica se uma senha corresponde a um hash
   */
  verifyPassword: (password: string, hashedPassword: string): boolean => {
    const [salt, storedHash] = hashedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return storedHash === hash;
  },

  /**
   * Gera um token aleatório
   */
  generateToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  }
};

/**
 * Utilitários para logging
 */
export const logUtils = {
  /**
   * Registra uma mensagem de log em arquivo
   */
  logToFile: (message: string, logType: 'info' | 'error' | 'warn' = 'info'): void => {
    const logDir = path.join(__dirname, '../logs');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${logType}-${today}.log`);
    
    // Garante que o diretório de logs existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  },
  
  /**
   * Registra um erro
   */
  logError: (error: any, context: string = ''): void => {
    const message = `ERRO ${context ? `[${context}]` : ''}: ${error.message || error}`;
    console.error(message);
    logUtils.logToFile(message, 'error');
  },
  
  /**
   * Registra uma informação
   */
  logInfo: (message: string): void => {
    console.info(message);
    logUtils.logToFile(message, 'info');
  }
};

/**
 * Utilitários para cálculos de horários e estatísticas
 */
export const horariosUtils = {
  /**
   * Calcula o total de horas trabalhadas em um período
   */
  calcularHorasTrabalhadas: (entradas: Date[], saidas: Date[]): number => {
    if (entradas.length !== saidas.length) {
      throw new Error('Número de entradas e saídas não correspondem');
    }
    
    let totalHoras = 0;
    for (let i = 0; i < entradas.length; i++) {
      totalHoras += dateUtils.calculateHoursDifference(entradas[i], saidas[i]);
    }
    
    return totalHoras;
  },
  
  /**
   * Formata um número de horas para exibição (horas e minutos)
   */
  formatarHoras: (horas: number): string => {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    return `${horasInteiras}h${minutos > 0 ? ` ${minutos}min` : ''}`;
  }
};

export default {
  dateUtils,
  validationUtils,
  httpUtils,
  securityUtils,
  logUtils,
  horariosUtils
};
