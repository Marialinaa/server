import { Request, Response } from 'express';

// Registrar entrada de bolsista
const registrarEntrada = async (req: Request, res: Response) => {
  try {
    const { usuario_id } = req.body;
    
    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }
    
    const pool = await (await import('../utils/db')).default.getInstance();
    
    // Verificar se usuário existe e é bolsista
    const [usuarios]: any = await pool.execute(
      'SELECT id, nome_completo, tipo_usuario FROM usuarios WHERE id = ? AND tipo_usuario = "bolsista"',
      [usuario_id]
    );
    
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bolsista não encontrado'
      });
    }
    
    // Verificar se já há entrada sem saída hoje
    const hoje = new Date().toISOString().split('T')[0];
    const [entradaAberta]: any = await pool.execute(
      'SELECT id FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? AND hora_saida IS NULL',
      [usuario_id, hoje]
    );
    
    if (entradaAberta && entradaAberta.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma entrada em aberto para hoje. Registre a saída primeiro.'
      });
    }
    
    // Registrar entrada
    const agora = new Date();
    const horaAtual = agora.toTimeString().split(' ')[0];
    
    const [result]: any = await pool.execute(
      `INSERT INTO registros_entrada (usuario_id, data_entrada, hora_entrada) 
       VALUES (?, ?, ?)`,
      [usuario_id, hoje, horaAtual]
    );
    
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
    
  } catch (error: any) {
    console.error('❌ Erro ao registrar entrada:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar entrada',
      error: error.message
    });
  }
};

// Registrar saída de bolsista
const registrarSaida = async (req: Request, res: Response) => {
  try {
    const { usuario_id } = req.body;
    
    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }
    
    const pool = await (await import('../utils/db')).default.getInstance();
    
    // Buscar entrada em aberto para hoje
    const hoje = new Date().toISOString().split('T')[0];
    const [entradaAberta]: any = await pool.execute(
      'SELECT id, hora_entrada FROM registros_entrada WHERE usuario_id = ? AND data_entrada = ? AND hora_saida IS NULL',
      [usuario_id, hoje]
    );
    
    if (!entradaAberta || entradaAberta.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma entrada em aberto encontrada para hoje'
      });
    }
    
    // Registrar saída
    const agora = new Date();
    const horaAtual = agora.toTimeString().split(' ')[0];
    
    await pool.execute(
      'UPDATE registros_entrada SET hora_saida = ? WHERE id = ?',
      [horaAtual, entradaAberta[0].id]
    );
    
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
    
  } catch (error: any) {
    console.error('❌ Erro ao registrar saída:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar saída',
      error: error.message
    });
  }
};

// Listar registros de entrada/saída
const listarRegistros = async (req: Request, res: Response) => {
  try {
    const { usuario_id, data_inicio, data_fim } = req.query;
    
    const pool = await (await import('../utils/db')).default.getInstance();
    
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
    
    const params: any[] = [];
    
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
    
    const [registros]: any = await pool.execute(query, params);
    
    return res.json({
      success: true,
      data: registros,
      total: registros.length
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao listar registros:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar registros',
      error: error.message
    });
  }
};

export default {
  registrarEntrada,
  registrarSaida,
  listarRegistros
};