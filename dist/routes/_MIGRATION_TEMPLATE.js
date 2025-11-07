"use strict";
// ============================================
// TEMPLATE PARA MIGRAÇÃO DE ROTAS
// server/routes/[nome].ts
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exemploFuncao = void 0;
const database_1 = __importDefault(require("../database"));
// ============================================
// HELPER: Tratamento centralizado de erros
// ============================================
function handleDatabaseError(error, res) {
    if (error.message && error.message.includes('pool not initialized')) {
        return res.status(503).json({
            success: false,
            message: 'Serviço temporariamente indisponível'
        });
    }
    console.error('Database error:', error);
    return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
}
// ============================================
// EXEMPLO DE FUNÇÃO MIGRADA
// ============================================
const exemploFuncao = async (_req, res) => {
    try {
        // ✅ Obter pool de forma segura
        const pool = await database_1.default.getInstance();
        // Suas queries aqui
        const [rows] = await pool.execute('SELECT * FROM tabela');
        return res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error("❌ Erro:", error);
        return handleDatabaseError(error, res);
    }
};
exports.exemploFuncao = exemploFuncao;
// ============================================
// PADRÃO DE MIGRAÇÃO
// ============================================
/*

ANTES:
------
import { pool } from '../database';

export const minhaFuncao = async (req, res) => {
  try {
    const [rows] = await pool.execute(query);  // ❌ Error
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};


DEPOIS:
-------
import DatabaseConnection from '../database';

// Helper de erro (copiar uma vez no topo do arquivo)
function handleDatabaseError(error: any, res: Response) {
  if (error.message?.includes('pool not initialized')) {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível'
    });
  }
  return res.status(500).json({ error: 'Erro interno' });
}

export const minhaFuncao = async (req, res) => {
  try {
    const pool = await DatabaseConnection.getInstance();  // ✅ Seguro
    const [rows] = await pool.execute(query);
    return res.json(rows);  // ✅ Adicionar return
  } catch (error) {
    return handleDatabaseError(error, res);  // ✅ Usar handler
  }
};

*/
//# sourceMappingURL=_MIGRATION_TEMPLATE.js.map