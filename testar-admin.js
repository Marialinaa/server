const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const config = {
  host: 'mysql-198f52f6-maria-687f.b.aivencloud.com',
  port: 28405,
  user: 'maria_compat',
  password: 'AVNS_OhayJfBtjN_r1PIaMFZ',
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
};

async function testarAdmin() {
  const connection = await mysql.createConnection(config);
  
  console.log('🔍 Verificando administradores...');
  const [admins] = await connection.execute(
    'SELECT id, nome_completo, email, login, tipo_usuario, data_criacao FROM usuarios WHERE tipo_usuario = ?',
    ['admin']
  );
  
  console.log('Administradores encontrados:', admins);
  
  if (admins.length === 0) {
    console.log('❌ Nenhum administrador encontrado!');
  } else {
    console.log('✅ Administradores configurados:');
    admins.forEach(admin => {
      console.log(`  - ID: ${admin.id}, Email: ${admin.email}, Nome: ${admin.nome_completo}`);
    });
  }
  
  // Testar login admin123@gmail.com
  console.log('\n🔐 Testando login admin123@gmail.com:');
  const [loginTest] = await connection.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    ['admin123@gmail.com']
  );
  
  if (loginTest.length > 0) {
    const admin = loginTest[0];
    console.log('✅ Usuário encontrado:', {
      id: admin.id,
      email: admin.email,
      tipo: admin.tipo_usuario
    });
    
    // Testar senha
    const senhaCorreta = await bcrypt.compare('12345', admin.senha_hash);
    console.log('🔒 Senha está correta:', senhaCorreta);
  } else {
    console.log('❌ Usuário admin123@gmail.com não encontrado!');
  }
  
  await connection.end();
}

testarAdmin().catch(console.error);