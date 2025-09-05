export * from './config/email';
type SendEmailArgs = [to: string, subject: string, html: string] | [{
    to?: string;
    email?: string;
    subject?: string;
    html?: string;
    text?: string;
}];
export declare const sendEmail: (...args: SendEmailArgs) => Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
export declare const notificarAdminNovoUsuario: (params: {
    [key: string]: any;
    nome?: string;
    tipo_usuario?: string;
    email?: string;
    login?: string;
}) => Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
export declare const notificarUsuarioAprovado: (params: {
    [key: string]: any;
    to?: string;
    email?: string;
    nome?: string;
    tipo_usuario?: string;
}) => Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
export declare const notificarUsuarioRejeitado: (params: {
    [key: string]: any;
    to?: string;
    email?: string;
    nome?: string;
}) => Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
//# sourceMappingURL=email.d.ts.map