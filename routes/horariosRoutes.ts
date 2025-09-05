import express from 'express';
import * as horariosController from '../controllers/horariosController';

const router = express.Router();

// Registrar entrada
router.post('/entrada', horariosController.registrarEntrada);

// Registrar saída
router.post('/saida', horariosController.registrarSaida);

// Listar horários de um bolsista
router.get('/bolsista/:bolsista_id', horariosController.listarHorarios);

// Buscar horário de hoje para um bolsista
router.get('/hoje/:bolsista_id', horariosController.buscarHorarioHoje);

// Obter estatísticas de horários
router.get('/estatisticas', horariosController.obterEstatisticas);

export default router;
