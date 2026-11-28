const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Promotion = require('./Promotion');
const PromotionUsage = require('./PromotionUsage');

// Associações existentes
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// User associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Promotion associations
Promotion.hasMany(PromotionUsage, { foreignKey: 'promotionId', as: 'usages' });
PromotionUsage.belongsTo(Promotion, { foreignKey: 'promotionId', as: 'promotion' });

User.hasMany(PromotionUsage, { foreignKey: 'userId', as: 'promotionUsages' });
PromotionUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(PromotionUsage, { foreignKey: 'orderId', as: 'promotionUsages' });
PromotionUsage.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  Category,
  Product,
  User,
  Order,
  OrderItem,
  Promotion,
  PromotionUsage,
};