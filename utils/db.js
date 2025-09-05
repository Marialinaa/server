const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'projeto_ufla',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  charset: 'utf8mb4'
});

pool.getConnection().then(conn => {
  console.log('[DB] Conectado ao MySQL:', process.env.DB_NAME);
  conn.release();
}).catch(err => {
  console.error('[DB] Erro ao conectar:', err.message);
});

module.exports = pool;
