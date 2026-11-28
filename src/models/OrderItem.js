const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Snapshot do produto no momento da compra
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productBrand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productBarcode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unit: {
    type: DataTypes.ENUM('KG', 'G', 'L', 'ML', 'UN', 'PACK', 'BOX', 'BUNCH'),
    defaultValue: 'UN',
  },
  isWeighed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Quantidade
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 1,
  },
  // Para produtos pesáveis: quantidade estimada vs real
  estimatedQuantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
  },
  actualQuantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
  },
  // Preços
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pricePerKg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Desconto aplicado
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  // Categoria para profiling
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Substituição (se produto pesável não disponível)
  substituted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  substitutionNotes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Metadados
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = OrderItem;