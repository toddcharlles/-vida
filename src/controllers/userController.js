const { User, Order, OrderItem, Product, Category, Promotion, PromotionUsage } = require('../models');
const { Op } = require('sequelize');
const { generateToken } = require('../middleware/auth');

// ===== PERFIL =====
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const allowedFields = [
      'name', 'phone', 'birthDate', 'gender',
      'defaultAddress', 'preferences',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Merge preferences
    if (req.body.preferences) {
      updateData.preferences = {
        ...user.preferences,
        ...req.body.preferences,
      };
    }

    await user.update(updateData);

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });
    res.json({ user: updated });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    const user = await User.findByPk(req.userId);
    const valid = await user.validatePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    await user.update({ password: newPassword });
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ENDEREÇOS =====
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    res.json({ addresses: user.defaultAddress?.addresses || [] });
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const addresses = user.defaultAddress?.addresses || [];
    const newAddress = {
      id: require('crypto').randomUUID(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    addresses.push(newAddress);
    await user.update({ defaultAddress: { ...user.defaultAddress, addresses } });
    res.status(201).json({ address: newAddress });
  } catch (error) {
    console.error('Erro ao adicionar endereço:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const addresses = user.defaultAddress?.addresses || [];
    const index = addresses.findIndex(a => a.id === req.params.addressId);
    if (index === -1) {
      return res.status(404).json({ error: 'Endereço não encontrado' });
    }
    addresses[index] = { ...addresses[index], ...req.body, updatedAt: new Date().toISOString() };
    await user.update({ defaultAddress: { ...user.defaultAddress, addresses } });
    res.json({ address: addresses[index] });
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const addresses = (user.defaultAddress?.addresses || []).filter(a => a.id !== req.params.addressId);
    await user.update({ defaultAddress: { ...user.defaultAddress, addresses } });
    res.json({ message: 'Endereço removido' });
  } catch (error) {
    console.error('Erro ao remover endereço:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const addresses = user.defaultAddress?.addresses || [];
    addresses.forEach(a => a.isDefault = a.id === req.params.addressId);
    await user.update({ defaultAddress: { ...user.defaultAddress, addresses } });
    res.json({ message: 'Endereço padrão atualizado' });
  } catch (error) {
    console.error('Erro ao definir endereço padrão:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== HISTÓRICO DE PEDIDOS =====
exports.getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { userId: req.userId };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
      orders: rows,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== REORDEN (comprar novamente) =====
exports.reorder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Criar novo carrinho com os itens
    const cartItems = [];
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product && product.available) {
        cartItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.isWeighed ? product.pricePerKg : product.price,
          pricePerKg: product.pricePerKg,
        });
      }
    }

    res.json({ cartItems, message: `${cartItems.length} itens adicionados ao carrinho` });
  } catch (error) {
    console.error('Erro no reorden:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== PERFIL DE CONSUMO =====
exports.getConsumptionProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['consumptionProfile', 'loyaltyPoints', 'loyaltyTier'],
    });
    res.json({
      profile: user.consumptionProfile,
      loyalty: { points: user.loyaltyPoints, tier: user.loyaltyTier },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil de consumo:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== PROMOÇÕES PERSONALIZADAS =====
exports.getPersonalizedPromotions = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const profile = user.consumptionProfile || {};

    const where = {
      active: true,
      [Op.or]: [
        { startsAt: null },
        { startsAt: { [Op.lte]: new Date() } },
      ],
      [Op.or]: [
        { endsAt: null },
        { endsAt: { [Op.gte]: new Date() } },
      ],
    };

    // Buscar todas as promoções ativas e filtrar por tier em JS (SQLite não suporta JSON contains)
    const promotions = await Promotion.findAll({
      where,
      order: [['priority', 'DESC'], ['endsAt', 'ASC']],
      limit: 50,
    });

    // Filtrar por tier do usuário
    const userTier = user.loyaltyTier || 'bronze';
    const tierPromotions = promotions.filter(p =>
      p.targetTiers && p.targetTiers.includes(userTier)
    );

    // Filtrar já usadas
    const usedPromotionIds = await PromotionUsage.findAll({
      where: { userId: req.userId },
      attributes: ['promotionId'],
    });
    const usedIds = new Set(usedPromotionIds.map(u => u.promotionId));

    const available = tierPromotions
      .filter(p => !usedIds.has(p.id) || p.maxUsesPerUser > 1)
      .map(p => ({
        ...p.toJSON(),
        canUse: !usedIds.has(p.id),
      }));

    res.json({ promotions: available });
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.applyPromotion = async (req, res) => {
  try {
    const { code, orderId } = req.body;
    const promotion = await Promotion.findOne({
      where: { code: code.toUpperCase(), active: true },
    });
    if (!promotion) {
      return res.status(404).json({ error: 'Cupom inválido' });
    }

    // Verificar validade
    const now = new Date();
    if (promotion.startsAt && promotion.startsAt > now) {
      return res.status(400).json({ error: 'Cupom ainda não válido' });
    }
    if (promotion.endsAt && promotion.endsAt < now) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }
    if (promotion.maxUsesTotal && promotion.currentUses >= promotion.maxUsesTotal) {
      return res.status(400).json({ error: 'Cupom esgotado' });
    }

    // Verificar uso por usuário
    const userUsage = await PromotionUsage.count({
      where: { promotionId: promotion.id, userId: req.userId },
    });
    if (userUsage >= promotion.maxUsesPerUser) {
      return res.status(400).json({ error: 'Você já usou este cupom' });
    }

    // Verificar target
    const user = await User.findByPk(req.userId);
    if (!promotion.targetTiers.includes(user.loyaltyTier)) {
      return res.status(400).json({ error: 'Cupom não disponível para seu perfil' });
    }

    // TODO: Aplicar ao pedido
    res.json({
      success: true,
      promotion: {
        id: promotion.id,
        type: promotion.type,
        value: promotion.value,
        title: promotion.title,
      },
    });
  } catch (error) {
    console.error('Erro ao aplicar cupom:', error);
    res.status(500).json({ error: error.message });
  }
};