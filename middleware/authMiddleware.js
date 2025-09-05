// Este arquivo está vazio, precisaria ser implementado com a lógica de autenticação
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verificar se o token é válido
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;
