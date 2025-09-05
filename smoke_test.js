const axios = require('axios');
const base = 'http://localhost:3005/api';

async function safeRequest(method, path, data) {
  try {
    const url = `${base}/${path}`;
    const opts = { method, url, data, timeout: 10000 };
    const res = await axios(opts);
    console.log(`--- OK ${method} /${path} ---`);
    console.log(JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err) {
    console.log(`--- ERROR ${method} /${path} ---`);
    if (err.response) {
      console.log('status:', err.response.status);
      console.log('data:', err.response.data);
    } else {
      console.log(err.message);
    }
    return null;
  }
}

(async () => {
  console.log('START smoke tests ->', base);
  await safeRequest('GET', 'health');
  await safeRequest('GET', 'test');
  const usersResp = await safeRequest('GET', 'usuarios');
  let users = [];
  if (Array.isArray(usersResp)) users = usersResp;
  else if (usersResp && Array.isArray(usersResp.data)) users = usersResp.data;
  else if (usersResp && Array.isArray(usersResp.usuarios)) users = usersResp.usuarios;

  console.log('Usuarios count:', users.length);
  if (users.length < 2) {
    console.log('Menos de 2 usuários encontrados — criando usuários de teste...');
    // Criar um responsável de teste
    const respCreate = await safeRequest('POST', 'usuarios/responsavel', { nomeCompleto: 'Resp Smoke Test', email: `resp_smoke_${Date.now()}@example.com`, funcao: 'Responsável de Teste', instituicao: 'TesteLab' });
    // Criar um bolsista de teste
    const bolsCreate = await safeRequest('POST', 'usuarios/bolsista', { nomeCompleto: 'Bolsista Smoke Test', email: `bols_smoke_${Date.now()}@example.com`, matricula: `S${Date.now()}`, curso: 'CC', periodo: '1', instituicao: 'TesteLab' });

    // Recarregar lista de usuários
    const usersResp2 = await safeRequest('GET', 'usuarios');
    if (Array.isArray(usersResp2)) users = usersResp2;
    else if (usersResp2 && Array.isArray(usersResp2.data)) users = usersResp2.data;
    else if (usersResp2 && Array.isArray(usersResp2.usuarios)) users = usersResp2.usuarios;
    console.log('Novo usuarios count:', users.length);
  }

  const responsavel = users.find(u => u.tipo_usuario === 'responsavel' || u.tipoUsuario === 'responsavel' || u.tipo === 'responsavel') || users[0];
  const bolsista = users.find(u => u.tipo_usuario === 'bolsista' || u.tipoUsuario === 'bolsista' || u.tipo === 'bolsista') || users[1];

  console.log('Responsavel id:', responsavel?.id, 'Bolsista id:', bolsista?.id);

  const atrib = await safeRequest('POST', 'atribuicoes', { responsavel_id: Number(responsavel.id), bolsista_id: Number(bolsista.id), titulo: 'Smoke atrib', descricao: 'Criada por smoke_test.js', status: 'pendente' });
  let atribId = null;
  if (atrib) atribId = atrib.Data?.id || atrib.data?.id || atrib.id;
  console.log('Atribuicao id:', atribId);

  if (atribId) {
    await safeRequest('POST', 'horarios/entrada', { bolsista_id: Number(bolsista.id), atribuicao_id: Number(atribId) });
    await safeRequest('POST', 'horarios/saida', { bolsista_id: Number(bolsista.id), atribuicao_id: Number(atribId) });
  } else {
    console.log('Sem atribuicao criada, pulando horarios');
  }

  console.log('SMOKE TESTS FINISHED');
})();
