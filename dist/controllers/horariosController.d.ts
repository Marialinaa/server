import { Request, Response } from 'express';
export declare const registrarEntrada: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const registrarSaida: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listarHorarios: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const buscarHorarioHoje: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const obterEstatisticas: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    registrarEntrada: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    registrarSaida: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    listarHorarios: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    buscarHorarioHoje: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    obterEstatisticas: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=horariosController.d.ts.map