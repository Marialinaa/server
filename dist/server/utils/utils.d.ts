import { Response } from 'express';
/**
 * Funções para manipulação de data e hora
 */
export declare const dateUtils: {
    /**
     * Formata uma data para o formato brasileiro (DD/MM/YYYY)
     */
    formatDate: (date: Date) => string;
    /**
     * Formata um horário (HH:MM:SS)
     */
    formatTime: (date: Date) => string;
    /**
     * Formata data e hora completos
     */
    formatDateTime: (date: Date) => string;
    /**
     * Calcula a diferença em horas entre duas datas
     */
    calculateHoursDifference: (startDate: Date, endDate: Date) => number;
    /**
     * Retorna o início do dia atual
     */
    startOfDay: (date?: Date) => Date;
    /**
     * Retorna o fim do dia atual
     */
    endOfDay: (date?: Date) => Date;
};
/**
 * Funções de validação
 */
export declare const validationUtils: {
    /**
     * Valida um endereço de e-mail
     */
    isValidEmail: (email: string) => boolean;
    /**
     * Valida se uma string não está vazia
     */
    isNotEmpty: (value: string) => boolean;
    /**
     * Valida um CPF (formato básico)
     */
    isValidCPF: (cpf: string) => boolean;
};
/**
 * Utilitários para respostas HTTP
 */
export declare const httpUtils: {
    /**
     * Envia resposta de sucesso
     */
    sendSuccess: (res: Response, data?: any, message?: string) => Response;
    /**
     * Envia resposta de erro
     */
    sendError: (res: Response, message?: string, statusCode?: number) => Response;
    /**
     * Envia resposta de erro interno
     */
    sendServerError: (res: Response, error: any) => Response;
};
/**
 * Utilitários para segurança
 */
export declare const securityUtils: {
    /**
     * Gera um hash para uma senha
     */
    hashPassword: (password: string) => string;
    /**
     * Verifica se uma senha corresponde a um hash
     */
    verifyPassword: (password: string, hashedPassword: string) => boolean;
    /**
     * Gera um token aleatório
     */
    generateToken: (length?: number) => string;
};
/**
 * Utilitários para logging
 */
export declare const logUtils: {
    /**
     * Registra uma mensagem de log em arquivo
     */
    logToFile: (message: string, logType?: "info" | "error" | "warn") => void;
    /**
     * Registra um erro
     */
    logError: (error: any, context?: string) => void;
    /**
     * Registra uma informação
     */
    logInfo: (message: string) => void;
};
/**
 * Utilitários para cálculos de horários e estatísticas
 */
export declare const horariosUtils: {
    /**
     * Calcula o total de horas trabalhadas em um período
     */
    calcularHorasTrabalhadas: (entradas: Date[], saidas: Date[]) => number;
    /**
     * Formata um número de horas para exibição (horas e minutos)
     */
    formatarHoras: (horas: number) => string;
};
declare const _default: {
    dateUtils: {
        /**
         * Formata uma data para o formato brasileiro (DD/MM/YYYY)
         */
        formatDate: (date: Date) => string;
        /**
         * Formata um horário (HH:MM:SS)
         */
        formatTime: (date: Date) => string;
        /**
         * Formata data e hora completos
         */
        formatDateTime: (date: Date) => string;
        /**
         * Calcula a diferença em horas entre duas datas
         */
        calculateHoursDifference: (startDate: Date, endDate: Date) => number;
        /**
         * Retorna o início do dia atual
         */
        startOfDay: (date?: Date) => Date;
        /**
         * Retorna o fim do dia atual
         */
        endOfDay: (date?: Date) => Date;
    };
    validationUtils: {
        /**
         * Valida um endereço de e-mail
         */
        isValidEmail: (email: string) => boolean;
        /**
         * Valida se uma string não está vazia
         */
        isNotEmpty: (value: string) => boolean;
        /**
         * Valida um CPF (formato básico)
         */
        isValidCPF: (cpf: string) => boolean;
    };
    httpUtils: {
        /**
         * Envia resposta de sucesso
         */
        sendSuccess: (res: Response, data?: any, message?: string) => Response;
        /**
         * Envia resposta de erro
         */
        sendError: (res: Response, message?: string, statusCode?: number) => Response;
        /**
         * Envia resposta de erro interno
         */
        sendServerError: (res: Response, error: any) => Response;
    };
    securityUtils: {
        /**
         * Gera um hash para uma senha
         */
        hashPassword: (password: string) => string;
        /**
         * Verifica se uma senha corresponde a um hash
         */
        verifyPassword: (password: string, hashedPassword: string) => boolean;
        /**
         * Gera um token aleatório
         */
        generateToken: (length?: number) => string;
    };
    logUtils: {
        /**
         * Registra uma mensagem de log em arquivo
         */
        logToFile: (message: string, logType?: "info" | "error" | "warn") => void;
        /**
         * Registra um erro
         */
        logError: (error: any, context?: string) => void;
        /**
         * Registra uma informação
         */
        logInfo: (message: string) => void;
    };
    horariosUtils: {
        /**
         * Calcula o total de horas trabalhadas em um período
         */
        calcularHorasTrabalhadas: (entradas: Date[], saidas: Date[]) => number;
        /**
         * Formata um número de horas para exibição (horas e minutos)
         */
        formatarHoras: (horas: number) => string;
    };
};
export default _default;
//# sourceMappingURL=utils.d.ts.map