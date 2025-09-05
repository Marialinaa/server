export interface Atribuicao {
    id?: number;
    bolsista_id: number;
    responsavel_id?: number | null;
    titulo?: string;
    descricao?: string;
    status?: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
}
declare const AtribuicaoModel: {
    create(a: Atribuicao): Promise<{
        id: any;
        bolsista_id: number;
        responsavel_id?: number | null;
        titulo?: string;
        descricao?: string;
        status?: "pendente" | "em_andamento" | "concluida" | "cancelada";
    }>;
    list(filters?: any): Promise<any>;
    getById(id: number): Promise<any>;
    bolsistaJaAtribuido(bolsista_id: number): Promise<any>;
};
export default AtribuicaoModel;
//# sourceMappingURL=Atribuicao.d.ts.map