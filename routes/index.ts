import express from 'express';
import os from 'os';
import authRoutes from './authRoutes';
import usuariosRoutes from './usuariosRoutes';
import atribuicoesRoutes from './atribuicoesRoutes';
import horariosRoutes from './horariosRoutes';

const router = express.Router();

// Rota de teste simples
router.get('/test', (_req, res) => {
  res.json({
    success: true,
    message: 'API funcionando normalmente',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3005
  });
});

// Rota de teste para redirectTo
router.post('/test-redirect', (_req, res) => {
  res.json({
    success: true,
    message: 'Teste de redirectTo',
    redirectTo: '/admin',
    testField: 'TESTE_FUNCIONANDO',
    timestamp: new Date().toISOString()
  });
});

// Rota de debug para verificar estrutura da tabela
router.post('/debug/sql', async (req, res) => {
  try {
    const DatabaseConnection = await import('../utils/db');
    const pool = await DatabaseConnection.default.getInstance();
    
    console.log('🔍 [DEBUG-SQL] Executando:', req.body.sql);
    
    const [rows]: any = await pool.execute(req.body.sql);
    
    res.json({
      success: true,
      message: 'SQL executado com sucesso',
      data: rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [DEBUG-SQL] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro executando SQL',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de teste para email
router.post('/test-email', async (_req, res) => {
  try {
    const { sendEmail, notificarAdminNovoUsuario } = await import('../email');
    
    console.log('📧 [TEST] Testando função de email...');
    
    // Testar email simples
    const resultadoSimples = await sendEmail(
      'mariaxxlina@gmail.com', 
      'Teste de Email - Sistema Funcionando', 
      '<h1>✅ Sistema de Email Funcionando!</h1><p>Este é um teste para verificar se o email está sendo enviado corretamente.</p>'
    );
    
    console.log('📧 [TEST] Resultado email simples:', resultadoSimples);
    
    // Testar notificação de admin
    const resultadoAdmin = await notificarAdminNovoUsuario({
      nome: 'Usuario Teste Email',
      tipo_usuario: 'bolsista',
      email: 'teste@exemplo.com',
      login: 'teste123'
    });
    
    console.log('📧 [TEST] Resultado notificação admin:', resultadoAdmin);
    
    res.json({
      success: true,
      message: 'Teste de email executado',
      resultados: {
        emailSimples: resultadoSimples,
        notificacaoAdmin: resultadoAdmin
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [TEST] Erro no teste de email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no teste de email',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de teste para registro
router.post('/test-register', (req, res) => {
  console.log('📋 [TEST-REGISTER] Requisição recebida:', req.body);
  res.json({
    success: true,
    message: 'Teste de registro funcionando',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Teste simplificado de auth/register
router.post('/simple-register', async (req, res) => {
  try {
    console.log('🧪 [SIMPLE-REGISTER] Iniciando teste simples...');
    console.log('📋 [SIMPLE-REGISTER] Body:', req.body);
    
    res.json({
      success: true,
      message: 'Função de registro simplificada funcionando',
      receivedData: req.body
    });
  } catch (error: any) {
    console.error('❌ [SIMPLE-REGISTER] Erro:', error);
    res.status(500).json({
      success: false,
      message: `Erro: ${error.message}`
    });
  }
});

// Rota que retorna configuração útil para clientes em desenvolvimento
// Detecta o IP local da máquina para facilitar o uso do frontend em outros dispositivos na mesma rede
router.get('/config', (_req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIP = 'localhost';

    for (const name of Object.keys(interfaces)) {
      const addrs = interfaces[name] as os.NetworkInterfaceInfo[] | undefined;
      if (!addrs) continue;
      for (const iface of addrs) {
        // procurar IPv4 não-interna
        if ((iface.family === 'IPv4' || (typeof iface.family === 'string' && iface.family.includes('4'))) && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
      if (localIP !== 'localhost') break;
    }

    const port = process.env.PORT || 3005;
    const apiUrl = `http://${localIP}:${port}/api`;

    return res.json({ success: true, apiUrl, localIP, port });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao detectar configuração', error: String(error) });
  }
});

// Rotas públicas
router.use('/auth', authRoutes);

// Middleware de autenticação para rotas protegidas
// router.use(authMiddleware); // Temporariamente desabilitado para testes

// Rotas protegidas
router.use('/usuarios', usuariosRoutes);
router.use('/atribuicoes', atribuicoesRoutes);
router.use('/horarios', horariosRoutes);

export default router;
