import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Classe personalizada para erros da API
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Erros HTTP comuns
export const httpErrors = {
  badRequest: (message: string = 'Requisição inválida') => 
    new ApiError(400, message),
  
  unauthorized: (message: string = 'Não autorizado') => 
    new ApiError(401, message),
  
  forbidden: (message: string = 'Acesso negado') => 
    new ApiError(403, message),
  
  notFound: (message: string = 'Recurso não encontrado') => 
    new ApiError(404, message),
  
  conflict: (message: string = 'Conflito de recurso') => 
    new ApiError(409, message),
  
  serverError: (message: string = 'Erro interno do servidor') => 
    new ApiError(500, message, false)
};

// Middleware para capturar erros em async/await
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para tratamento de erros
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let error = err;
  
  // Se não for um ApiError, converte para um erro interno
  if (!(error instanceof ApiError)) {
    const message = error.message || 'Erro interno do servidor';
    error = new ApiError(500, message, false, err.stack);
  }
  
  // Log do erro
  logger.error(`[${error.statusCode}] ${error.message}`, {
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

export default { ApiError, httpErrors, asyncHandler, errorHandler };
