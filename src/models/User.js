const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'operator', 'customer'),
    defaultValue: 'customer',
  },
  // WhatsApp number for receiving updates
  whatsappNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Perfil do cliente
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'O', 'P'),
    allowNull: true,
  },
  // Endereço padrão
  defaultAddress: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Preferências
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      notifications: { email: true, whatsapp: true, push: true },
      marketing: { email: true, whatsapp: true, sms: false },
      dietary: [], // ex: ['vegan', 'gluten-free', 'lactose-free']
      favoriteCategories: [],
    },
  },
  // Fidelidade
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  loyaltyTier: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
    defaultValue: 'bronze',
  },
  // Perfil de consumo (calculado)
  consumptionProfile: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      totalSpent: 0,
      orderCount: 0,
      avgOrderValue: 0,
      favoriteCategories: [],
      favoriteBrands: [],
      purchaseFrequency: 'new', // new, weekly, biweekly, monthly, occasional
      preferredTimes: [], // manhãs, tardes, noites, madrugadas
      preferredDays: [], // 0-6 (domingo-sábado)
      seasonality: {}, // mês -> gasto
      priceElasticity: 'medium', // low, medium, high
      basketSize: 'small', // small, medium, large
    },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  phoneVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;