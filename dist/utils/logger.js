"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config/config"));
// Diretório para armazenar logs
const LOG_DIR = path_1.default.join(process.cwd(), 'logs');
// Criar diretório de logs se não existir
if (!fs_1.default.existsSync(LOG_DIR)) {
    fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
}
// Arquivo de log do dia atual
const getLogFilePath = () => {
    const today = new Date().toISOString().split('T')[0];
    return path_1.default.join(LOG_DIR, `${today}.log`);
};
// Formatação de mensagem de log
const formatLogMessage = (level, message, context) => {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    if (context) {
        try {
            logMessage += ` - ${JSON.stringify(context)}`;
        }
        catch (e) {
            logMessage += ` - [Contexto não serializável]`;
        }
    }
    return logMessage;
};
// Escrever no arquivo de log
const writeToLogFile = (message) => {
    try {
        const logFile = getLogFilePath();
        fs_1.default.appendFileSync(logFile, message + '\n');
    }
    catch (error) {
        console.error('Erro ao escrever no arquivo de log:', error);
    }
};
// Funções de logging
exports.logger = {
    // Log informativo
    info: (message, context) => {
        const logMessage = formatLogMessage('INFO', message, context);
        console.log(logMessage);
        if (config_1.default.server.nodeEnv !== 'development') {
            writeToLogFile(logMessage);
        }
    },
    // Log de aviso
    warn: (message, context) => {
        const logMessage = formatLogMessage('WARN', message, context);
        console.warn(logMessage);
        writeToLogFile(logMessage);
    },
    // Log de erro
    error: (message, error) => {
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
    debug: (message, context) => {
        if (config_1.default.server.nodeEnv === 'development') {
            const logMessage = formatLogMessage('DEBUG', message, context);
            console.debug(logMessage);
        }
    }
};
exports.default = exports.logger;
