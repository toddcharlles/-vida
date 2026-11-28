const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
}));

// Logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Models (associations already defined in models/index.js)
const { Category, Product, User, Order, OrderItem, Promotion, PromotionUsage } = require('./models');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const promotionRoutes = require('./routes/promotionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/user', userRoutes);           // Perfil, endereços, histórico, promoções
app.use('/api/orders', orderRoutes);        // Pedidos (cliente + admin)
app.use('/api/promotions', promotionRoutes); // Promoções (admin + aplicar cupom)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CEASA Copacabana API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'sqlite',
    groq: process.env.GROQ_API_KEY ? 'configured' : 'missing',
  });
});

// Debug endpoints
app.get('/api/debug/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({
      total: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        price: p.price,
        pricePerKg: p.pricePerKg,
        unit: p.unit,
        isWeighed: p.isWeighed,
        category: p.category?.name,
        lastUpdateSource: p.lastUpdateSource,
        lastWhatsAppUpdate: p.lastWhatsAppUpdate,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json({ total: orders.length, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404
app.use((req, res) => {
  console.log(`⚠️ 404: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;