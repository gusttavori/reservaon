const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// 1. Listagem de empresas (Catálogo)
router.get('/companies', publicController.getCompanies);

// 2. Criação de Agendamento Público
// Atenção: O nome da função no controller é createAppointmentPublic
router.post('/appointments', publicController.createAppointmentPublic);

// 3. Detalhes da empresa (Slug) - DEVE FICAR POR ÚLTIMO
router.get('/:slug', publicController.getCompanyBySlug);

module.exports = router;