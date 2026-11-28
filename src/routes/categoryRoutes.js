const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', auth, isAdmin, categoryController.create);
router.put('/:id', auth, isAdmin, categoryController.update);
router.delete('/:id', auth, isAdmin, categoryController.delete);

module.exports = router;