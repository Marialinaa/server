import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    approveUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    rejectUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=authController.d.ts.map