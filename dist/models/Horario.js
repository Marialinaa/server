"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../utils/db"));
const HorarioModel = {
    // Registrar entrada em `registros_entrada` (usuario_id => bolsista_id, data_entrada => data_registro)
    async registrarEntrada(h) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const sql = 'INSERT INTO registros_entrada (usuario_id, data_entrada, hora_entrada) VALUES (?, ?, ?)';
            const params = [h.bolsista_id, h.data_registro, h.hora_entrada];
            const [result] = await pool.execute(sql, params);
            return { id: result.insertId, bolsista_id: h.bolsista_id, data_registro: h.data_registro, hora_entrada: h.hora_entrada };
        }
        catch (error) {
            console.error('HorarioModel.registrarEntrada error', error);
            throw error;
        }
    },
    // Registrar saída atualizando registros_entrada.hora_saida
    async registrarSaida(bolsista_id, data_registro, hora_saida, _observacoes) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const sql = 'UPDATE registros_entrada SET hora_saida = ? WHERE usuario_id = ? AND data_entrada = ? AND (hora_saida IS NULL OR hora_saida = "")';
            const [result] = await pool.execute(sql, [hora_saida, bolsista_id, data_registro]);
            if ((result && (result.affectedRows || result.affected_rows) && (result.affectedRows || result.affected_rows) > 0)) {
                const [rows] = await pool.execute('SELECT id, usuario_id as bolsista_id, data_entrada as data_registro, hora_entrada, hora_saida FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? ORDER BY id DESC LIMIT 1', [bolsista_id, data_registro]);
                return rows && rows[0] ? rows[0] : null;
            }
            return null;
        }
        catch (error) {
            console.error('HorarioModel.registrarSaida error', error);
            throw error;
        }
    },
    async listarPorBolsista(bolsista_id, data_inicio, data_fim) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const params = [bolsista_id];
            let sql = 'SELECT id, usuario_id as bolsista_id, data_entrada as data_registro, hora_entrada, hora_saida FROM registros_entrada WHERE usuario_id = ?';
            if (data_inicio) {
                sql += ' AND data_entrada >= ?';
                params.push(data_inicio);
            }
            if (data_fim) {
                sql += ' AND data_entrada <= ?';
                params.push(data_fim);
            }
            sql += ' ORDER BY data_entrada DESC, id DESC';
            const [rows] = await pool.execute(sql, params);
            return rows || [];
        }
        catch (error) {
            console.error('HorarioModel.listarPorBolsista error', error);
            throw error;
        }
    },
    async buscarHorarioHoje(bolsista_id) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const dataHoje = new Date().toISOString().split('T')[0];
            const [rows] = await pool.execute('SELECT id, usuario_id as bolsista_id, data_entrada as data_registro, hora_entrada, hora_saida FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? ORDER BY id DESC LIMIT 1', [bolsista_id, dataHoje]);
            return rows && rows[0] ? rows[0] : null;
        }
        catch (error) {
            console.error('HorarioModel.buscarHorarioHoje error', error);
            throw error;
        }
    },
    async obterEstatisticas(bolsista_id, data_inicio, data_fim) {
        try {
            const rows = await this.listarPorBolsista(bolsista_id, data_inicio, data_fim);
            const agrupado = {};
            rows.forEach((r) => {
                if (!r.hora_saida || !r.hora_entrada)
                    return;
                const entrada = new Date(`1970-01-01T${r.hora_entrada}`);
                const saida = new Date(`1970-01-01T${r.hora_saida}`);
                const horas = (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
                agrupado[r.data_registro] = (agrupado[r.data_registro] || 0) + horas;
            });
            return Object.entries(agrupado).map(([data, horas]) => ({ data, horas }));
        }
        catch (error) {
            console.error('HorarioModel.obterEstatisticas error', error);
            throw error;
        }
    }
};
exports.default = HorarioModel;
//# sourceMappingURL=Horario.js.map