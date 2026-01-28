const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Nome do remetente (No futuro você configura seu dominio.com)
const FROM_EMAIL = 'ReservaON <onboarding@resend.dev>'; 

exports.sendWelcomeEmail = async (email, name) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo ao ReservaON! 🚀',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Olá, ${name}!</h1>
          <p>Estamos muito felizes em ter você conosco.</p>
          <p>Sua conta foi criada com sucesso e você já pode começar a configurar sua agenda.</p>
          <br>
          <a href="${process.env.FRONTEND_URL}/login" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Painel</a>
        </div>
      `
    });
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
  }
};

exports.sendBookingNotification = async (ownerEmail, clientName, serviceName, date) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `📅 Novo Agendamento: ${clientName}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Você tem um novo cliente!</h2>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Serviço:</strong> ${serviceName}</p>
          <p><strong>Data:</strong> ${new Date(date).toLocaleString('pt-BR')}</p>
          <br>
          <p>Acesse seu painel para ver mais detalhes.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de agendamento:', error);
  }
};

exports.sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'ReservaON <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperação de Senha 🔒',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Esqueceu sua senha?</h2>
          <p>Não se preocupe, acontece com todo mundo.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <br>
          <a href="${resetLink}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
          <br><br>
          <p style="font-size: 0.9rem; color: #666;">Este link expira em 1 hora.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erro ao enviar email de reset:', error);
  }
};