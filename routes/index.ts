import express from 'express';
import os from 'os';
import authRoutes from './authRoutes';
import usuariosRoutes from './usuariosRoutes';
import atribuicoesRoutes from './atribuicoesRoutes';
import horariosRoutes from './horariosRoutes';
import './config/loadConfig';

const router = express.Router();

// Rota de teste simples
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando normalmente',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3005
  });
});

// Rota que retorna configuração útil para clientes em desenvolvimento
// Detecta o IP local da máquina para facilitar o uso do frontend em outros dispositivos na mesma rede
router.get('/config', (req, res) => {
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
