const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password, companyName, planSlug } = req.body;

  try {
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug || 'basico' }
    });

    if (!plan) return res.status(400).json({ error: "Plano inválido." });

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já cadastrado." });

    const existingSlug = await prisma.company.findUnique({ 
      where: { slug: companyName.toLowerCase().replace(/\s+/g, '-') } 
    });
    
    let finalSlug = companyName.toLowerCase().replace(/\s+/g, '-');
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: finalSlug,
          planId: plan.id,
          subscriptionStatus: 'ACTIVE'
        }
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
          companyId: company.id
        }
      });

      return { user, company };
    });

    try {
      await emailService.sendWelcomeEmail(result.user.email, result.user.name);
    } catch (emailError) {
      console.error("Erro ao enviar email de boas-vindas:", emailError);
    }

    return res.status(201).json({ 
      message: "Conta criada com sucesso!", 
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        company: result.company.name,
        slug: result.company.slug,
        planSlug: plan.slug
      }
    });

  } catch (error) {
    console.error("Erro no registro:", error);
    return res.status(500).json({ error: "Erro interno ao criar conta." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        company: {
          include: { plan: true }
        } 
      }
    });

    if (!user) return res.status(401).json({ error: "E-mail ou senha inválidos." });

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) return res.status(401).json({ error: "E-mail ou senha inválidos." });

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const refreshTokenString = crypto.randomUUID();
    
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresIn: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      }
    });

    return res.json({ 
      token, 
      refreshToken: refreshTokenString,
      user: { 
        id: user.id,
        name: user.name, 
        email: user.email,
        company: user.company.name,
        slug: user.company.slug,
        role: user.role,
        subscriptionStatus: user.company.subscriptionStatus,
        planSlug: user.company.plan.slug
      } 
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no login." });
  }
};

exports.createProfessional = async (req, res) => {
  const { name, email, password } = req.body;
  const companyId = req.user.companyId;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já cadastrado." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PROFESSIONAL',
        companyId
      }
    });

    res.status(201).json({ message: "Profissional adicionado com sucesso!", user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao criar profissional." });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ message: "Se o e-mail existir, você receberá um link." });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: now
      }
    });

    await emailService.sendPasswordResetEmail(email, token);

    return res.json({ message: "Se o e-mail existir, você receberá um link." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar solicitação." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: "Link inválido ou expirado." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    return res.json({ message: "Senha alterada com sucesso!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao redefinir senha." });
  }
};