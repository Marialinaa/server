"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registrosController_1 = __importDefault(require("../controllers/registrosController"));
const router = express_1.default.Router();
// Registrar entrada de bolsista
router.post('/entrada', registrosController_1.default.registrarEntrada);
// Registrar saída de bolsista
router.post('/saida', registrosController_1.default.registrarSaida);
// Listar registros de entrada/saída com filtros
router.get('/', registrosController_1.default.listarRegistros);
exports.default = router;
//# sourceMappingURL=registrosRoutes.js.map