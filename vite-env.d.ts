// Declarações para permitir o uso de import.meta.env no código TypeScript do servidor
// Define apenas as variáveis necessárias pelo projeto. Marque como opcionais para
// evitar erros caso não estejam definidas em todos os ambientes.
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_PROD?: string;
    readonly VITE_API_EMULATOR?: string;
    readonly VITE_API_LOCAL?: string;
    readonly VITE_API_URL?: string;
    // adicione outras VITE_* necessárias aqui
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
