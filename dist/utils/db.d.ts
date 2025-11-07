import mysql from 'mysql2/promise';
declare class DatabaseConnection {
    private static instance;
    private static initPromise;
    private static reconnectAttempts;
    private static readonly MAX_RECONNECT_ATTEMPTS;
    /**
     * Obtém a instância do pool de conexões (método assíncrono)
     * Garante que o pool seja inicializado antes de retornar
     */
    static getInstance(): Promise<mysql.Pool>;
    /**
     * Inicialização privada do pool
     */
    private static initialize;
    /**
     * Getter síncrono para o pool (usa quando já inicializado)
     * Lança erro se pool não estiver pronto
     */
    static get pool(): mysql.Pool;
    /**
     * Verifica a saúde da conexão
     */
    static checkHealth(): Promise<{
        healthy: boolean;
        message: any;
    }>;
    /**
     * Fecha o pool de conexões
     */
    static closePool(): Promise<void>;
}
export default DatabaseConnection;
export declare const getPool: () => Promise<mysql.Pool>;
export declare const checkHealth: () => Promise<{
    healthy: boolean;
    message: any;
}>;
export declare const closePool: () => Promise<void>;
export declare const pool: mysql.Pool;
//# sourceMappingURL=db.d.ts.map