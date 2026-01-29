const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Pega o token do cabeçalho
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  // Separa o "Bearer" do token
  const [, token] = authHeader.split(' ');

  try {
    // 2. Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // --- A CORREÇÃO MÁGICA ---
    // O Controller espera 'req.userId', então precisamos definir isso explicitamente.
    req.userId = decoded.userId;
    req.companyId = decoded.companyId; // Útil para facilitar acesso

    // Mantemos o req.user para compatibilidade com outros controllers
    req.user = {
      id: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role
    };

    return next();

  } catch (error) {
    return res.status(401).json({ error: "Token inválido." });
  }
};