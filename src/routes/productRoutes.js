const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const productController = require('../controllers/productController');
const multer = require('multer');

// Configurar multer para upload de imagens (memória)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  },
});

// Rotas públicas
router.get('/', productController.getAll);
router.get('/category/:category', productController.getByCategory);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/:id', productController.getById);

// Rotas administrativas
router.post('/', auth, isAdmin, upload.single('image'), productController.create);
router.put('/:id', auth, isAdmin, upload.single('image'), productController.update);
router.delete('/:id', auth, isAdmin, productController.delete);
router.patch('/:id/toggle', auth, isAdmin, productController.toggleAvailability);
router.post('/bulk', auth, isAdmin, productController.bulkUpdate);

module.exports = router;