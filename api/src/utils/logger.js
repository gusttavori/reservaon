const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Registra uma ação no banco de dados.
 * @param {string} companyId - ID da empresa
 * @param {string} userId - ID do usuário que fez a ação (opcional)
 * @param {string} action - Código da ação (EX: DELETE_SERVICE)
 * @param {string} details - Descrição legível
 */
exports.logAction = async (companyId, userId, action, details) => {
  try {
    // Verifica se a empresa existe antes de logar para evitar erro de chave estrangeira
    if (!companyId) return;

    await prisma.activityLog.create({
      data: {
        companyId,
        userId: userId || null, // Pode ser nulo se for ação do sistema
        action,
        details
      }
    });
  } catch (error) {
    // Log silencioso no console para não travar a requisição principal
    console.error("Erro ao registrar log de atividade:", error);
  }
};