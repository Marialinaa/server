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
export declare const handleListAtribuicoes: (req: Request, res: Response) => Promise<void>;
export declare const handleCreateAtribuicao: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleUpdateAtribuicao: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleDeleteAtribuicao: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=atribuicoes.d.ts.map