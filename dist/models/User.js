"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../utils/db"));
// Normaliza diferentes nomes de colunas entre esquemas (ex.: nome_completo vs nome)
const normalizeUserRow = (row) => {
    if (!row)
        return row;
    return {
        id: row.id || row.ID || null,
        nome_completo: row.nome_completo || row.nome || row.nomeCompleto || row.name || null,
        email: row.email || row.Email || null,
        login: row.login || row.Login || null,
        tipo_usuario: row.tipo_usuario || row.tipoUsuario || row.type || null,
        status: row.status || row.situacao || (row.data_solicitacao ? 'pendente' : 'liberado') || null,
        dataSolicitacao: row.data_solicitacao || row.data_criacao || row.created_at || null,
        senha_hash: row.senha_hash || row.senhaHash || null,
        // conservar todos os campos originais para flexibilidade
        _raw: row
    };
};
const UserModel = {
    // Se status === 'pendente' e quiser solicitações, consulta tabela solicitacoes
    async list(filters = {}) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            // Caso especial: listar solicitações pendentes (tolerante a esquema)
            if (filters.status === 'pendente') {
                const sql = 'SELECT * FROM solicitacoes WHERE status = ? ORDER BY data_solicitacao DESC';
                try {
                    const [rows] = await pool.execute(sql, ['pendente']);
                    return (rows || []).map(normalizeUserRow);
                }
                catch (err) {
                    // Se a tabela 'solicitacoes' não existir no banco atual, não falharamos toda a listagem
                    console.warn("Aviso: tabela 'solicitacoes' inacessível ou ausente. Retornando lista vazia para solicitações.", err && err.message);
                    return [];
                }
            }
            const where = [];
            const params = [];
            if (filters.tipo_usuario) {
                where.push('tipo_usuario = ?');
                params.push(filters.tipo_usuario);
            }
            if (filters.status) {
                where.push('status = ?');
                params.push(filters.status);
            }
            // Selecionar todos os campos e normalizar em JS para evitar erros caso colunas possuam nomes diferentes
            const sql = `SELECT * FROM usuarios ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
            const [rows] = await pool.execute(sql, params);
            return (rows || []).map(normalizeUserRow);
        }
        catch (error) {
            console.error('UserModel.list error', error);
            throw error;
        }
    },
    async getById(id) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
            return rows && rows.length ? normalizeUserRow(rows[0]) : null;
        }
        catch (error) {
            console.error('UserModel.getById error', error);
            throw error;
        }
    },
    async getByEmail(email) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const [rowsUsu] = await pool.execute('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
            if (rowsUsu && rowsUsu.length)
                return normalizeUserRow(rowsUsu[0]);
            // Também checar em solicitacoes (usuários ainda não aprovados)
            try {
                const [rowsSol] = await pool.execute('SELECT * FROM solicitacoes WHERE email = ? LIMIT 1', [email]);
                if (rowsSol && rowsSol.length)
                    return normalizeUserRow(rowsSol[0]);
            }
            catch (err) {
                // se a tabela não existir, ignorar e continuar
                console.warn("Aviso: não foi possível consultar 'solicitacoes' para getByEmail:", err && err.message);
            }
            return null;
        }
        catch (error) {
            console.error('UserModel.getByEmail error', error);
            throw error;
        }
    },
    async create(data) {
        var _a, _b, _c, _d, _e;
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            // Remover 'status' pois não existe na tabela usuarios
            const fields = ['nome_completo', 'email', 'login', 'senha_hash', 'tipo_usuario', 'data_criacao'];
            const values = [
                (_a = data.nome_completo) !== null && _a !== void 0 ? _a : null,
                (_b = data.email) !== null && _b !== void 0 ? _b : null,
                (_c = data.login) !== null && _c !== void 0 ? _c : null,
                (_d = data.senha_hash) !== null && _d !== void 0 ? _d : null,
                (_e = data.tipo_usuario) !== null && _e !== void 0 ? _e : null,
                new Date()
            ];
            const placeholders = fields.map(() => '?').join(',');
            const sql = `INSERT INTO usuarios (${fields.join(',')}) VALUES (${placeholders})`;
            console.log('🔍 [UserModel.create] SQL:', sql);
            console.log('🔍 [UserModel.create] Values:', values);
            const [result] = await pool.execute(sql, values);
            const insertId = result.insertId || result.insert_id;
            return { id: insertId, ...data };
        }
        catch (error) {
            console.error('UserModel.create error', error);
            throw error;
        }
    },
    async validatePassword(user, plainPassword) {
        try {
            const bcrypt = require('bcrypt');
            if (!user || !user.senha_hash)
                return false;
            return await bcrypt.compare(plainPassword, user.senha_hash);
        }
        catch (error) {
            console.error('UserModel.validatePassword error', error);
            return false;
        }
    },
    async updateStatus(userId, status) {
        try {
            // ✅ Obter pool de forma segura
            const pool = await db_1.default.getInstance();
            const sql = 'UPDATE usuarios SET status = ? WHERE id = ?';
            const [result] = await pool.execute(sql, [status, userId]);
            return (result && (result.affectedRows || result.affected_rows)) ? true : false;
        }
        catch (error) {
            console.error('UserModel.updateStatus error', error);
            throw error;
        }
    }
};
exports.default = UserModel;
//# sourceMappingURL=User.js.map