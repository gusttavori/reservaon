const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/companies', publicController.getCompanies);
router.get('/:slug', publicController.getCompanyBySlug);

module.exports = router;