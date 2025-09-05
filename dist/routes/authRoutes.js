"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const router = express_1.default.Router();
// Rota de registro de usuário
router.post('/register', authController_1.default.register);
// Rota de login
router.post('/login', authController_1.default.login);
// Rota para aprovação de usuário (protegida por middleware no arquivo principal)
router.post('/approve', authController_1.default.approveUser);
// Rota para rejeição de usuário (protegida por middleware no arquivo principal)
router.post('/reject', authController_1.default.rejectUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map