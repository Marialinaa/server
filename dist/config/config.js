"use strict";
// Configurações do servidor
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL = void 0;
const getApiUrl = () => {
    const PROD_URL = process.env.VITE_API_PROD || process.env.API_PROD;
    const EMULATOR_URL = process.env.VITE_API_EMULATOR || process.env.API_EMULATOR;
    const LOCAL_URL = process.env.VITE_API_LOCAL || process.env.API_LOCAL || 'http://localhost:5173';
    if (process.env.NODE_ENV === 'production') {
        return PROD_URL || LOCAL_URL;
    }
    // Em servidor não faz sentido detectar navegador/emulador; escolher LOCAL por padrão em dev
    return LOCAL_URL;
};
exports.API_URL = getApiUrl();
const config = {
    server: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: Number(process.env.PORT) || 3000,
    },
    apiUrl: exports.API_URL,
};
exports.default = config;
//# sourceMappingURL=config.js.map