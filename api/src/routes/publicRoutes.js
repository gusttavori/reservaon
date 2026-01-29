const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// 1. Listagem de empresas
router.get('/companies', publicController.getCompanies);

// 2. Criação de Agendamento (Essa é a rota que estava dando 404)
router.post('/appointments', publicController.createAppointment);

// 3. Detalhes da empresa (Slug) - IMPORTANTE: Deve ficar por último!
router.get('/:slug', publicController.getCompanyBySlug);

module.exports = router;