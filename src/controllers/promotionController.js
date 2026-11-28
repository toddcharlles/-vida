const { Promotion, PromotionUsage, User, Order } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// ===== GERAR CÓDIGO ÚNICO =====
function generateCode(prefix = 'PROMO') {
  return `${prefix}-${uuidv4().slice(0, 8).toUpperCase()}`;
}

// ===== CRIAR PROMOÇÃO (admin) =====
exports.create = async (req, res) => {
  try {
    const {
      type, title, description, value,
      minOrderValue, maxDiscount,
      applicableCategories, applicableProducts, applicableBrands,
      targetTiers, targetFrequency, targetMinOrders, targetMinSpent,
      startsAt, endsAt,
      maxUsesTotal, maxUsesPerUser,
      code, autoApply, priority,
    } = req.body;

    if (!type || !title || value === undefined) {
      return res.status(400).json({ error: 'Tipo, título e valor são obrigatórios' });
    }

    const promoCode = code || generateCode();

    const promotion = await Promotion.create({
      type,
      title,
      description,
      value: parseFloat(value),
      minOrderValue: parseFloat(minOrderValue) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      applicableBrands: applicableBrands || [],
      targetTiers: targetTiers || ['bronze', 'silver', 'gold', 'platinum'],
      targetFrequency: targetFrequency || [],
      targetMinOrders: parseInt(targetMinOrders) || 0,
      targetMinSpent: parseFloat(targetMinSpent) || 0,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal) : null,
      maxUsesPerUser: parseInt(maxUsesPerUser) || 1,
      code: promoCode,
      autoApply: Boolean(autoApply),
      priority: parseInt(priority) || 0,
    });

    res.status(201).json({ promotion });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ===== LISTAR PROMOÇÕES (admin) =====
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, active, type } = req.query;
    const where = {};
    if (active !== undefined) where.active = active === 'true';
    if (type) where.type = type;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Promotion.findAndCountAll({
      where,
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    // Adicionar contagem de usos
    const promotionsWithUsage = await Promise.all(rows.map(async (p) => {
      const usageCount = await PromotionUsage.count({ where: { promotionId: p.id } });
      return { ...p.toJSON(), usageCount };
    }));

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
      promotions: promotionsWithUsage,
    });
  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== BUSCAR PROMOÇÃO POR ID =====
