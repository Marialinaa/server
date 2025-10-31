import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean, stack?: string);
}
export declare const httpErrors: {
    badRequest: (message?: string) => ApiError;
    unauthorized: (message?: string) => ApiError;
    forbidden: (message?: string) => ApiError;
    notFound: (message?: string) => ApiError;
    conflict: (message?: string) => ApiError;
    serverError: (message?: string) => ApiError;
};
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: any, req: Request, res: Response, _next: NextFunction) => void;
declare const _default: {
    ApiError: typeof ApiError;
    httpErrors: {
        badRequest: (message?: string) => ApiError;
        unauthorized: (message?: string) => ApiError;
        forbidden: (message?: string) => ApiError;
        notFound: (message?: string) => ApiError;
        conflict: (message?: string) => ApiError;
        serverError: (message?: string) => ApiError;
    };
    asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
    errorHandler: (err: any, req: Request, res: Response, _next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=errorHandler.d.ts.map