const { Order, OrderItem, Product, User, Promotion, PromotionUsage } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// ===== CRIAR PEDIDO (checkout) =====
exports.createOrder = async (req, res) => {
  try {
    const {
      items,                    // [{ productId, quantity, estimatedQuantity }]
      deliveryAddress,
      deliveryWindow,
      paymentMethod,
      notes,
      promotionCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Endereço de entrega obrigatório' });
    }

    // Calcular totais
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.available) {
        return res.status(400).json({ error: `Produto ${item.productId} indisponível` });
      }

      const quantity = parseFloat(item.quantity) || 1;
      const unitPrice = product.isWeighed ? product.pricePerKg : product.price;
      const pricePerKg = product.pricePerKg;
      const totalPrice = unitPrice * quantity;

      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productBrand: product.brand,
        productBarcode: product.barcode,
        unit: product.unit,
        isWeighed: product.isWeighed,
        quantity,
        estimatedQuantity: item.estimatedQuantity,
        unitPrice,
        pricePerKg,
        totalPrice,
        categoryId: product.categoryId,
        categoryName: product.category?.name,
      });
    }

    // Frete (simplificado)
    const deliveryFee = subtotal >= 100 ? 0 : 9.90;

    // Promoção
    let discount = 0;
    let promotion = null;
    if (promotionCode) {
      promotion = await Promotion.findOne({
        where: { code: promotionCode.toUpperCase(), active: true },
      });
      if (promotion) {
        const now = new Date();
        if (!promotion.startsAt || promotion.startsAt <= now) {
          if (!promotion.endsAt || promotion.endsAt >= now) {
            if (promotion.type === 'discount_percent') {
              discount = subtotal * (promotion.value / 100);
              if (promotion.maxDiscount) discount = Math.min(discount, promotion.maxDiscount);
            } else if (promotion.type === 'discount_fixed') {
              discount = Math.min(promotion.value, subtotal);
            } else if (promotion.type === 'free_delivery') {
              discount = deliveryFee;
            }
          }
        }
      }
    }

    const total = subtotal - discount + deliveryFee;

    // Criar pedido
    const order = await Order.create({
      userId: req.userId,
      status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
      deliveryAddress,
      deliveryWindow,
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod: paymentMethod || 'pix',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      notes,
      metadata: { promotionId: promotion?.id, promotionCode },
    });

    // Criar itens
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item,
      });
    }

    // Registrar uso da promoção
    if (promotion) {
      await PromotionUsage.create({
        promotionId: promotion.id,
        userId: req.userId,
        orderId: order.id,
        discountApplied: discount,
      });
      await promotion.increment('currentUses');
    }

    // Atualizar perfil de consumo do usuário
    await updateConsumptionProfile(req.userId, order, orderItems);

    // Pontos de fidelidade (1 ponto por real)
    await User.increment('loyaltyPoints', { by: Math.floor(total), where: { id: req.userId } });

    // Retornar pedido completo
    const completeOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    res.status(201).json({ order: completeOrder });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ATUALIZAR STATUS (admin/operador) =====
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const validTransitions = {
      cart: ['pending', 'cancelled'],
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivering', 'cancelled'],
      delivering: ['delivered', 'cancelled'],
      delivered: ['returned'],
      cancelled: [],
      returned: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ error: `Transição inválida: ${order.status} → ${status}` });
    }

    const updateData = { status };
    if (status === 'confirmed') updateData.confirmedAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();
    if (status === 'cancelled') updateData.cancelledAt = new Date(), updateData.cancelReason = notes;
    if (notes) updateData.notes = notes;

    await order.update(updateData);
    res.json({ order });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== LISTAR PEDIDOS (admin) =====
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId, startDate, endDate } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
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
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== DETALHE PEDIDO (admin) =====
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'whatsappNumber'] },
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

// ===== HISTÓRICO DE PEDIDOS DO CLIENTE =====
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

