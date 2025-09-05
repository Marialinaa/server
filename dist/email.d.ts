export * from './config/email';
export declare const sendEmail: (to: string, subject: string, html: string) => Promise<boolean>;
export declare const notificarAdminNovoUsuario: (nome: string, tipo_usuario: string) => Promise<boolean>;
export declare const notificarUsuarioAprovado: (to: string, nome: string, tipo_usuario: string) => Promise<boolean>;
export declare const notificarUsuarioRejeitado: (to: string, nome: string) => Promise<boolean>;
//# sourceMappingURL=email.d.ts.map