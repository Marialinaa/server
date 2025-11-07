const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

console.log('🔧 INSERINDO ADMINISTRADOR FIXO NO BANCO');
console.log('=====================================');

const config = {
  host: 'mysql-198f52f6-maria-687f.b.aivencloud.com',
  port: 28405,
  user: 'maria_compat',
  password: 'AVNS_OhayJfBtjN_r1PIaMFZ',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 30000
};

const adminData = {
  nome_completo: 'Administrador do Sistema',
  funcao: 'Administrador',
  endereco: 'Sistema Central',
  email: 'admin123@gmail.com',
  login: 'admin123',
  senha: '12345',
  tipo_usuario: 'admin',
  status: 'liberado'
};

async function criarAdministrador() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conexão estabelecida!');
    
    // Verificar se admin já existe
    console.log('🔍 Verificando se administrador já existe...');
    const [existingAdmin] = await connection.execute(
      'SELECT id, email FROM usuarios WHERE email = ? OR tipo_usuario = ?',
      [adminData.email, 'admin']
    );
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  Administrador já existe:');
      existingAdmin.forEach(admin => {
        console.log(`   - ID: ${admin.id}, Email: ${admin.email}`);
      });
      
      // Atualizar dados do admin existente
      console.log('🔄 Atualizando dados do administrador existente...');
      const senhaHash = await bcrypt.hash(adminData.senha, 10);
      
      await connection.execute(
        `UPDATE usuarios 
         SET nome_completo = ?, senha_hash = ?, tipo_usuario = 'admin', ultimo_acesso = CURRENT_TIMESTAMP
         WHERE email = ?`,
        [adminData.nome_completo, senhaHash, adminData.email]
      );
      
      console.log('✅ Administrador atualizado com sucesso!');
    } else {
      // Criar novo admin
      console.log('➕ Criando novo administrador...');
      
      // Criptografar senha
      const senhaHash = await bcrypt.hash(adminData.senha, 10);
      
      const [result] = await connection.execute(
        `INSERT INTO usuarios (nome_completo, email, login, senha_hash, tipo_usuario, data_criacao) 
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          adminData.nome_completo,
          adminData.email,
          adminData.login,
          senhaHash,
          adminData.tipo_usuario
        ]
      );
      
      console.log(`✅ Administrador criado com ID: ${result.insertId}`);
    }
    
    // Verificar dados finais
    console.log('\n📋 DADOS DO ADMINISTRADOR:');
    const [adminFinal] = await connection.execute(
      'SELECT id, nome_completo, email, login, tipo_usuario, data_criacao FROM usuarios WHERE email = ?',
      [adminData.email]
    );
    
    if (adminFinal.length > 0) {
      const admin = adminFinal[0];
      console.log('=====================================');
      console.log(`👤 ID: ${admin.id}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Login: ${admin.login}`);
      console.log(`🔒 Senha: ${adminData.senha}`);
      console.log(`👑 Tipo: ${admin.tipo_usuario}`);
      console.log(`👑 Tipo Usuário: ${admin.tipo_usuario}`);
      console.log(`📅 Criado: ${admin.data_criacao}`);
      console.log('=====================================');
    }
    
    console.log('\n🎯 TESTE DE LOGIN:');
    console.log('URL: https://server-zb16.onrender.com/api/auth/login');
    console.log('POST Body:');
    console.log(JSON.stringify({
      email: adminData.email,
      password: adminData.senha
    }, null, 2));
    
    console.log('\n✅ ADMINISTRADOR CONFIGURADO COM SUCESSO!');
    console.log('🔄 Redirecionamento: /admin');
    
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

criarAdministrador();