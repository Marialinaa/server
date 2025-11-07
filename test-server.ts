// Servidor mínimo para testar se o problema está no código principal
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002; // Porta diferente para evitar conflitos

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rota de teste básica
app.get('/', (_req, res) => {
  console.log('✅ Rota raiz chamada');
  res.json({ 
    status: 'ok', 
    message: 'Servidor mínimo funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para auth
app.post('/api/auth/test', (req, res) => {
  console.log('✅ Rota auth/test chamada');
  console.log('📋 Body:', req.body);
  
  res.json({
    success: true,
    message: 'Teste de auth funcionando',
    body: req.body
  });
});

// Error handler
app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('❌ Erro capturado:', error);
  res.status(500).json({ error: error.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor mínimo rodando na porta ${PORT}`);
  console.log(`📡 Teste: http://localhost:${PORT}`);
});

// Handlers de shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recebido - encerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT recebido - encerrando...');
  process.exit(0);
});

console.log('🔍 Servidor mínimo iniciado para diagnóstico');