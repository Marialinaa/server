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
exports.createTransporter = exports.verificarConfiguracao = void 0;
const nodemailer = __importStar(require("nodemailer"));
const verificarConfiguracao = async () => {
    try {
        console.log('📧 Verificando configuração de email...');
        // Verificar se as variáveis de ambiente estão configuradas
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️ Configurações de email não encontradas no .env');
            return false;
        }
        console.log('✅ Configuração de email verificada');
        return true;
    }
    catch (error) {
        console.error('❌ Erro na verificação de email:', error);
        return false;
    }
};
exports.verificarConfiguracao = verificarConfiguracao;
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        // Configurações para resolver timeout
        connectionTimeout: 30000, // 30 segundos
        greetingTimeout: 10000, // 10 segundos
        socketTimeout: 30000, // 30 segundos
        // Configurações adicionais para Gmail
        tls: {
            rejectUnauthorized: false
        }
    });
};
exports.createTransporter = createTransporter;