exports.getById = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id, {
      include: [{ model: PromotionUsage, as: 'usages', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] }],
    });
    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }
    res.json({ promotion });
  } catch (error) {
    console.error('Erro ao buscar promoção:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ATUALIZAR PROMOÇÃO =====
exports.update = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    const allowedFields = [
      'type', 'title', 'description', 'value',
      'minOrderValue', 'maxDiscount',
      'applicableCategories', 'applicableProducts', 'applicableBrands',
      'targetTiers', 'targetFrequency', 'targetMinOrders', 'targetMinSpent',
      'startsAt', 'endsAt',
      'maxUsesTotal', 'maxUsesPerUser',
      'code', 'autoApply', 'priority', 'active',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (['value', 'minOrderValue', 'maxDiscount'].includes(field)) {
          updateData[field] = req.body[field] ? parseFloat(req.body[field]) : null;
        } else if (['targetMinOrders', 'maxUsesTotal', 'maxUsesPerUser', 'priority'].includes(field)) {
          updateData[field] = req.body[field] ? parseInt(req.body[field]) : null;
        } else if (['startsAt', 'endsAt'].includes(field)) {
          updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    await promotion.update(updateData);
    res.json({ promotion });
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== DELETAR PROMOÇÃO =====
exports.delete = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }
    await promotion.destroy();
    res.json({ message: 'Promoção excluída' });
  } catch (error) {
    console.error('Erro ao excluir promoção:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== TOGGLE ACTIVE =====
exports.toggleActive = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }
    await promotion.update({ active: !promotion.active });
    res.json({ promotion });
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GERAR PROMOÇÕES AUTOMÁTICAS BASEADAS EM PERFIL =====
exports.generateAutoPromotions = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { active: true, role: 'customer' },
      attributes: ['id', 'loyaltyTier', 'consumptionProfile'],
    });

    const created = [];
    for (const user of users) {
      const profile = user.consumptionProfile || {};
      const promos = [];

      // 1. Aniversário (se tiver birthDate)
      // TODO: verificar se é mês do aniversário

      // 2. Reativação (cliente inativo > 30 dias)
      const lastOrder = await Order.findOne({
        where: { userId: user.id, status: { [Op.in]: ['delivered', 'confirmed'] } },
        order: [['createdAt', 'DESC']],
      });
      if (lastOrder) {
        const daysSince = (Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 30 && daysSince < 60) {
          promos.push({
            type: 'discount_percent',
            title: 'Volte a comprar com 15% OFF!',
            description: 'Sentimos sua falta. Use este cupom no seu próximo pedido.',
            value: 15,
            minOrderValue: 50,
            maxUsesPerUser: 1,
            targetTiers: [user.loyaltyTier],
            autoApply: true,
            priority: 10,
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            code: `REATIVA-${uuidv4().slice(0, 6).toUpperCase()}`,
          });
        }
      }

      // 3. Cliente frequente - fidelidade
      if (profile.orderCount >= 5 && profile.purchaseFrequency === 'weekly') {
        promos.push({
          type: 'loyalty_points',
          title: 'Pontos em dobro esta semana!',
          description: 'Cliente fiel ganha pontos dobrados.',
          value: 2, // multiplicador
          targetTiers: [user.loyaltyTier],
          targetFrequency: ['weekly'],
          autoApply: true,
          priority: 5,
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          code: `FIDEL-${uuidv4().slice(0, 6).toUpperCase()}`,
        });
      }

      // 4. Categoria favorita com desconto
      if (profile.favoriteCategories?.length) {
        const favCat = profile.favoriteCategories[0];
        const catProducts = await Product.findAll({
          where: { categoryId: favCat }, // precisa ajustar para buscar por nome
          limit: 10,
        });
        if (catProducts.length) {
          promos.push({
            type: 'category_discount',
            title: `10% OFF em ${favCat}!`,
            description: `Desconto especial na sua categoria favorita.`,
            value: 10,
            applicableCategories: catProducts.map(p => p.categoryId).filter(Boolean),
            targetTiers: [user.loyaltyTier],
            maxUsesPerUser: 2,
            priority: 8,
            endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            code: `FAV-${uuidv4().slice(0, 6).toUpperCase()}`,
          });
        }
      }

      // 5. Primeira compra (se orderCount === 0)
      if (!profile.orderCount || profile.orderCount === 0) {
        promos.push({
          type: 'first_order',
          title: 'Bem-vindo! 10% OFF na primeira compra',
          description: 'Use no seu primeiro pedido.',
          value: 10,
          minOrderValue: 30,
          targetTiers: [user.loyaltyTier],
          maxUsesPerUser: 1,
          priority: 20,
          code: `BEMVINDO-${uuidv4().slice(0, 6).toUpperCase()}`,
        });
      }

      // Criar promoções
      for (const promo of promos) {
        const existing = await Promotion.findOne({ where: { code: promo.code } });
        if (!existing) {
          const p = await Promotion.create(promo);
          created.push(p);
        }
      }
    }

    res.json({ created: created.length, promotions: created });
  } catch (error) {
    console.error('Erro ao gerar promoções automáticas:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ESTATÍSTICAS DE PROMOÇÕES =====
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const [total, active, byType, totalUsage, totalDiscount] = await Promise.all([
      Promotion.count({ where }),
      Promotion.count({ where: { ...where, active: true } }),
      Promotion.findAll({
        where,
        attributes: ['type', [sequelize.fn('COUNT', '*'), 'count']],
        group: ['type'],
        raw: true,
      }),
      PromotionUsage.count({ where: { usedAt: { [Op.gte]: startDate || new Date(Date.now() - 30*24*60*60*1000) } } }),
      PromotionUsage.sum('discountApplied', { where: { usedAt: { [Op.gte]: startDate || new Date(Date.now() - 30*24*60*60*1000) } } }),
    ]);

    res.json({
      summary: {
        total,
        active,
        totalUsage,
        totalDiscount: parseFloat(totalDiscount || 0),
      },
      byType,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== APLICAR CUPOM (cliente) =====
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