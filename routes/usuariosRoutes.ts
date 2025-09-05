import express from 'express';
import usuariosController from '../controllers/usuariosController';

const router = express.Router();

// Listar usuários com filtros opcionais
router.get('/', usuariosController.listarUsuarios);

// Obter usuário específico pelo ID
router.get('/:id', usuariosController.getUsuario);

// Atualizar usuário (status, etc.)
router.put('/:id', usuariosController.atualizarUsuario);

// Criar um novo responsável
router.post('/responsavel', usuariosController.criarResponsavel);

// Criar um novo bolsista
router.post('/bolsista', usuariosController.criarBolsista);

// Listar solicitações pendentes
router.get('/solicitacoes/pendentes', usuariosController.listarSolicitacoes);

export default router;
