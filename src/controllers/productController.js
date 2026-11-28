const { Product, Category } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const {
      categoryId,
      search,
      available,
      featured,
      isWeighed,
      page = 1,
      limit = 50,
      sort = 'name',
      order = 'ASC',
    } = req.query;

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (available !== undefined) where.available = available === 'true';
    if (featured !== undefined) where.featured = featured === 'true';
    if (isWeighed !== undefined) where.isWeighed = isWeighed === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'salePrice'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
      products: rows,
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const cat = await Category.findOne({
      where: { slug: category },
    });
    if (!cat) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const products = await Product.findAll({
      where: { categoryId: cat.id, available: true },
      include: [{ model: Category, as: 'category' }],
      order: [['name', 'ASC']],
    });
    res.json(products);
  } catch (error) {
    console.error('Erro ao listar por categoria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({
      where: { barcode },
      include: [{ model: Category, as: 'category' }],
    });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar por barcode:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      pricePerKg,
      barcode,
      unit,
      isWeighed,
      categoryId,
      brand,
      image,
      supplierGroup,
      available = true,
      featured = false,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Categoria é obrigatória' });
    }

    // Verificar categoria
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    // Verificar barcode único
    if (barcode) {
      const existing = await Product.findOne({ where: { barcode } });
      if (existing) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      pricePerKg: pricePerKg ? parseFloat(pricePerKg) : null,
      barcode,
      unit: unit || 'UN',
      isWeighed: Boolean(isWeighed),
      categoryId,
      brand,
      image,
      supplierGroup,
      available,
      featured,
      lastUpdateSource: 'manual',
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json(productWithCategory);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Erro de validação',
        details: error.errors.map(e => ({ field: e.path, message: e.message })),
      });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const allowedFields = [
      'name', 'description', 'price', 'salePrice', 'pricePerKg',
      'barcode', 'unit', 'isWeighed', 'categoryId', 'brand',
      'image', 'supplierGroup', 'available', 'featured',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Conversões
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.salePrice) updateData.salePrice = parseFloat(updateData.salePrice);
    if (updateData.pricePerKg) updateData.pricePerKg = parseFloat(updateData.pricePerKg);
    if (updateData.isWeighed !== undefined) updateData.isWeighed = Boolean(updateData.isWeighed);
    if (updateData.available !== undefined) updateData.available = Boolean(updateData.available);
    if (updateData.featured !== undefined) updateData.featured = Boolean(updateData.featured);

    // Verificar barcode único se alterado
    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existing = await Product.findOne({ where: { barcode: updateData.barcode } });
      if (existing) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
    }

    // Verificar categoria
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Categoria não encontrada' });
      }
    }

    updateData.lastUpdateSource = 'manual';
    await product.update(updateData);

    const updated = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }],
    });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    await product.destroy();
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    await product.update({
      available: !product.available,
      lastUpdateSource: 'manual',
    });
    res.json(product);
  } catch (error) {
    console.error('Erro ao alternar disponibilidade:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { products } = req.body; // Array de { id, price, salePrice, available, ... }
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produtos é obrigatória' });
    }

    const results = [];
    for (const item of products) {
      if (!item.id) continue;
      const product = await Product.findByPk(item.id);
      if (product) {
        const updateData = { lastUpdateSource: 'manual' };
        if (item.price !== undefined) updateData.price = parseFloat(item.price);
        if (item.salePrice !== undefined) updateData.salePrice = parseFloat(item.salePrice);
        if (item.pricePerKg !== undefined) updateData.pricePerKg = parseFloat(item.pricePerKg);
        if (item.available !== undefined) updateData.available = Boolean(item.available);
        if (item.featured !== undefined) updateData.featured = Boolean(item.featured);
        await product.update(updateData);
        results.push({ id: product.id, success: true });
      } else {
        results.push({ id: item.id, success: false, error: 'Não encontrado' });
      }
    }
    res.json({ updated: results.filter(r => r.success).length, results });
  } catch (error) {
    console.error('Erro na atualização em lote:', error);
    res.status(500).json({ error: error.message });
  }
};