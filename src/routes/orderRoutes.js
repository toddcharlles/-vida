const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Rotas admin/operador (DEVEM VIR ANTES das rotas genéricas)
router.get('/admin', auth, isAdmin, orderController.getAllOrders);
router.get('/admin/stats', auth, isAdmin, orderController.getStats);
router.get('/admin/:id', auth, isAdmin, orderController.getOrderDetail);
router.put('/admin/:id/status', auth, isAdmin, orderController.updateStatus);
router.put('/admin/:id/quantities', auth, isAdmin, orderController.updateActualQuantity);

// Rotas do cliente (autenticado)
router.use(auth);

// Criar pedido (checkout)
router.post('/', orderController.createOrder);

// Histórico do cliente
router.get('/my-orders', orderController.getOrderHistory);
router.get('/my-orders/:id', orderController.getOrderDetail);
router.post('/my-orders/:id/reorder', orderController.reorder);

module.exports = router;