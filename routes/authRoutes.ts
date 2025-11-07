import express from 'express';
import { handleLogin, handleRegister } from './auth';

const router = express.Router();

// Rota de registro de usuário
router.post('/register', handleRegister);

// Rota de login
router.post('/login', handleLogin);

// Rota para aprovação de usuário (protegida por middleware no arquivo principal)
router.post('/approve', (_req, res) => {
  res.status(501).json({ success: false, message: 'Função ainda não implementada' });
});

// Rota para rejeição de usuário (protegida por middleware no arquivo principal)
router.post('/reject', (_req, res) => {
  res.status(501).json({ success: false, message: 'Função ainda não implementada' });
});

export default router;
