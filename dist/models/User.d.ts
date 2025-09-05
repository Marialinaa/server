export interface User {
    id?: number;
    nome_completo?: string;
    email?: string;
    login?: string;
    senha_hash?: string;
    tipo_usuario?: string;
    status?: string;
}
interface UserPayload {
    nome_completo?: string;
    email?: string;
    login?: string;
    senha_hash?: string;
    tipo_usuario?: string;
    status?: string;
}
declare const UserModel: {
    list(filters?: Record<string, any>): Promise<any>;
    getById(id: number): Promise<any>;
    getByEmail(email: string): Promise<any>;
    create(data: UserPayload): Promise<{
        nome_completo?: string;
        email?: string;
        login?: string;
        senha_hash?: string;
        tipo_usuario?: string;
        status?: string;
        id: any;
    }>;
    validatePassword(user: any, plainPassword: string): Promise<any>;
    updateStatus(userId: number, status: string): Promise<boolean>;
};
export default UserModel;
//# sourceMappingURL=User.d.ts.map