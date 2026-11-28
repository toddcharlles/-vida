const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Todas as rotas requerem autenticação
router.use(auth);

// Perfil
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

// Endereços
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);
router.put('/addresses/:addressId/default', userController.setDefaultAddress);

// Histórico de pedidos
router.get('/orders', userController.getOrderHistory);
router.get('/orders/:id', userController.getOrderDetail);
router.post('/orders/:id/reorder', userController.reorder);

// Perfil de consumo
router.get('/consumption-profile', userController.getConsumptionProfile);

// Promoções personalizadas
router.get('/promotions', userController.getPersonalizedPromotions);
router.post('/promotions/apply', userController.applyPromotion);

module.exports = router;