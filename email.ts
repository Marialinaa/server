// Re-export das funções de email que estão em server/config/email.ts
export * from './config/email';

// Adicionar aliases/named-exports que o código mais antigo espera
import templates from './config/emailTemplates';
import { createTransporter } from './config/email';

type SendEmailArgs =
	| [to: string, subject: string, html: string]
	| [{ to?: string; email?: string; subject?: string; html?: string; text?: string }];

export const sendEmail = async (...args: SendEmailArgs) => {
	let to: string | undefined;
	let subject: string | undefined;
	let html: string | undefined;

	if (args.length === 1 && typeof args[0] === 'object') {
		const obj = args[0] as { to?: string; email?: string; subject?: string; html?: string; text?: string };
		to = obj.to || obj.email;
		subject = obj.subject;
		html = obj.html || obj.text;
	} else {
		[to, subject, html] = args as [string, string, string];
	}

	if (!to || !subject) return { success: false, error: 'destinatário ou assunto ausente' };

	try {
		const transporter = createTransporter();
		await transporter.sendMail({
			from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
			to,
			subject,
			html,
		});
		return { success: true };
	} catch (err: any) {
		console.error('Erro enviando email:', err);
		return { success: false, error: err?.message || String(err) };
	}
};

export const notificarAdminNovoUsuario = async (params: { [key: string]: any; nome?: string; tipo_usuario?: string; email?: string; login?: string }) => {
	const { nome, tipo_usuario } = params;
	const html = templates.solicitacaoAcesso(nome || '', tipo_usuario || '');
	const adminEmail = process.env.ADMIN_EMAIL;
	if (!adminEmail) return { success: false, error: 'ADMIN_EMAIL não configurado' };
	return sendEmail(adminEmail, 'Nova solicitação de acesso', html);
};

export const notificarUsuarioAprovado = async (params: { [key: string]: any; to?: string; email?: string; nome?: string; tipo_usuario?: string }) => {
	const { to, email, nome, tipo_usuario } = params;
	const dest = to || email;
	if (!dest) return { success: false, error: 'email destinatário ausente' };
	const html = templates.aprovacaoAcesso(nome || '', tipo_usuario || '');
	return sendEmail({ to: dest, subject: 'Solicitação aprovada', html });
};

export const notificarUsuarioRejeitado = async (params: { [key: string]: any; to?: string; email?: string; nome?: string }) => {
	const { to, email, nome } = params;
	const dest = to || email;
	if (!dest) return { success: false, error: 'email destinatário ausente' };
	const html = templates.rejeicaoAcesso(nome || '');
	return sendEmail({ to: dest, subject: 'Solicitação não aprovada', html });
};
