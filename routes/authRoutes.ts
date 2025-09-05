import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

// Rota de registro de usuário
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota para aprovação de usuário (protegida por middleware no arquivo principal)
router.post('/approve', authController.approveUser);

// Rota para rejeição de usuário (protegida por middleware no arquivo principal)
router.post('/reject', authController.rejectUser);

export default router;