// ===== ATUALIZAR QUANTIDADE REAL (pós-pesagem) =====
exports.updateActualQuantity = async (req, res) => {
  try {
    const { items } = req.body; // [{ itemId, actualQuantity }]
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    let newSubtotal = 0;
    for (const update of items) {
      const item = await OrderItem.findByPk(update.itemId);
      if (item && item.orderId === order.id) {
        await item.update({ actualQuantity: update.actualQuantity });
        const qty = update.actualQuantity || item.quantity;
        const price = item.pricePerKg || item.unitPrice;
        await item.update({ totalPrice: price * qty });
        newSubtotal += price * qty;
      }
    }

    // Recalcular total
    const deliveryFee = order.deliveryFee;
    const discount = order.discount;
    const total = newSubtotal - discount + deliveryFee;

    await order.update({ subtotal: newSubtotal, total });

    res.json({ order: await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] }) });
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== DASHBOARD ESTATÍSTICAS (admin) =====
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const [
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      topProducts,
      topCategories,
      newCustomers,
      returningRate,
    ] = await Promise.all([
      Order.count({ where }),
      Order.sum('total', { where }),
      Order.findOne({
        where,
        attributes: [[sequelize.fn('AVG', sequelize.col('total')), 'avg']],
        raw: true,
      }),
      Order.findAll({
        where: { ...where, status: { [Op.in]: ['delivered', 'confirmed', 'preparing', 'ready', 'delivering'] } },
        attributes: ['status', [sequelize.fn('COUNT', '*'), 'count']],
        group: ['status'],
        raw: true,
      }),
      OrderItem.findAll({
        include: [{
          model: Order,
          as: 'order',
          where: { status: { [Op.in]: ['delivered', 'confirmed', 'preparing', 'ready', 'delivering'] }, ...where },
        }],
        attributes: [
          'productName',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQty'],
          [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue'],
          [sequelize.fn('COUNT', '*'), 'orderCount'],
        ],
        group: ['productName'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit: 10,
        raw: true,
      }),
      OrderItem.findAll({
        include: [{
          model: Order,
          as: 'order',
          where: { status: { [Op.in]: ['delivered', 'confirmed', 'preparing', 'ready', 'delivering'] }, ...where },
        }],
        include: [{ model: Product, as: 'product', attributes: ['categoryId'] }],
        include: [{ model: Category, as: 'category', attributes: ['name'] }],
        attributes: [
          [sequelize.col('category.name'), 'categoryName'],
          [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue'],
        ],
        group: ['category.name'],
        order: [[sequelize.fn('SUM', sequelize.col('totalPrice')), 'DESC']],
        raw: true,
      }),
      User.count({
        where: { createdAt: { [Op.gte]: startDate || new Date(Date.now() - 30*24*60*60*1000) } },
      }),
      sequelize.query(`
        SELECT
          COUNT(DISTINCT userId) as totalCustomers,
          COUNT(DISTINCT CASE WHEN orderCount > 1 THEN userId END) as returningCustomers
        FROM (
          SELECT userId, COUNT(*) as orderCount
          FROM orders
          WHERE status IN ('delivered', 'confirmed')
          GROUP BY userId
        ) t
      `, { type: sequelize.QueryTypes.SELECT }),
    ], { sequelize: require('../config/database') });

    const returning = returningRate[0]?.returningCustomers || 0;
    const total = returningRate[0]?.totalCustomers || 1;

    res.json({
      summary: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue || 0),
        avgOrderValue: parseFloat(avgOrderValue?.avg || 0),
        newCustomers,
        returningRate: (returning / total * 100).toFixed(1) + '%',
      },
      ordersByStatus,
      topProducts,
      topCategories,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== FUNÇÃO AUXILIAR: ATUALIZAR PERFIL DE CONSUMO =====
async function updateConsumptionProfile(userId, order, items) {
  const user = await User.findByPk(userId);
  const profile = user.consumptionProfile || {
    totalSpent: 0,
    orderCount: 0,
    avgOrderValue: 0,
    favoriteCategories: [],
    favoriteBrands: [],
    purchaseFrequency: 'new',
    preferredTimes: [],
    preferredDays: [],
    seasonality: {},
    priceElasticity: 'medium',
    basketSize: 'small',
  };

  // Atualizar básicos
  profile.totalSpent += order.total;
  profile.orderCount += 1;
  profile.avgOrderValue = profile.totalSpent / profile.orderCount;

  // Categorias favoritas
  const catCounts = {};
  const brandCounts = {};
  let totalQty = 0;

  for (const item of items) {
    if (item.categoryName) {
      catCounts[item.categoryName] = (catCounts[item.categoryName] || 0) + item.quantity;
    }
    if (item.productBrand) {
      brandCounts[item.productBrand] = (brandCounts[item.productBrand] || 0) + item.quantity;
    }
    totalQty += item.quantity;
  }

  profile.favoriteCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  profile.favoriteBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand]) => brand);

  // Basket size
  if (totalQty >= 20) profile.basketSize = 'large';
  else if (totalQty >= 10) profile.basketSize = 'medium';
  else profile.basketSize = 'small';

  // Frequência de compra (simplificado)
  if (profile.orderCount === 1) profile.purchaseFrequency = 'new';
  else if (profile.orderCount <= 3) profile.purchaseFrequency = 'monthly';
  else if (profile.orderCount <= 8) profile.purchaseFrequency = 'biweekly';
  else profile.purchaseFrequency = 'weekly';

  // Horários e dias preferidos
  const hour = new Date(order.createdAt).getHours();
  const day = new Date(order.createdAt).getDay();
  const timeSlot = hour < 12 ? 'manhã' : hour < 18 ? 'tarde' : 'noite';
  if (!profile.preferredTimes.includes(timeSlot)) profile.preferredTimes.push(timeSlot);
  if (!profile.preferredDays.includes(day)) profile.preferredDays.push(day);

  // Sazonalidade
  const month = new Date(order.createdAt).getMonth();
  profile.seasonality[month] = (profile.seasonality[month] || 0) + order.total;

  // Price elasticity (simplificado)
  if (order.discount > 0 && order.discount / order.subtotal > 0.15) {
    profile.priceElasticity = 'high';
  }

  await user.update({ consumptionProfile: profile, lastLoginAt: new Date() });
}