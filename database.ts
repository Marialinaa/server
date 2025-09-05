// Re-export das funções de database que estão em server/config/database.ts
export * from './config/database';
import poolDefault, { dbConfig as db } from './config/database';

// Named export 'pool' esperado por algumas rotas
export const pool = poolDefault as typeof poolDefault;
export { db };

export default poolDefault;
