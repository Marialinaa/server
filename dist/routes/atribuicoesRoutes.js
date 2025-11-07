"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const atribuicoesController_1 = __importDefault(require("../controllers/atribuicoesController"));
const router = express_1.default.Router();
// Criar uma nova atribuição
router.post('/', atribuicoesController_1.default.criarAtribuicao);
// Listar atribuições com filtros opcionais
router.get('/', atribuicoesController_1.default.listarAtribuicoes);
// Obter atribuição específica pelo ID
router.get('/:id', atribuicoesController_1.default.getAtribuicao);
exports.default = router;
