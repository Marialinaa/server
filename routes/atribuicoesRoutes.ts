import express from 'express';
import atribuicoesController from '../controllers/atribuicoesController';

const router = express.Router();

// Criar uma nova atribuição
router.post('/', atribuicoesController.criarAtribuicao);

// Listar atribuições com filtros opcionais
router.get('/', atribuicoesController.listarAtribuicoes);

// Obter atribuição específica pelo ID
router.get('/:id', atribuicoesController.getAtribuicao);

export default router;
