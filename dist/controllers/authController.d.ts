import { Request, Response } from 'express';
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function approveUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function rejectUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map