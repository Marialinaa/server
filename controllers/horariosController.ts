import { Request, Response } from 'express';
import HorarioModel, { Horario } from '../models/Horario';

export const registrarEntrada = async (req: Request, res: Response) => {
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
    
    const horario: Horario = {
      bolsista_id: Number(bolsista_id),
      data_registro: dataHoje,
      hora_entrada: horaAtual,
      nome_atividade: nome_atividade || 'Atividade do dia'
    };
    
    // Registrar entrada
    const novoHorario = await HorarioModel.registrarEntrada(horario);
    
    console.log('✅ Entrada registrada com sucesso:', novoHorario);
    return res.status(201).json({
      success: true,
      message: 'Entrada registrada com sucesso',
      data: novoHorario
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

export const registrarSaida = async (req: Request, res: Response) => {
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
    const horarioAtualizado = await HorarioModel.registrarSaida(
      Number(bolsista_id), 
      dataHoje, 
      horaAtual,
      observacoes
    );
    
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
  } catch (error: any) {
    console.error('❌ Erro ao registrar saída:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar saída',
      error: error.message
    });
  }
};

export const listarHorarios = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Listando horários:', req.query);
    
    const bolsista_id = Number(req.query.bolsista_id);
    const data_inicio = req.query.data_inicio as string | undefined;
    const data_fim = req.query.data_fim as string | undefined;
    
    if (!bolsista_id) {
      console.log('❌ ID do bolsista não fornecido');
      return res.status(400).json({ 
        success: false, 
        message: 'ID do bolsista é obrigatório' 
      });
    }
    
    const horarios = await HorarioModel.listarPorBolsista(bolsista_id, data_inicio, data_fim);
    
    console.log(`✅ ${horarios.length} horários encontrados`);
    return res.json({
      success: true,
      message: 'Horários listados com sucesso',
      data: horarios
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar horários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar horários',
      error: error.message
    });
  }
};

export const buscarHorarioHoje = async (req: Request, res: Response) => {
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
    
    const horarioHoje = await HorarioModel.buscarHorarioHoje(bolsista_id);
    
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
  } catch (error: any) {
    console.error('❌ Erro ao buscar horário de hoje:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar horário de hoje',
      error: error.message
    });
  }
};

export const obterEstatisticas = async (req: Request, res: Response) => {
  try {
    console.log('📊 Obtendo estatísticas:', req.query);
    
    const bolsista_id = Number(req.query.bolsista_id);
    const data_inicio = req.query.data_inicio as string | undefined;
    const data_fim = req.query.data_fim as string | undefined;
    
    if (!bolsista_id) {
      console.log('❌ ID do bolsista não fornecido');
      return res.status(400).json({ 
        success: false, 
        message: 'ID do bolsista é obrigatório' 
      });
    }
    
    const estatisticas = await HorarioModel.obterEstatisticas(bolsista_id, data_inicio, data_fim);
    
    console.log(`✅ ${estatisticas.length} registros estatísticos processados`);
    return res.json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: estatisticas
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
};

export default {
  registrarEntrada,
  registrarSaida,
  listarHorarios,
  buscarHorarioHoje,
  obterEstatisticas
};
