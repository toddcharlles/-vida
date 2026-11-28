const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Status do pedido
  status: {
    type: DataTypes.ENUM(
      'cart',           // carrinho ativo
      'pending',        // aguardando pagamento
      'confirmed',      // confirmado
      'preparing',      // em separação
      'ready',          // pronto para entrega
      'delivering',     // em rota
      'delivered',      // entregue
      'cancelled',      // cancelado
      'returned'        // devolvido
    ),
    defaultValue: 'cart',
  },
  // Endereço de entrega (snapshot)
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  // Janela de entrega
  deliveryWindow: {
    type: DataTypes.JSON,
    allowNull: true, // { start: '14:00', end: '16:00', date: '2024-01-15' }
  },
  // Valores
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  // Pagamento
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'pix', 'boleto', 'cash', 'mercadopago'),
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partial'),
    defaultValue: 'pending',
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true, // ID do MercadoPago/outro gateway
  },
  // Observações
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Datas importantes
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Metadados
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = Order;