const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota POST /api/upload
// O middleware 'upload.single('file')' processa o arquivo e joga no Cloudinary antes da função rodar
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  // O Cloudinary devolve o link seguro em req.file.path
  res.json({ url: req.file.path });
});

module.exports = router;