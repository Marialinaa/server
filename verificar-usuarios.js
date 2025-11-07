require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('🔍 Verificando estrutura da tabela usuarios...');
    const [rows] = await connection.execute('DESCRIBE usuarios');
    console.log('\n📋 Colunas da tabela usuarios:');
    rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();