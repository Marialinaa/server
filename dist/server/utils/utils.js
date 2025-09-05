"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.horariosUtils = exports.logUtils = exports.securityUtils = exports.httpUtils = exports.validationUtils = exports.dateUtils = void 0;
const crypto = __importStar(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Funções para manipulação de data e hora
 */
exports.dateUtils = {
    /**
     * Formata uma data para o formato brasileiro (DD/MM/YYYY)
     */
    formatDate: (date) => {
        return date.toLocaleDateString('pt-BR');
    },
    /**
     * Formata um horário (HH:MM:SS)
     */
    formatTime: (date) => {
        return date.toLocaleTimeString('pt-BR');
    },
    /**
     * Formata data e hora completos
     */
    formatDateTime: (date) => {
        return date.toLocaleString('pt-BR');
    },
    /**
     * Calcula a diferença em horas entre duas datas
     */
    calculateHoursDifference: (startDate, endDate) => {
        const diffMs = endDate.getTime() - startDate.getTime();
        return diffMs / (1000 * 60 * 60);
    },
    /**
     * Retorna o início do dia atual
     */
    startOfDay: (date = new Date()) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    },
    /**
     * Retorna o fim do dia atual
     */
    endOfDay: (date = new Date()) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        return newDate;
    }
};
/**
 * Funções de validação
 */
exports.validationUtils = {
    /**
     * Valida um endereço de e-mail
     */
    isValidEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    /**
     * Valida se uma string não está vazia
     */
    isNotEmpty: (value) => {
        return value !== null && value !== undefined && value.trim() !== '';
    },
    /**
     * Valida um CPF (formato básico)
     */
    isValidCPF: (cpf) => {
        const cpfClean = cpf.replace(/[^\d]/g, '');
        if (cpfClean.length !== 11)
            return false;
        // Verifica CPFs com dígitos repetidos (que são inválidos)
        if (/^(\d)\1+$/.test(cpfClean))
            return false;
        // Implementação básica - para uma validação completa seria necessário
        // incluir o algoritmo de verificação dos dígitos
        return true;
    }
};
/**
 * Utilitários para respostas HTTP
 */
exports.httpUtils = {
    /**
     * Envia resposta de sucesso
     */
    sendSuccess: (res, data = null, message = 'Operação realizada com sucesso') => {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    },
    /**
     * Envia resposta de erro
     */
    sendError: (res, message = 'Ocorreu um erro', statusCode = 400) => {
        return res.status(statusCode).json({
            success: false,
            message
        });
    },
    /**
     * Envia resposta de erro interno
     */
    sendServerError: (res, error) => {
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
exports.securityUtils = {
    /**
     * Gera um hash para uma senha
     */
    hashPassword: (password) => {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    },
    /**
     * Verifica se uma senha corresponde a um hash
     */
    verifyPassword: (password, hashedPassword) => {
        const [salt, storedHash] = hashedPassword.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return storedHash === hash;
    },
    /**
     * Gera um token aleatório
     */
    generateToken: (length = 32) => {
        return crypto.randomBytes(length).toString('hex');
    }
};
/**
 * Utilitários para logging
 */
exports.logUtils = {
    /**
     * Registra uma mensagem de log em arquivo
     */
    logToFile: (message, logType = 'info') => {
        const logDir = path_1.default.join(__dirname, '../logs');
        const today = new Date().toISOString().split('T')[0];
        const logFile = path_1.default.join(logDir, `${logType}-${today}.log`);
        // Garante que o diretório de logs existe
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs_1.default.appendFileSync(logFile, logEntry);
    },
    /**
     * Registra um erro
     */
    logError: (error, context = '') => {
        const message = `ERRO ${context ? `[${context}]` : ''}: ${error.message || error}`;
        console.error(message);
        exports.logUtils.logToFile(message, 'error');
    },
    /**
     * Registra uma informação
     */
    logInfo: (message) => {
        console.info(message);
        exports.logUtils.logToFile(message, 'info');
    }
};
/**
 * Utilitários para cálculos de horários e estatísticas
 */
exports.horariosUtils = {
    /**
     * Calcula o total de horas trabalhadas em um período
     */
    calcularHorasTrabalhadas: (entradas, saidas) => {
        if (entradas.length !== saidas.length) {
            throw new Error('Número de entradas e saídas não correspondem');
        }
        let totalHoras = 0;
        for (let i = 0; i < entradas.length; i++) {
            totalHoras += exports.dateUtils.calculateHoursDifference(entradas[i], saidas[i]);
        }
        return totalHoras;
    },
    /**
     * Formata um número de horas para exibição (horas e minutos)
     */
    formatarHoras: (horas) => {
        const horasInteiras = Math.floor(horas);
        const minutos = Math.round((horas - horasInteiras) * 60);
        return `${horasInteiras}h${minutos > 0 ? ` ${minutos}min` : ''}`;
    }
};
exports.default = {
    dateUtils: exports.dateUtils,
    validationUtils: exports.validationUtils,
    httpUtils: exports.httpUtils,
    securityUtils: exports.securityUtils,
    logUtils: exports.logUtils,
    horariosUtils: exports.horariosUtils
};
//# sourceMappingURL=utils.js.map