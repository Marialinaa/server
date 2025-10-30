const axios = require('axios');
const base = 'https://back-end-aura-hubb-production.up.railway.app/api';

function rand(s) { return `${s}_${Date.now()}_${Math.floor(Math.random()*1000)}`; }

async function safeRequest(method, path, data) {
  try {
    const url = `${base}/${path}`;
    console.log(`-> ${method} ${url}`);
    const res = await axios({ method, url, data, timeout: 15000 });
    console.log(`   STATUS ${res.status}`);
    console.log(JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err) {
    console.log(`   ERROR ${method} ${path}`);
    if (err.response) {
      console.log('   status:', err.response.status);
      console.log('   data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('   err:', err.message);
    }
    return null;
  }
}

(async () => {
  console.log('START remote full smoke ->', base);

  // 1) Register via /auth/register (pendente)
  const nomeReg = rand('RegUser');
  const emailReg = `${nomeReg}@example.com`;
  const loginReg = `${nomeReg}`;
  const senhaReg = 'Senha123!';

  const regResp = await safeRequest('POST', 'auth/register', { nome: nomeReg, email: emailReg, login: loginReg, senha: senhaReg, tipo_usuario: 'responsavel' });
  const regUserId = regResp?.userId || regResp?.data?.id || regResp?.data?.userId || null;
  console.log('registered userId:', regUserId);

  // 2) Approve the user if created
  if (regUserId) {
    await safeRequest('POST', 'auth/approve', { userId: regUserId });
  }

  // 3) Login with newly approved user
  const loginResp = await safeRequest('POST', 'auth/login', { email: emailReg, password: senhaReg });
  const token = loginResp?.token || loginResp?.data?.token || null;
  console.log('login token present?', !!token);

  // 4) Create responsavel via /usuarios/responsavel (approved)
  const respEmail = `${rand('resp')}@example.com`;
  const respBody = { nomeCompleto: 'Resp Smoke Test', email: respEmail, funcao: 'Responsável de Teste', instituicao: 'TesteLab' };
  const respCreate = await safeRequest('POST', 'usuarios/responsavel', respBody);
  const respId = respCreate?.data?.id || respCreate?.id || respCreate?.data?.id;
  console.log('responsavel id:', respId);

  // 5) Create bolsista via /usuarios/bolsista (approved)
  const bolsEmail = `${rand('bols')}@example.com`;
  const matricula = `M${Date.now().toString().slice(-6)}`;
  const bolsBody = { nomeCompleto: 'Bolsista Smoke Test', email: bolsEmail, matricula, curso: 'CC', periodo: '1', instituicao: 'TesteLab' };
  const bolsCreate = await safeRequest('POST', 'usuarios/bolsista', bolsBody);
  const bolsId = bolsCreate?.data?.id || bolsCreate?.id || bolsCreate?.data?.id;
  console.log('bolsista id:', bolsId);

  // 6) Create atribuição
  if (respId && bolsId) {
    const atribBody = { responsavel_id: Number(respId), bolsista_id: Number(bolsId), titulo: 'Smoke atrib', descricao: 'Criada por remote_full_smoke', status: 'pendente' };
    const atrib = await safeRequest('POST', 'atribuicoes', atribBody);
    const atribId = atrib?.Data?.id || atrib?.data?.id || atrib?.id || null;
    console.log('atrib id:', atribId);

    // 7) If atrib created, post horarios entrada/saida
    if (atribId) {
      await safeRequest('POST', 'horarios/entrada', { bolsista_id: Number(bolsId), atribuicao_id: Number(atribId) });
      await safeRequest('POST', 'horarios/saida', { bolsista_id: Number(bolsId), atribuicao_id: Number(atribId) });
    }
  } else {
    console.log('Skipping atrib creation due to missing ids');
  }

  console.log('REMOTE FULL SMOKE FINISHED');
})();
