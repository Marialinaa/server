"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterEstatisticas = exports.buscarHorarioHoje = exports.listarHorarios = exports.registrarSaida = exports.registrarEntrada = void 0;
const Horario_1 = __importDefault(require("../models/Horario"));
const registrarEntrada = async (req, res) => {
    try {
        console.log('🕒 Registrando entrada:', req.body);
        const { bolsista_id, nome_atividade } = req.body;
        if (!bolsista_id) {
            console.log('❌ ID do bolsista não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID do bolsista é obrigatório'
            });
        }
        // Data e hora atuais
        const dataHoje = new Date().toISOString().split('T')[0];
        const horaAtual = new Date().toTimeString().slice(0, 8);
        const horario = {
            bolsista_id: Number(bolsista_id),
            data_registro: dataHoje,
            hora_entrada: horaAtual,
            nome_atividade: nome_atividade || 'Atividade do dia'
        };
        // Registrar entrada
        const novoHorario = await Horario_1.default.registrarEntrada(horario);
        console.log('✅ Entrada registrada com sucesso:', novoHorario);
        return res.status(201).json({
            success: true,
            message: 'Entrada registrada com sucesso',
            data: novoHorario
        });
    }
    catch (error) {
        console.error('❌ Erro ao registrar entrada:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao registrar entrada',
            error: error.message
        });
    }
};
exports.registrarEntrada = registrarEntrada;
const registrarSaida = async (req, res) => {
    try {
        console.log('🕒 Registrando saída:', req.body);
        const { bolsista_id } = req.body;
        if (!bolsista_id) {
            console.log('❌ ID do bolsista não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID do bolsista é obrigatório'
            });
        }
        // Data e hora atuais
        const dataHoje = new Date().toISOString().split('T')[0];
        const horaAtual = new Date().toTimeString().slice(0, 8);
        // Observações opcionais
        const observacoes = req.body.observacoes;
        // Registrar saída
        const horarioAtualizado = await Horario_1.default.registrarSaida(Number(bolsista_id), dataHoje, horaAtual, observacoes);
        if (!horarioAtualizado) {
            console.log('❌ Nenhum registro de entrada encontrado para hoje');
            return res.status(404).json({
                success: false,
                message: 'Nenhum registro de entrada encontrado para hoje'
            });
        }
        console.log('✅ Saída registrada com sucesso:', horarioAtualizado);
        return res.json({
            success: true,
            message: 'Saída registrada com sucesso',
            data: horarioAtualizado
        });
    }
    catch (error) {
        console.error('❌ Erro ao registrar saída:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao registrar saída',
            error: error.message
        });
    }
};
exports.registrarSaida = registrarSaida;
const listarHorarios = async (req, res) => {
    try {
        console.log('🔍 Listando horários:', req.query);
        const bolsista_id = Number(req.query.bolsista_id);
        const data_inicio = req.query.data_inicio;
        const data_fim = req.query.data_fim;
        if (!bolsista_id) {
            console.log('❌ ID do bolsista não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID do bolsista é obrigatório'
            });
        }
        const horarios = await Horario_1.default.listarPorBolsista(bolsista_id, data_inicio, data_fim);
        console.log(`✅ ${horarios.length} horários encontrados`);
        return res.json({
            success: true,
            message: 'Horários listados com sucesso',
            data: horarios
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar horários:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar horários',
            error: error.message
        });
    }
};
exports.listarHorarios = listarHorarios;
const buscarHorarioHoje = async (req, res) => {
    try {
        console.log('🔍 Buscando horário de hoje:', req.params);
        const bolsista_id = Number(req.params.bolsista_id);
        if (!bolsista_id) {
            console.log('❌ ID do bolsista não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID do bolsista é obrigatório'
            });
        }
        const horarioHoje = await Horario_1.default.buscarHorarioHoje(bolsista_id);
        if (!horarioHoje) {
            console.log('❓ Nenhum registro encontrado para hoje');
            return res.json({
                success: true,
                message: 'Nenhum registro encontrado para hoje',
                data: null
            });
        }
        console.log('✅ Horário de hoje encontrado:', horarioHoje);
        return res.json({
            success: true,
            message: 'Horário de hoje encontrado',
            data: horarioHoje
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar horário de hoje:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar horário de hoje',
            error: error.message
        });
    }
};
exports.buscarHorarioHoje = buscarHorarioHoje;
const obterEstatisticas = async (req, res) => {
    try {
        console.log('📊 Obtendo estatísticas:', req.query);
        const bolsista_id = Number(req.query.bolsista_id);
        const data_inicio = req.query.data_inicio;
        const data_fim = req.query.data_fim;
        if (!bolsista_id) {
            console.log('❌ ID do bolsista não fornecido');
            return res.status(400).json({
                success: false,
                message: 'ID do bolsista é obrigatório'
            });
        }
        const estatisticas = await Horario_1.default.obterEstatisticas(bolsista_id, data_inicio, data_fim);
        console.log(`✅ ${estatisticas.length} registros estatísticos processados`);
        return res.json({
            success: true,
            message: 'Estatísticas obtidas com sucesso',
            data: estatisticas
        });
    }
    catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter estatísticas',
            error: error.message
        });
    }
};
exports.obterEstatisticas = obterEstatisticas;
exports.default = {
    registrarEntrada: exports.registrarEntrada,
    registrarSaida: exports.registrarSaida,
    listarHorarios: exports.listarHorarios,
    buscarHorarioHoje: exports.buscarHorarioHoje,
    obterEstatisticas: exports.obterEstatisticas
};
//# sourceMappingURL=horariosController.js.map