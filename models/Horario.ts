import pool from '../config/database';

export interface Horario {
  id?: number;
  bolsista_id: number; // alias for usuario_id in registros_entrada
  data_registro?: string; // alias for data_entrada
  hora_entrada?: string;
  hora_saida?: string;
  nome_atividade?: string;
}

const HorarioModel = {
  // Registrar entrada em `registros_entrada` (usuario_id => bolsista_id, data_entrada => data_registro)
  async registrarEntrada(h: Horario) {
    try {
  const sql = 'INSERT INTO registros_entrada (usuario_id, data_entrada, hora_entrada) VALUES (?, ?, ?)';
  const params = [h.bolsista_id, h.data_registro, h.hora_entrada];
      const [result]: any = await pool.execute(sql, params);
      return { id: result.insertId, bolsista_id: h.bolsista_id, data_registro: h.data_registro, hora_entrada: h.hora_entrada };
    } catch (error) {
      console.error('HorarioModel.registrarEntrada error', error);
      throw error;
    }
  },

  // Registrar saída atualizando registros_entrada.hora_saida
  async registrarSaida(bolsista_id: number, data_registro: string, hora_saida: string, observacoes?: string) {
    try {
  const sql = 'UPDATE registros_entrada SET hora_saida = ? WHERE usuario_id = ? AND data_entrada = ? AND (hora_saida IS NULL OR hora_saida = "")';
      const [result]: any = await pool.execute(sql, [hora_saida, bolsista_id, data_registro]);
      if ((result && (result.affectedRows || result.affected_rows) && (result.affectedRows || result.affected_rows) > 0)) {
        const [rows]: any = await pool.execute('SELECT id, usuario_id as bolsista_id, data_entrada as data_registro, hora_entrada, hora_saida FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? ORDER BY id DESC LIMIT 1', [bolsista_id, data_registro]);
        return rows && rows[0] ? rows[0] : null;
      }
      return null;
    } catch (error) {
      console.error('HorarioModel.registrarSaida error', error);
      throw error;
    }
  },

  async listarPorBolsista(bolsista_id: number, data_inicio?: string, data_fim?: string) {
    try {
      const params: any[] = [bolsista_id];
      let sql = 'SELECT id, usuario_id as bolsista_id, data_entrada as data_registro, hora_entrada, hora_saida FROM registros_entrada WHERE usuario_id = ?';
      if (data_inicio) {
        sql += ' AND data_entrada >= ?'; params.push(data_inicio);
      }
      if (data_fim) {
        sql += ' AND data_entrada <= ?'; params.push(data_fim);
      }
      sql += ' ORDER BY data_entrada DESC, id DESC';
      const [rows]: any = await pool.execute(sql, params);
      return rows || [];
    } catch (error) {
      console.error('HorarioModel.listarPorBolsista error', error);
      throw error;
    }
  },

  async buscarHorarioHoje(bolsista_id: number) {
    try {
      const dataHoje = new Date().toISOString().split('T')[0];
      const [rows]: any = await pool.execute('SELECT id, usuario_id as bolsista_id, data_entrada as data_registro, hora_entrada, hora_saida FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? ORDER BY id DESC LIMIT 1', [bolsista_id, dataHoje]);
      return rows && rows[0] ? rows[0] : null;
    } catch (error) {
      console.error('HorarioModel.buscarHorarioHoje error', error);
      throw error;
    }
  },

  async obterEstatisticas(bolsista_id: number, data_inicio?: string, data_fim?: string) {
    try {
      const rows = await this.listarPorBolsista(bolsista_id, data_inicio, data_fim);
      const agrupado: Record<string, number> = {};
      (rows as any[]).forEach((r) => {
        if (!r.hora_saida || !r.hora_entrada) return;
        const entrada = new Date(`1970-01-01T${r.hora_entrada}`);
        const saida = new Date(`1970-01-01T${r.hora_saida}`);
        const horas = (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
        agrupado[r.data_registro] = (agrupado[r.data_registro] || 0) + horas;
      });
      return Object.entries(agrupado).map(([data, horas]) => ({ data, horas }));
    } catch (error) {
      console.error('HorarioModel.obterEstatisticas error', error);
      throw error;
    }
  }
};

export default HorarioModel;
