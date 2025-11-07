"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Registrar entrada de bolsista
const registrarEntrada = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do usuário é obrigatório'
            });
        }
        const pool = await (await Promise.resolve().then(() => __importStar(require('../utils/db')))).default.getInstance();
        // Verificar se usuário existe e é bolsista
        const [usuarios] = await pool.execute('SELECT id, nome_completo, tipo_usuario FROM usuarios WHERE id = ? AND tipo_usuario = "bolsista"', [usuario_id]);
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bolsista não encontrado'
            });
        }
        // Verificar se já há entrada sem saída hoje
        const hoje = new Date().toISOString().split('T')[0];
        const [entradaAberta] = await pool.execute('SELECT id FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? AND hora_saida IS NULL', [usuario_id, hoje]);
        if (entradaAberta && entradaAberta.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Já existe uma entrada em aberto para hoje. Registre a saída primeiro.'
            });
        }
        // Registrar entrada
        const agora = new Date();
        const horaAtual = agora.toTimeString().split(' ')[0];
        const [result] = await pool.execute(`INSERT INTO registros_entrada (usuario_id, data_entrada, hora_entrada) 
       VALUES (?, ?, ?)`, [usuario_id, hoje, horaAtual]);
        console.log(`✅ Entrada registrada para bolsista ${usuario_id} às ${horaAtual}`);
        return res.json({
            success: true,
            message: 'Entrada registrada com sucesso!',
            data: {
                id: result.insertId,
                usuario_id,
                data_entrada: hoje,
                hora_entrada: horaAtual,
                bolsista: usuarios[0].nome_completo
            }
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
// Registrar saída de bolsista
const registrarSaida = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do usuário é obrigatório'
            });
        }
        const pool = await (await Promise.resolve().then(() => __importStar(require('../utils/db')))).default.getInstance();
        // Buscar entrada em aberto para hoje
        const hoje = new Date().toISOString().split('T')[0];
        const [entradaAberta] = await pool.execute('SELECT id, hora_entrada FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? AND hora_saida IS NULL', [usuario_id, hoje]);
        if (!entradaAberta || entradaAberta.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhuma entrada em aberto encontrada para hoje'
            });
        }
        // Registrar saída
        const agora = new Date();
        const horaAtual = agora.toTimeString().split(' ')[0];
        await pool.execute('UPDATE registros_entrada SET hora_saida = ? WHERE id = ?', [horaAtual, entradaAberta[0].id]);
        console.log(`✅ Saída registrada para bolsista ${usuario_id} às ${horaAtual}`);
        return res.json({
            success: true,
            message: 'Saída registrada com sucesso!',
            data: {
                id: entradaAberta[0].id,
                usuario_id,
                data_entrada: hoje,
                hora_entrada: entradaAberta[0].hora_entrada,
                hora_saida: horaAtual
            }
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
// Listar registros de entrada/saída
const listarRegistros = async (req, res) => {
    try {
        const { usuario_id, data_inicio, data_fim } = req.query;
        const pool = await (await Promise.resolve().then(() => __importStar(require('../utils/db')))).default.getInstance();
        let query = `
      SELECT 
        r.id,
        r.usuario_id,
        r.data_entrada,
        r.hora_entrada,
        r.hora_saida,
        u.nome_completo as bolsista_nome
      FROM registros_entrada r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE 1=1
    `;
        const params = [];
        if (usuario_id) {
            query += ' AND r.usuario_id = ?';
            params.push(usuario_id);
        }
        if (data_inicio) {
            query += ' AND r.data_entrada >= ?';
            params.push(data_inicio);
        }
        if (data_fim) {
            query += ' AND r.data_entrada <= ?';
            params.push(data_fim);
        }
        query += ' ORDER BY r.data_entrada DESC, r.hora_entrada DESC';
        const [registros] = await pool.execute(query, params);
        return res.json({
            success: true,
            data: registros,
            total: registros.length
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar registros:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar registros',
            error: error.message
        });
    }
};
exports.default = {
    registrarEntrada,
    registrarSaida,
    listarRegistros
};
