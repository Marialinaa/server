// ============================================
// RE-EXPORTS PARA COMPATIBILIDADE
// ============================================

// Re-export do sistema novo (utils/db.ts) - PREFERENCIAL
export { default as DatabaseConnection, pool, getPool, checkHealth, closePool } from './utils/db';

// Re-export do sistema antigo (config/database.ts) - LEGADO
export * from './config/database';
export { dbConfig as db } from './config/database';

// Default export aponta para o sistema novo
import DatabaseConnection from './utils/db';
export default DatabaseConnection;

// NOTA: Código novo deve usar:
// import DatabaseConnection from '../database';
// const pool = await DatabaseConnection.getInstance();
