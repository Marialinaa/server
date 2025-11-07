const https = require('https');

console.log('🔍 Teste: Fazendo login e verificando logs...');

const testLoginWithRedirect = () => {
  const data = JSON.stringify({
    email: 'admin123@gmail.com',
    password: '12345'
  });

  const options = {
    hostname: 'server-zb16.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== RESPOSTA RAW ===');
      console.log(responseData);
      
      try {
        const parsed = JSON.parse(responseData);
        console.log('\n=== RESPOSTA PARSED ===');
        console.log(JSON.stringify(parsed, null, 2));
        
        console.log('\n=== ANÁLISE redirectTo ===');
        console.log('redirectTo presente:', 'redirectTo' in parsed);
        console.log('redirectTo valor:', parsed.redirectTo);
        console.log('Todas as chaves:', Object.keys(parsed));
        console.log('Tipo da resposta:', typeof parsed);
        
        // Procurar por redirectTo em qualquer lugar
        const jsonString = JSON.stringify(parsed);
        console.log('String contém redirectTo:', jsonString.includes('redirectTo'));
        
      } catch (e) {
        console.error('Erro ao parsear JSON:', e);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Erro na requisição: ${e.message}`);
  });

  req.write(data);
  req.end();
};

testLoginWithRedirect();