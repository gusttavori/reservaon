// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Pega o token do cabeçalho (Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  // Separa o "Bearer" do hash
  const [, token] = authHeader.split(' ');

  try {
    // 2. Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // 3. Coloca os dados do usuário dentro da requisição (req)
    // Assim, o controller lá na frente sabe quem está chamando
    req.user = {
      id: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role
    };

    return next(); // Pode passar, segurança aprovou!

  } catch (error) {
    return res.status(401).json({ error: "Token inválido." });
  }
};