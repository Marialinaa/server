const https = require('https');

console.log('🧪 Teste de Registro Completo - Simulação de Usuário');
console.log('===============================================');

// Dados do novo usuário bolsista
const novoUsuario = {
  nome: "Maria João Silva",
  email: "maria.joao@estudante.ufla.br", 
  login: "maria.joao",
  senha: "senha123456",
  tipoUsuario: "bolsista"
};

console.log('👤 Dados do usuário:', novoUsuario);

const testarRegistro = () => {
  const data = JSON.stringify(novoUsuario);

  const options = {
    hostname: 'server-zb16.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('\n🔄 Enviando solicitação de registro...');

  const req = https.request(options, (res) => {
    console.log(`\n📊 Status: ${res.statusCode}`);
    console.log(`📊 Status Text: ${res.statusMessage}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📝 RESPOSTA COMPLETA:');
      console.log(responseData);
      
      try {
        const parsed = JSON.parse(responseData);
        console.log('\n📋 RESPOSTA FORMATADA:');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('\n✅ REGISTRO BEM-SUCEDIDO!');
          console.log(`📧 Email: ${parsed.data?.email || 'N/A'}`);
          console.log(`📋 Status: ${parsed.data?.status || 'N/A'}`);
          console.log(`🎯 Próximo passo: Aguardar aprovação do administrador`);
        } else {
          console.log('\n❌ ERRO NO REGISTRO:');
          console.log(`💬 Mensagem: ${parsed.message}`);
        }
        
      } catch (e) {
        console.error('\n💥 Erro ao parsear resposta:', e);
        console.error('📄 Resposta bruta:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`\n💥 Erro na requisição: ${e.message}`);
  });

  req.write(data);
  req.end();
};

testarRegistro();