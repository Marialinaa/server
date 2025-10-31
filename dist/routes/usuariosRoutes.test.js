"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Rota de teste simples
router.get('/test', (_req, res) => {
    res.json({
        success: true,
        message: 'Rota de usuários funcionando',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=usuariosRoutes.test.js.map