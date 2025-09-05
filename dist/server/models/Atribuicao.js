"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const AtribuicaoModel = {
    async create(a) {
        try {
            const sql = 'INSERT INTO atribuicoes (bolsista_id, responsavel_id, titulo, descricao, status, data_criacao) VALUES (?, ?, ?, ?, ?, NOW())';
            const params = [a.bolsista_id, a.responsavel_id || null, a.titulo || null, a.descricao || null, a.status || 'pendente'];
            const [result] = await database_1.default.execute(sql, params);
            return { id: result.insertId, ...a };
        }
        catch (error) {
            console.error('AtribuicaoModel.create error', error);
            throw error;
        }
    },
    async list(filters) {
        try {
            let sql = 'SELECT id, bolsista_id, responsavel_id, titulo, descricao, status, data_criacao, data_atualizacao, data_conclusao FROM atribuicoes WHERE 1=1';
            const params = [];
            if (filters?.responsavel_id) {
                sql += ' AND responsavel_id = ?';
                params.push(filters.responsavel_id);
            }
            if (filters?.bolsista_id) {
                sql += ' AND bolsista_id = ?';
                params.push(filters.bolsista_id);
            }
            if (filters?.status) {
                sql += ' AND status = ?';
                params.push(filters.status);
            }
            sql += ' ORDER BY data_criacao DESC';
            const [rows] = await database_1.default.execute(sql, params);
            return rows || [];
        }
        catch (error) {
            console.error('AtribuicaoModel.list error', error);
            throw error;
        }
    },
    async getById(id) {
        try {
            const [rows] = await database_1.default.execute('SELECT id, bolsista_id, responsavel_id, titulo, descricao, status, data_criacao, data_atualizacao, data_conclusao FROM atribuicoes WHERE id = ?', [id]);
            return rows && rows[0] ? rows[0] : null;
        }
        catch (error) {
            console.error('AtribuicaoModel.getById error', error);
            throw error;
        }
    },
    async bolsistaJaAtribuido(bolsista_id) {
        try {
            const [rows] = await database_1.default.execute('SELECT COUNT(*) as cnt FROM atribuicoes WHERE bolsista_id = ? AND status != "cancelada"', [bolsista_id]);
            return rows && rows[0] && rows[0].cnt > 0;
        }
        catch (error) {
            console.error('AtribuicaoModel.bolsistaJaAtribuido error', error);
            throw error;
        }
    }
};
exports.default = AtribuicaoModel;
//# sourceMappingURL=Atribuicao.js.map