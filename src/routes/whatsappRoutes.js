const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const multer = require('multer');

// Multer para receber arquivo de imagem
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens'), false);
    }
  },
});

// Webhook principal - aceita multipart (arquivo) ou JSON (base64)
router.post('/image', upload.single('image'), whatsappController.receiveImage);

// Teste simples via JSON
router.post('/test', whatsappController.testImage);

// Status
router.get('/status', whatsappController.status);

module.exports = router;