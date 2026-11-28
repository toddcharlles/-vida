const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Permitir login por email ou telefone
    const where = email ? { email } : phone ? { phone } : null;
    if (!where) {
      return res.status(400).json({ error: 'Email ou telefone é obrigatório' });
    }

    const user = await User.findOne({ where });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se já existe
    const existing = await User.findOne({
      where: email ? { email } : { phone },
    });
    if (existing) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
};