const https = require('https');

console.log('🧪 Teste de Registro Simplificado');
console.log('================================');

// Dados simples sem caracteres especiais
const usuarioSimples = {
  nome: "Ana Silva",
  email: "ana.silva@email.com", 
  login: "ana.silva",
  senha: "123456",
  tipoUsuario: "bolsista"
};

console.log('👤 Dados do usuário:', usuarioSimples);

const testarRegistroSimples = () => {
  const data = JSON.stringify(usuarioSimples);
  console.log('\n📄 JSON enviado:', data);
  console.log('📏 Tamanho:', data.length);

  const options = {
    hostname: 'server-zb16.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  console.log('\n🔄 Enviando solicitação...');

  const req = https.request(options, (res) => {
    console.log(`\n📊 Status: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📝 RESPOSTA:');
      console.log(responseData);
      
      try {
        const parsed = JSON.parse(responseData);
        console.log('\n✅ SUCESSO! Resposta:', parsed);
      } catch (e) {
        console.error('\n❌ ERRO no parse:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`\n💥 Erro: ${e.message}`);
  });

  req.write(data, 'utf8');
  req.end();
};

testarRegistroSimples();