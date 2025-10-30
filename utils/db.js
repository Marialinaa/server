// ============================================
// CONEXÃO COM BANCO DE DADOS - AIVEN (MySQL Cloud)
// ============================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração de conexão com o banco Aiven
const poolConfig = {
  host: process.env.DB_HOST || 'mysql-198f52f6-maria-687f.b.aivencloud.com',
  port: parseInt(process.env.DB_PORT) || 28405,
  user: process.env.DB_USER || 'maria_compat',
  password: process.env.DB_PASSWORD || 'AVNS_OhayJfBtjN_r1PIaMFZ',
  database: process.env.DB_NAME || 'defaultdb',

  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 30000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,

  // SSL necessário para Aiven
  ssl: {
    rejectUnauthorized: false
  },

  timezone: 'Z',
  charset: 'utf8mb4',

  flags: [
    'FOUND_ROWS',
    'IGNORE_SPACE',
    'MULTI_STATEMENTS'
  ]
};

let pool;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

async function createPool() {
  try {
    console.log('🔌 Criando pool de conexões MySQL (Aiven)...');
    console.log(`📍 Host: ${poolConfig.host}:${poolConfig.port}`);
    console.log(`🗄️  Database: ${poolConfig.database}`);

    pool = mysql.createPool(poolConfig);

    const connection = await pool.getConnection();
    console.log('✅ Conexão com banco de dados Aiven estabelecida!');
    await connection.query('SELECT 1');
    connection.release();

    reconnectAttempts = 0;
    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const waitTime = reconnectAttempts * 2000;
      console.log(`🔄 Tentando reconectar em ${waitTime / 1000}s... (tentativa ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return createPool();
    }

    console.error('💥 Falha total ao conectar ao banco de dados após múltiplas tentativas.');
    throw error;
  }
}

async function checkHealth() {
  try {
    if (!pool) throw new Error('Pool não inicializado');
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return { healthy: true, message: 'Database connection OK' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}

async function closePool() {
  if (pool) {
    console.log('🔌 Fechando pool de conexões...');
    await pool.end();
    console.log('✅ Pool fechado com sucesso');
  }
}

// Inicializa automaticamente
createPool().catch(error => {
  console.error('💥 Erro fatal na inicialização do banco:', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recebido, fechando conexões...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT recebido, fechando conexões...');
  await closePool();
  process.exit(0);
});

module.exports = {
  get pool() {
    if (!pool) {
      throw new Error('Pool de conexões não está disponível. Aguarde a inicialização.');
    }
    return pool;
  },
  checkHealth,
  closePool,
  createPool
};
