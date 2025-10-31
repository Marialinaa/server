export interface Horario {
    id?: number;
    bolsista_id: number;
    data_registro?: string;
    hora_entrada?: string;
    hora_saida?: string;
    nome_atividade?: string;
}
declare const HorarioModel: {
    registrarEntrada(h: Horario): Promise<{
        id: any;
        bolsista_id: number;
        data_registro: string | undefined;
        hora_entrada: string | undefined;
    }>;
    registrarSaida(bolsista_id: number, data_registro: string, hora_saida: string, _observacoes?: string): Promise<any>;
    listarPorBolsista(bolsista_id: number, data_inicio?: string, data_fim?: string): Promise<any>;
    buscarHorarioHoje(bolsista_id: number): Promise<any>;
    obterEstatisticas(bolsista_id: number, data_inicio?: string, data_fim?: string): Promise<{
        data: string;
        horas: number;
    }[]>;
};
export default HorarioModel;
//# sourceMappingURL=Horario.d.ts.map