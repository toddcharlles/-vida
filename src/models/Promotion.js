const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Tipo de promoção
  type: {
    type: DataTypes.ENUM(
      'discount_percent',     // % de desconto
      'discount_fixed',       // valor fixo
      'buy_x_get_y',          // leve X pague Y
      'free_delivery',        // frete grátis
      'loyalty_points',       // pontos extras
      'bundle',               // combo
      'first_order',          // primeira compra
      'reactivation',         // reativação
      'birthday',             // aniversário
      'category_discount',    // desconto por categoria
      'brand_discount',       // desconto por marca
      'personalized'          // personalizada por perfil
    ),
    allowNull: false,
  },
  // Título e descrição
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Valor do desconto
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Condições
  minOrderValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // Aplicabilidade
  applicableCategories: {
    type: DataTypes.JSON, // array de categoryIds
    defaultValue: [],
  },
  applicableProducts: {
    type: DataTypes.JSON, // array de productIds
    defaultValue: [],
  },
  applicableBrands: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // Targeting (perfil)
  targetTiers: {
    type: DataTypes.JSON, // ['bronze', 'silver', 'gold', 'platinum']
    defaultValue: ['bronze', 'silver', 'gold', 'platinum'],
  },
  targetFrequency: {
    type: DataTypes.JSON, // ['new', 'weekly', 'biweekly', 'monthly', 'occasional']
    defaultValue: [],
  },
  targetMinOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  targetMinSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  // Validade
  startsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Limites
  maxUsesTotal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  maxUsesPerUser: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  currentUses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Código de cupom
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  // Auto-aplicar baseado em perfil
  autoApply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Prioridade (maior = mais prioritário)
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = Promotion;