const pool = require('./config/database').default || require('./config/database');

(async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS solicitacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255),
        email VARCHAR(255),
        status VARCHAR(50),
        data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    // pool may be a mysql2 Pool or a connection; handle both
    if (typeof pool.execute === 'function') {
      await pool.execute(sql);
    } else if (typeof pool.query === 'function') {
      await pool.query(sql);
    } else {
      console.error('Pool não tem execute/query');
      process.exit(1);
    }
    console.log('Tabela solicitacoes garantida (if not exists).');
  } catch (err) {
    console.error('Erro ao criar tabela solicitacoes:', err && err.message);
    process.exit(1);
  } finally {
    try { if (pool && typeof pool.end === 'function') pool.end(); } catch(e){}
  }
})();
