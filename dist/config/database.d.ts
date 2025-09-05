import * as mysql from 'mysql2/promise';
declare let dbConfig: any;
export declare const createConnection: () => Promise<mysql.Connection>;
export declare const createPool: () => mysql.Pool;
export declare const testDatabaseConnection: () => Promise<boolean>;
declare const pool: mysql.Pool;
export { dbConfig };
export default pool;
//# sourceMappingURL=database.d.ts.map