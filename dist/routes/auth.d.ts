import { Request, Response } from "express";
export declare const handleLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=auth.d.ts.map