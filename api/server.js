require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importação das Rotas
const authRoutes = require('./src/routes/authRoutes'); 
const serviceRoutes = require('./src/routes/serviceRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const companyRoutes = require('./src/routes/companyRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const waitingListRoutes = require('./src/routes/waitingListRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const logRoutes = require('./src/routes/logRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const webhookController = require('./src/controllers/webhookController');

const app = express();

app.use(cors({
  origin: [
    'https://reservaon.vercel.app',   // Seu Frontend em Produção
    'http://localhost:5173',          // Seu Frontend Local (Vite)
    'http://localhost:3000'           // Seu Backend Local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true // Permite cookies/sessões se necessário
}));

app.post('/api/webhook', express.raw({ type: 'application/json' }), webhookController.handleWebhook);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: "API Online 🚀", 
    message: "Bem-vindo ao Backend do ReservaON",
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});