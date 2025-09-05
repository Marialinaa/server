import fs from 'fs';
import path from 'path';
import config from '../config/config';

// Diretório para armazenar logs
const LOG_DIR = path.join(process.cwd(), 'logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Arquivo de log do dia atual
const getLogFilePath = () => {
  const today = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `${today}.log`);
};

// Nível de log
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

// Formatação de mensagem de log
const formatLogMessage = (level: LogLevel, message: string, context?: any) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${level}: ${message}`;
  
  if (context) {
    try {
      logMessage += ` - ${JSON.stringify(context)}`;
    } catch (e) {
      logMessage += ` - [Contexto não serializável]`;
    }
  }
  
  return logMessage;
};

// Escrever no arquivo de log
const writeToLogFile = (message: string) => {
  try {
    const logFile = getLogFilePath();
    fs.appendFileSync(logFile, message + '\n');
  } catch (error) {
    console.error('Erro ao escrever no arquivo de log:', error);
  }
};

// Funções de logging
export const logger = {
  // Log informativo
  info: (message: string, context?: any) => {
    const logMessage = formatLogMessage('INFO', message, context);
    console.log(logMessage);
    
    if (config.server.nodeEnv !== 'development') {
      writeToLogFile(logMessage);
    }
  },
  
  // Log de aviso
  warn: (message: string, context?: any) => {
    const logMessage = formatLogMessage('WARN', message, context);
    console.warn(logMessage);
    writeToLogFile(logMessage);
  },
  
  // Log de erro
  error: (message: string, error?: any) => {
    let errorDetails = error;
    if (error instanceof Error) {
      errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    const logMessage = formatLogMessage('ERROR', message, errorDetails);
    console.error(logMessage);
    writeToLogFile(logMessage);
  },
  
  // Log de debug (apenas em desenvolvimento)
  debug: (message: string, context?: any) => {
    if (config.server.nodeEnv === 'development') {
      const logMessage = formatLogMessage('DEBUG', message, context);
      console.debug(logMessage);
    }
  }
};

export default logger;
