const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const promotionController = require('../controllers/promotionController');

// Admin routes
router.post('/', auth, isAdmin, promotionController.create);
router.get('/', auth, isAdmin, promotionController.getAll);
router.get('/stats', auth, isAdmin, promotionController.getStats);
router.get('/:id', auth, isAdmin, promotionController.getById);
router.put('/:id', auth, isAdmin, promotionController.update);
router.delete('/:id', auth, isAdmin, promotionController.delete);
router.patch('/:id/toggle', auth, isAdmin, promotionController.toggleActive);
router.post('/generate-auto', auth, isAdmin, promotionController.generateAutoPromotions);

// Cliente: aplicar cupom
router.post('/apply', auth, promotionController.applyPromotion);

module.exports = router;