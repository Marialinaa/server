"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuariosController_1 = __importDefault(require("../controllers/usuariosController"));
const router = express_1.default.Router();
// Listar usuários com filtros opcionais
router.get('/', usuariosController_1.default.listarUsuarios);
// Obter usuário específico pelo ID
router.get('/:id', usuariosController_1.default.getUsuario);
// Atualizar usuário (status, etc.)
router.put('/:id', usuariosController_1.default.atualizarUsuario);
// Criar um novo responsável
router.post('/responsavel', usuariosController_1.default.criarResponsavel);
// Criar um novo bolsista
router.post('/bolsista', usuariosController_1.default.criarBolsista);
// Listar solicitações pendentes
router.get('/solicitacoes/pendentes', usuariosController_1.default.listarSolicitacoes);
exports.default = router;
