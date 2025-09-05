import express from 'express';

const router = express.Router();

// Rota de teste simples
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de usuários funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;
