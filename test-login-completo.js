const https = require('https');

const testLogin = () => {
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
    console.log(`Headers:`, res.headers);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== RESPOSTA COMPLETA ===');
      console.log(responseData);
      console.log('\n=== RESPOSTA FORMATADA ===');
      try {
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        console.log('\n=== VERIFICAÇÃO redirectTo ===');
        console.log('redirectTo presente:', 'redirectTo' in parsed);
        console.log('redirectTo valor:', parsed.redirectTo);
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

console.log('🧪 Testando login do administrador...');
testLogin();