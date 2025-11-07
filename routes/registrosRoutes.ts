import express from 'express';
import registrosController from '../controllers/registrosController';

const router = express.Router();

// Registrar entrada de bolsista
router.post('/entrada', registrosController.registrarEntrada);

// Registrar saída de bolsista
router.post('/saida', registrosController.registrarSaida);

// Listar registros de entrada/saída com filtros
router.get('/', registrosController.listarRegistros);

export default router;