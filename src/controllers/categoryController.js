const { Category } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { active } = req.query;
    const where = active !== undefined ? { active: active === 'true' } : {};
    const categories = await Category.findAll({
      where,
      order: [['order', 'ASC'], ['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, slug, icon, description, order, active } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
    }
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug já existe' });
    }
    const category = await Category.create({
      name,
      slug,
      icon: icon || '🛒',
      description,
      order: order || 0,
      active: active !== undefined ? active : true,
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    const { name, slug, icon, description, order, active } = req.body;
    if (slug && slug !== category.slug) {
      const existing = await Category.findOne({ where: { slug } });
      if (existing) {
        return res.status(400).json({ error: 'Slug já existe' });
      }
    }
    await category.update({ name, slug, icon, description, order, active });
    res.json(category);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    await category.destroy();
    res.json({ message: 'Categoria excluída' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ error: error.message });
  }
};