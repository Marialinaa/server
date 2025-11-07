"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const router = express_1.default.Router();
// Rota de registro de usuário
router.post('/register', auth_1.handleRegister);
// Rota de login
router.post('/login', auth_1.handleLogin);
// Rota para aprovação de usuário (protegida por middleware no arquivo principal)
router.post('/approve', (_req, res) => {
    res.status(501).json({ success: false, message: 'Função ainda não implementada' });
});
// Rota para rejeição de usuário (protegida por middleware no arquivo principal)
router.post('/reject', (_req, res) => {
    res.status(501).json({ success: false, message: 'Função ainda não implementada' });
});
exports.default = router;
