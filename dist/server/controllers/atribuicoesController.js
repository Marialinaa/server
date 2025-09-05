"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Atribuicao_1 = __importDefault(require("../models/Atribuicao"));
const criarAtribuicao = async (req, res) => {
    try {
        console.log('📝 Criando nova atribuição:', req.body);
        const { responsavel_id, bolsista_id, descricao, atividade_nome } = req.body;
        // Validar campos obrigatórios
        if (!responsavel_id || !bolsista_id) {
            console.log('❌ Dados incompletos na requisição');
            return res.status(400).json({
                success: false,
                message: 'Responsável e bolsista são obrigatórios'
            });
        }
        // Verificar se bolsista já está atribuído
        const jaAtribuido = await Atribuicao_1.default.bolsistaJaAtribuido(bolsista_id);
        if (jaAtribuido) {
            console.log('⚠️ Bolsista já está atribuído a outro responsável');
            return res.status(409).json({
                success: false,
                message: 'Este bolsista já está atribuído a outro responsável'
            });
        }
        // Criar a nova atribuição
        const newAtribuicao = await Atribuicao_1.default.create({
            responsavel_id,
            bolsista_id,
            descricao,
            titulo: atividade_nome || null,
            status: 'pendente'
        });
        console.log('✅ Atribuição criada com sucesso:', newAtribuicao.id);
        return res.status(201).json({
            success: true,
            message: 'Atribuição criada com sucesso',
            data: newAtribuicao
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar atribuição:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar atribuição',
            error: error.message
        });
    }
};
const listarAtribuicoes = async (req, res) => {
    try {
        console.log('🔍 Listando atribuições com filtros:', req.query);
        const { responsavel_id, bolsista_id, status } = req.query;
        const filtros = {};
        if (responsavel_id)
            filtros.responsavel_id = Number(responsavel_id);
        if (bolsista_id)
            filtros.bolsista_id = Number(bolsista_id);
        if (status)
            filtros.status = status;
        const atribuicoes = await Atribuicao_1.default.list(filtros);
        console.log(`✅ ${atribuicoes.length} atribuições encontradas`);
        return res.json({
            success: true,
            data: atribuicoes
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar atribuições:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar atribuições',
            error: error.message
        });
    }
};
const getAtribuicao = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Buscando atribuição com ID: ${id}`);
        const atribuicao = await Atribuicao_1.default.getById(Number(id));
        if (!atribuicao) {
            console.log(`❌ Atribuição não encontrada: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Atribuição não encontrada'
            });
        }
        console.log(`✅ Atribuição encontrada: ${atribuicao.responsavel_nome} -> ${atribuicao.bolsista_nome}`);
        return res.json({
            success: true,
            data: atribuicao
        });
    }
    catch (error) {
        console.error(`❌ Erro ao buscar atribuição:`, error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar atribuição',
            error: error.message
        });
    }
};
exports.default = {
    criarAtribuicao,
    listarAtribuicoes,
    getAtribuicao
};
//# sourceMappingURL=atribuicoesController.js.map