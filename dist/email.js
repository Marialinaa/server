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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificarUsuarioRejeitado = exports.notificarUsuarioAprovado = exports.notificarAdminNovoUsuario = exports.sendEmail = void 0;
// Re-export das funções de email que estão em server/config/email.ts
__exportStar(require("./config/email"), exports);
// Adicionar aliases/named-exports que o código mais antigo espera
const emailTemplates_1 = __importDefault(require("./config/emailTemplates"));
const email_1 = require("./config/email");
const sendEmail = async (...args) => {
    let to;
    let subject;
    let html;
    if (args.length === 1 && typeof args[0] === 'object') {
        const obj = args[0];
        to = obj.to || obj.email;
        subject = obj.subject;
        html = obj.html || obj.text;
    }
    else {
        [to, subject, html] = args;
    }
    if (!to || !subject)
        return { success: false, error: 'destinatário ou assunto ausente' };
    try {
        const transporter = (0, email_1.createTransporter)();
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        return { success: true };
    }
    catch (err) {
        console.error('Erro enviando email:', err);
        return { success: false, error: err?.message || String(err) };
    }
};
exports.sendEmail = sendEmail;
const notificarAdminNovoUsuario = async (params) => {
    const { nome, tipo_usuario } = params;
    const html = emailTemplates_1.default.solicitacaoAcesso(nome || '', tipo_usuario || '');
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail)
        return { success: false, error: 'ADMIN_EMAIL não configurado' };
    return (0, exports.sendEmail)(adminEmail, 'Nova solicitação de acesso', html);
};
exports.notificarAdminNovoUsuario = notificarAdminNovoUsuario;
const notificarUsuarioAprovado = async (params) => {
    const { to, email, nome, tipo_usuario } = params;
    const dest = to || email;
    if (!dest)
        return { success: false, error: 'email destinatário ausente' };
    const html = emailTemplates_1.default.aprovacaoAcesso(nome || '', tipo_usuario || '');
    return (0, exports.sendEmail)({ to: dest, subject: 'Solicitação aprovada', html });
};
exports.notificarUsuarioAprovado = notificarUsuarioAprovado;
const notificarUsuarioRejeitado = async (params) => {
    const { to, email, nome } = params;
    const dest = to || email;
    if (!dest)
        return { success: false, error: 'email destinatário ausente' };
    const html = emailTemplates_1.default.rejeicaoAcesso(nome || '');
    return (0, exports.sendEmail)({ to: dest, subject: 'Solicitação não aprovada', html });
};
exports.notificarUsuarioRejeitado = notificarUsuarioRejeitado;
//# sourceMappingURL=email.js.map