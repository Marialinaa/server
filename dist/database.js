"use strict";
// ============================================
// RE-EXPORTS PARA COMPATIBILIDADE
// ============================================
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.closePool = exports.checkHealth = exports.getPool = exports.pool = exports.DatabaseConnection = void 0;
// Re-export do sistema novo (utils/db.ts) - PREFERENCIAL
var db_1 = require("./utils/db");
Object.defineProperty(exports, "DatabaseConnection", { enumerable: true, get: function () { return __importDefault(db_1).default; } });
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return db_1.pool; } });
Object.defineProperty(exports, "getPool", { enumerable: true, get: function () { return db_1.getPool; } });
Object.defineProperty(exports, "checkHealth", { enumerable: true, get: function () { return db_1.checkHealth; } });
Object.defineProperty(exports, "closePool", { enumerable: true, get: function () { return db_1.closePool; } });
// Re-export do sistema antigo (config/database.ts) - LEGADO
__exportStar(require("./config/database"), exports);
var database_1 = require("./config/database");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return database_1.dbConfig; } });
// Default export aponta para o sistema novo
const db_2 = __importDefault(require("./utils/db"));
exports.default = db_2.default;
// NOTA: Código novo deve usar:
// import DatabaseConnection from '../database';
// const pool = await DatabaseConnection.getInstance();
