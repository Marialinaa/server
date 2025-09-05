import * as mysql from 'mysql2/promise';

// ========================================
// � CONFIGURAÇÃO DO BANCO DE DADOS (tolerante a DB_*, MYSQL_* e URLs)
// ========================================
function parseMysqlUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    return {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
    };
  } catch (err) {
    return null;
  }
}

// Preferências de fontes de configuração (primeiro que tiver valor válido)
let dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
} as any;

// Se existir URL completa (DB_URL ou MYSQL_URL ou MYSQL_PUBLIC_URL), usar ela
const urlCandidates = [process.env.DB_URL, process.env.MYSQL_URL, process.env.MYSQL_PUBLIC_URL];
for (const u of urlCandidates) {
  if (u) {
    const parsed = parseMysqlUrl(u);
    if (parsed) {
      dbConfig = { ...dbConfig, ...parsed };
      break;
    }
  }
}

// Fallback para variáveis MYSQL_* quando DB_* não estiverem completas
if ((!dbConfig.host || !dbConfig.user || !dbConfig.database) && process.env.MYSQLHOST) {
  dbConfig.host = dbConfig.host || process.env.MYSQLHOST;
  dbConfig.user = dbConfig.user || process.env.MYSQLUSER;
  dbConfig.password = dbConfig.password || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  dbConfig.database = dbConfig.database || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.MYSQL_DATABASE;
  dbConfig.port = dbConfig.port || (process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : undefined);
}

// Último fallback: usar valores padrão locais
dbConfig = {
  host: dbConfig.host || 'localhost',
  port: dbConfig.port || 3306,
  user: dbConfig.user || 'root',
  password: dbConfig.password || '',
  database: dbConfig.database || 'projeto_ufla',
  charset: dbConfig.charset || 'utf8mb4'
};

export const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão com banco de dados estabelecida');
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    console.error('🔧 Verifique as configurações em server/config/database.ts');
    throw error;
  }
};

export const createPool = () => {
  try {
    const pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('✅ Pool de conexões criado com sucesso');
    return pool;
  } catch (error) {
    console.error('❌ Erro ao criar pool de conexões:', error);
    throw error;
  }
};

export const testDatabaseConnection = async () => {
  try {
    const connection = await createConnection();
    console.log('🧪 Testando conexão com banco de dados...');
    
    // Testar uma query simples
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Teste de conexão bem-sucedido!');
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error);
    throw error;
  }
};

const pool = createPool();

// Expor também a configuração para debug (não expor senhas em produção)
export { dbConfig };

export default pool;
