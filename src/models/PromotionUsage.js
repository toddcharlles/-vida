const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromotionUsage = sequelize.define('PromotionUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  promotionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  discountApplied: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = PromotionUsage;