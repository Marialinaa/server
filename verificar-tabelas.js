// Teste para verificar as tabelas do banco de dados
require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');

async function verificarTabelas() {
  console.log('🔍 Verificando tabelas no banco de dados...');
  
  let connection;
  try {
    // Usar as mesmas configurações do projeto
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };
    
    console.log('📧 Conectando no banco:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco!');
    
    // Listar todas as tabelas
    console.log('\n📋 Listando todas as tabelas:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tabelas encontradas:', tables);
    
    // Verificar se existe tabela projeto_ufla específica
    const [projectTables] = await connection.execute("SHOW TABLES LIKE '%projeto%'");
    console.log('\n🎯 Tabelas relacionadas a "projeto":', projectTables);
    
    // Verificar estrutura da tabela usuarios
    try {
      console.log('\n👥 Estrutura da tabela usuarios:');
      const [usuariosDesc] = await connection.execute('DESCRIBE usuarios');
      console.log(usuariosDesc);
      
      console.log('\n📊 Contagem de registros na tabela usuarios:');
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
      console.log('Total de usuários:', count[0].total);
      
      console.log('\n📝 Últimos 5 registros da tabela usuarios:');
      const [recent] = await connection.execute('SELECT id, nome_completo, email, tipo_usuario, status FROM usuarios ORDER BY id DESC LIMIT 5');
      console.log(recent);
      
    } catch (error) {
      console.log('⚠️ Tabela usuarios não encontrada ou erro:', error.message);
    }
    
    // Verificar se existe tabela solicitacoes
    try {
      console.log('\n📋 Estrutura da tabela solicitacoes:');
      const [solicitacoesDesc] = await connection.execute('DESCRIBE solicitacoes');
      console.log(solicitacoesDesc);
      
      console.log('\n📊 Contagem de registros na tabela solicitacoes:');
      const [countSol] = await connection.execute('SELECT COUNT(*) as total FROM solicitacoes');
      console.log('Total de solicitações:', countSol[0].total);
      
    } catch (error) {
      console.log('⚠️ Tabela solicitacoes não encontrada ou erro:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

verificarTabelas();