const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas Públicas
router.post('/public', reviewController.createReview);
router.get('/public/:slug', reviewController.getPublicReviews);

// Rotas Privadas (Dashboard)
router.use(authMiddleware);
router.get('/', reviewController.getReviews);

module.exports = router;