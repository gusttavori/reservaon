const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("🔴 AuthMiddleware: Cabeçalho Authorization ausente.");
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'secret';
    // console.log("🟡 AuthMiddleware: Validando token com secret...", secret ? "Definido" : "Padrão");
    
    const decoded = jwt.verify(token, secret);

    // Mapeamento explícito para garantir que o controller encontre
    req.userId = decoded.userId;
    req.companyId = decoded.companyId;
    req.user = decoded; // Backup

    console.log(`🟢 AuthMiddleware: Sucesso! Usuário: ${decoded.userId}`);
    return next();

  } catch (error) {
    console.error("🔴 AuthMiddleware: Erro ao validar token:", error.message);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};