const app = require('./src/app');
const { sequelize, Category, Product, User, Order, OrderItem, Promotion, PromotionUsage } = require('./src/models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Conectar ao SQLite
    await sequelize.authenticate();
    console.log('✅ Conectado ao SQLite');

    // Sincronizar modelos (force: true para desenvolvimento - recria tabelas)
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas recriadas');

    // Criar categorias padrão do CEASA
    const defaultCategories = [
      { id: 'cat-drinks', name: 'Bebidas', slug: 'bebidas', icon: '🧃', description: 'Água, refrigerantes, sucos, energéticos, cervejas e vinhos', order: 1, active: true },
      { id: 'cat-grocery', name: 'Mercearia', slug: 'mercearia', icon: '🛒', description: 'Arroz, feijão, massas, molhos, conservas, café, condimentos', order: 2, active: true },
      { id: 'cat-produce', name: 'Hortifrúti', slug: 'hortifruti', icon: '🥬', description: 'Frutas, legumes, verduras e temperos frescos', order: 3, active: true },
      { id: 'cat-meat', name: 'Carnes e Proteínas', slug: 'carnes-proteinas', icon: '🥩', description: 'Frango, bovinos, suínos, pescados, ovos e embutidos', order: 4, active: true },
      { id: 'cat-dairy', name: 'Laticínios e Frios', slug: 'laticinios-frios', icon: '🥛', description: 'Leites, queijos, iogurtes, manteiga, frios e requeijão', order: 5, active: true },
      { id: 'cat-frozen', name: 'Congelados', slug: 'congelados', icon: '🧊', description: 'Batata frita, nuggets, lasanhas, pizzas, pão de queijo, polpas', order: 6, active: true },
      { id: 'cat-snacks', name: 'Snacks e Conveniência', slug: 'snacks-conveniencia', icon: '🍿', description: 'Chips, salgadinhos, chocolates, biscoitos, barras, sanduíches', order: 7, active: true },
      { id: 'cat-cleaning', name: 'Higiene e Limpeza', slug: 'higiene-limpeza', icon: '🧼', description: 'Detergentes, sabões, amaciantes, papel higiênico, higiene pessoal', order: 8, active: true },
    ];

    for (const cat of defaultCategories) {
      await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
    }
    console.log('✅ Categorias CEASA criadas/verificadas');

    // Criar admin padrão
    const adminExists = await User.findOne({ where: { email: 'admin@ceasa.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Administrador CEASA',
        email: 'admin@ceasa.com',
        password: 'ceasa123',
        role: 'admin',
        whatsappNumber: null,
      });
      console.log('✅ Admin padrão criado (admin@ceasa.com / ceasa123)');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🛒  CEASA COPACABANA API                                 ║
║  📡  Servidor rodando em http://localhost:${PORT}              ║
║  🏥  Health: http://localhost:${PORT}/api/health               ║
║  📦  Produtos: http://localhost:${PORT}/api/products             ║
║  👤  Usuário: http://localhost:${PORT}/api/user/profile          ║
║  📦  Pedidos: http://localhost:${PORT}/api/orders                ║
║  🎁  Promoções: http://localhost:${PORT}/api/promotions           ║
║  📱  WhatsApp OCR: http://localhost:${PORT}/api/whatsapp/status  ║
║  🔧  Debug: http://localhost:${PORT}/api/debug/products          ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
    process.exit(1);
  }
}

startServer();