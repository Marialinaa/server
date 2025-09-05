import pool from '../config/database';

// Normaliza diferentes nomes de colunas entre esquemas (ex.: nome_completo vs nome)
const normalizeUserRow = (row: any) => {
  if (!row) return row;
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

export interface User {
  id?: number;
  nome_completo?: string;
  email?: string;
  login?: string;
  senha_hash?: string;
  tipo_usuario?: string;
  status?: string;
}

interface UserPayload {
  nome_completo?: string;
  email?: string;
  login?: string;
  senha_hash?: string;
  tipo_usuario?: string;
  status?: string;
}

const UserModel = {
  // Se status === 'pendente' e quiser solicitações, consulta tabela solicitacoes
  async list(filters: Record<string, any> = {}) {
    try {
      // Caso especial: listar solicitações pendentes (tolerante a esquema)
      if (filters.status === 'pendente') {
        const sql = 'SELECT * FROM solicitacoes WHERE status = ? ORDER BY data_solicitacao DESC';
        try {
          const [rows]: any = await pool.execute(sql, ['pendente']);
          return (rows || []).map(normalizeUserRow);
        } catch (err: any) {
          // Se a tabela 'solicitacoes' não existir no banco atual, não falharamos toda a listagem
          console.warn("Aviso: tabela 'solicitacoes' inacessível ou ausente. Retornando lista vazia para solicitações.", err && err.message);
          return [];
        }
      }

      const where: string[] = [];
      const params: any[] = [];
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
      const [rows]: any = await pool.execute(sql, params);
      return (rows || []).map(normalizeUserRow);
    } catch (error) {
      console.error('UserModel.list error', error);
      throw error;
    }
  },

  async getById(id: number) {
    try {
      const [rows]: any = await pool.execute('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
      return rows && rows.length ? normalizeUserRow(rows[0]) : null;
    } catch (error) {
      console.error('UserModel.getById error', error);
      throw error;
    }
  },

  async getByEmail(email: string) {
    try {
      const [rowsUsu]: any = await pool.execute('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
      if (rowsUsu && rowsUsu.length) return normalizeUserRow(rowsUsu[0]);

      // Também checar em solicitacoes (usuários ainda não aprovados)
      try {
        const [rowsSol]: any = await pool.execute('SELECT * FROM solicitacoes WHERE email = ? LIMIT 1', [email]);
        if (rowsSol && rowsSol.length) return normalizeUserRow(rowsSol[0]);
      } catch (err: any) {
        // se a tabela não existir, ignorar e continuar
        console.warn("Aviso: não foi possível consultar 'solicitacoes' para getByEmail:", err && err.message);
      }

      return null;
    } catch (error) {
      console.error('UserModel.getByEmail error', error);
      throw error;
    }
  },

  async create(data: UserPayload) {
    try {
      const fields = ['nome_completo','email','login','senha_hash','tipo_usuario','status'];
      const values = fields.map(f => (data as any)[f] ?? null);
      const placeholders = fields.map(() => '?').join(',');
      const sql = `INSERT INTO usuarios (${fields.join(',')}) VALUES (${placeholders})`;
      const [result]: any = await pool.execute(sql, values);
      const insertId = result.insertId || (result as any).insert_id;
      return { id: insertId, ...data };
    } catch (error) {
      console.error('UserModel.create error', error);
      throw error;
    }
  }
,

  async validatePassword(user: any, plainPassword: string) {
    try {
      const bcrypt = require('bcrypt');
      if (!user || !user.senha_hash) return false;
      return await bcrypt.compare(plainPassword, user.senha_hash);
    } catch (error) {
      console.error('UserModel.validatePassword error', error);
      return false;
    }
  },

  async updateStatus(userId: number, status: string) {
    try {
      const sql = 'UPDATE usuarios SET status = ? WHERE id = ?';
      const [result]: any = await pool.execute(sql, [status, userId]);
      return (result && (result.affectedRows || result.affected_rows)) ? true : false;
    } catch (error) {
      console.error('UserModel.updateStatus error', error);
      throw error;
    }
  }
};

export default UserModel;
