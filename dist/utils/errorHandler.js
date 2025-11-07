"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.asyncHandler = exports.httpErrors = exports.ApiError = void 0;
const logger_1 = __importDefault(require("./logger"));
// Classe personalizada para erros da API
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
// Erros HTTP comuns
exports.httpErrors = {
    badRequest: (message = 'Requisição inválida') => new ApiError(400, message),
    unauthorized: (message = 'Não autorizado') => new ApiError(401, message),
    forbidden: (message = 'Acesso negado') => new ApiError(403, message),
    notFound: (message = 'Recurso não encontrado') => new ApiError(404, message),
    conflict: (message = 'Conflito de recurso') => new ApiError(409, message),
    serverError: (message = 'Erro interno do servidor') => new ApiError(500, message, false)
};
// Middleware para capturar erros em async/await
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
// Middleware para tratamento de erros
const errorHandler = (err, req, res, _next) => {
    let error = err;
    // Se não for um ApiError, converte para um erro interno
    if (!(error instanceof ApiError)) {
        const message = error.message || 'Erro interno do servidor';
        error = new ApiError(500, message, false, err.stack);
    }
    // Log do erro
    logger_1.default.error(`[${error.statusCode}] ${error.message}`, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        isOperational: error.isOperational,
        stack: error.stack
    });
    // Resposta para o cliente
    const response = {
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
    res.status(error.statusCode).json(response);
};
exports.errorHandler = errorHandler;
exports.default = { ApiError, httpErrors: exports.httpErrors, asyncHandler: exports.asyncHandler, errorHandler: exports.errorHandler };
