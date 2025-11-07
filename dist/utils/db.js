"use strict";
// ============================================
// CONEXÃO COM BANCO DE DADOS - AIVEN (MySQL Cloud)
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.closePool = exports.checkHealth = exports.getPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuração de conexão com o banco Aiven
const poolConfig = {
    host: process.env.DB_HOST || 'mysql-198f52f6-maria-687f.b.aivencloud.com',
    port: parseInt(process.env.DB_PORT || '28405'),
    user: process.env.DB_USER || 'maria_compat',
    password: process.env.DB_PASSWORD || 'AVNS_OhayJfBtjN_r1PIaMFZ',
    database: process.env.DB_NAME || 'defaultdb',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    queueLimit: 0,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000'),
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // SSL necessário para Aiven
    ssl: {
        rejectUnauthorized: false
    },
    timezone: 'Z',
    charset: 'utf8mb4'
};
// ============================================
// PADRÃO SINGLETON COM INICIALIZAÇÃO SEGURA
// ============================================
class DatabaseConnection {
    /**
     * Obtém a instância do pool de conexões (método assíncrono)
     * Garante que o pool seja inicializado antes de retornar
     */
    static async getInstance() {
        if (this.instance) {
            return this.instance;
        }
        if (!this.initPromise) {
            this.initPromise = this.initialize();
        }
        return this.initPromise;
    }
    /**
     * Inicialização privada do pool
     */
    static async initialize() {
        try {
            console.log('🔌 Criando pool de conexões MySQL (Aiven)...');
            console.log(`📍 Host: ${poolConfig.host}:${poolConfig.port}`);
            console.log(`🗄️  Database: ${poolConfig.database}`);
            this.instance = promise_1.default.createPool(poolConfig);
            // Validar conexão
            const connection = await this.instance.getConnection();
            console.log('✅ Conexão com banco de dados Aiven estabelecida!');
            await connection.query('SELECT 1');
            connection.release();
            this.reconnectAttempts = 0;
            return this.instance;
        }
        catch (error) {
            console.error('❌ Erro ao conectar ao banco de dados:', error.message);
            if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                this.reconnectAttempts++;
                const waitTime = this.reconnectAttempts * 2000;
                console.log(`🔄 Tentando reconectar em ${waitTime / 1000}s... (tentativa ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
                // Reset da promise para permitir nova tentativa
                this.initPromise = null;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return this.initialize();
            }
            console.error('💥 Falha total ao conectar ao banco de dados após múltiplas tentativas.');
            throw error;
        }
    }
    /**
     * Getter síncrono para o pool (usa quando já inicializado)
     * Lança erro se pool não estiver pronto
     */
    static get pool() {
        if (!this.instance) {
            throw new Error('Database pool not initialized. Call getInstance() first or wait for initialization.');
        }
        return this.instance;
    }
    /**
     * Verifica a saúde da conexão
     */
    static async checkHealth() {
        try {
            const pool = await this.getInstance();
            const connection = await pool.getConnection();
            await connection.query('SELECT 1');
            connection.release();
            return { healthy: true, message: 'Database connection OK' };
        }
        catch (error) {
            return { healthy: false, message: error.message };
        }
    }
    /**
     * Fecha o pool de conexões
     */
    static async closePool() {
        if (this.instance) {
            console.log('🔌 Fechando pool de conexões...');
            await this.instance.end();
            this.instance = null;
            this.initPromise = null;
            console.log('✅ Pool fechado com sucesso');
        }
    }
}
DatabaseConnection.instance = null;
DatabaseConnection.initPromise = null;
DatabaseConnection.reconnectAttempts = 0;
DatabaseConnection.MAX_RECONNECT_ATTEMPTS = 5;
// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================
// Inicializa automaticamente quando o módulo é carregado
DatabaseConnection.getInstance().catch(error => {
    console.error('💥 Erro fatal na inicialização do banco:', error);
    process.exit(1);
});
// ============================================
// HANDLERS DE SHUTDOWN GRACIOSO
// ============================================
process.on('SIGTERM', async () => {
    console.log('⚠️  SIGTERM recebido, fechando conexões...');
    await DatabaseConnection.closePool();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('⚠️  SIGINT recebido, fechando conexões...');
    await DatabaseConnection.closePool();
    process.exit(0);
});
// ============================================
// EXPORTS
// ============================================
// Export do Singleton
exports.default = DatabaseConnection;
// Export de funções auxiliares para compatibilidade
const getPool = () => DatabaseConnection.getInstance();
exports.getPool = getPool;
const checkHealth = () => DatabaseConnection.checkHealth();
exports.checkHealth = checkHealth;
const closePool = () => DatabaseConnection.closePool();
exports.closePool = closePool;
// Export do pool como getter (para compatibilidade com código legado)
// ATENÇÃO: Use getInstance() para código novo
exports.pool = new Proxy({}, {
    get(_target, prop) {
        const instance = DatabaseConnection.pool;
        return instance[prop];
    }
});
//# sourceMappingURL=db.js.map