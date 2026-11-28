const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  // Preço de venda (para produtos por unidade)
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  // Preço promocional
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // Para produtos pesáveis: preço por kg
  pricePerKg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // Código de barras (EAN/GTIN)
  barcode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  // Unidade de venda: KG, G, L, ML, UN, PACK, BOX, BUNCH
  unit: {
    type: DataTypes.ENUM('KG', 'G', 'L', 'ML', 'UN', 'PACK', 'BOX', 'BUNCH'),
    defaultValue: 'UN',
  },
  // Se é produto pesável (preço final varia na balança)
  isWeighed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Grupo de fornecedor (para agrupar entregas)
  supplierGroup: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Departamento ID
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Marca
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Imagem (URL ou caminho local)
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Disponível para venda
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Destaque na home
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Origem da última atualização: 'whatsapp', 'manual', 'api'
  lastUpdateSource: {
    type: DataTypes.STRING,
    defaultValue: 'manual',
  },
  // Timestamp da última atualização via WhatsApp
  lastWhatsAppUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Metadados da última leitura OCR
  lastOcrData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = Product;