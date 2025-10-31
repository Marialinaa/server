import { Request, Response } from "express";
export interface Atribuicao {
    id: number;
    responsavelId: number;
    bolsistaId: string;
    responsavelNome: string;
    bolsistaNome: string;
    dataAtribuicao: string;
    status: 'ativa' | 'inativa';
    observacoes?: string;
}
export declare const handleListAtribuicoes: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handleCreateAtribuicao: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handleUpdateAtribuicao: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handleDeleteAtribuicao: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=atribuicoes.d.ts.map