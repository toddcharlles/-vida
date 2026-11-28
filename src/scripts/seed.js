const { sequelize, Category, Product, User } = require('../models');

async function seed() {
  try {
    console.log('🌱 Iniciando seed...');
    // Sincronizar tabelas primeiro
    await sequelize.sync();
    console.log('✅ Tabelas sincronizadas');

    // Garantir categorias e pegar seus IDs reais
    const defaultCategories = [
      { slug: 'bebidas', name: 'Bebidas', icon: '🧃', description: 'Água, refrigerantes, sucos, energéticos, cervejas e vinhos', order: 1 },
      { slug: 'mercearia', name: 'Mercearia', icon: '🛒', description: 'Arroz, feijão, massas, molhos, conservas, café, condimentos', order: 2 },
      { slug: 'hortifruti', name: 'Hortifrúti', icon: '🥬', description: 'Frutas, legumes, verduras e temperos frescos', order: 3 },
      { slug: 'carnes-proteinas', name: 'Carnes e Proteínas', icon: '🥩', description: 'Frango, bovinos, suínos, pescados, ovos e embutidos', order: 4 },
      { slug: 'laticinios-frios', name: 'Laticínios e Frios', icon: '🥛', description: 'Leites, queijos, iogurtes, manteiga, frios e requeijão', order: 5 },
      { slug: 'congelados', name: 'Congelados', icon: '🧊', description: 'Batata frita, nuggets, lasanhas, pizzas, pão de queijo, polpas', order: 6 },
      { slug: 'snacks-conveniencia', name: 'Snacks e Conveniência', icon: '🍿', description: 'Chips, salgadinhos, chocolates, biscoitos, barras, sanduíches', order: 7 },
      { slug: 'higiene-limpeza', name: 'Higiene e Limpeza', icon: '🧼', description: 'Detergentes, sabões, amaciantes, papel higiênico, higiene pessoal', order: 8 },
    ];

    const catIds = {};
    for (const cat of defaultCategories) {
      const [category] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: { ...cat, active: true },
      });
      catIds[cat.slug] = category.id;
    }
    console.log('✅ Categorias:', Object.keys(catIds).join(', '));

    // Produtos de exemplo baseados na lista de 213 SKUs
    const sampleProducts = [
      // BEBIDAS
      { name: 'Água Crystal 500ml', barcode: '7896048200051', brand: 'Crystal', price: 2.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Água Crystal 1,5L', barcode: '7896048200105', brand: 'Crystal', price: 4.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Água com Gás São Lourenço 500ml', barcode: '7896048284778', brand: 'São Lourenço', price: 3.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Coca-Cola Lata 350ml', barcode: '7894900010015', brand: 'Coca-Cola', price: 5.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Coca-Cola PET 600ml', barcode: '7894900701609', brand: 'Coca-Cola', price: 7.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Coca-Cola PET 2L', barcode: '7894900027013', brand: 'Coca-Cola', price: 12.90, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Coca-Cola Zero 350ml', barcode: '7894900701159', brand: 'Coca-Cola', price: 5.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Guaraná Antarctica 350ml', barcode: '7892840800000', brand: 'Antarctica', price: 5.00, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Sprite 2L', barcode: '7894900681017', brand: 'Sprite', price: 11.90, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Suco Del Valle Uva 1L', barcode: '7898341430098', brand: 'Del Valle', price: 9.90, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Suco Maguary Uva 500ml', barcode: '7896000556066', brand: 'Maguary', price: 6.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Red Bull 250ml', barcode: '7898080664389', brand: 'Red Bull', price: 9.90, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Monster Energy 473ml', barcode: '7898080664389', brand: 'Monster', price: 12.90, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Heineken Lata 350ml', barcode: '7896045506873', brand: 'Heineken', price: 7.90, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },
      { name: 'Brahma Lata 350ml', barcode: '7892840800000', brand: 'Brahma', price: 4.50, unit: 'UN', categorySlug: 'bebidas', isWeighed: false },

      // MERCEARIA
      { name: 'Arroz Prato Fino 1kg', barcode: '7896290300189', brand: 'Prato Fino', price: 6.99, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Arroz Camil 5kg', barcode: '7896290300141', brand: 'Camil', price: 28.90, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Feijão Preto Kicaldo 1kg', barcode: '7896290300189', brand: 'Kicaldo', price: 8.90, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Feijão Carioca Camil 1kg', barcode: '7896290300141', brand: 'Camil', price: 8.50, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Açúcar União Refinado 1kg', barcode: '7896110194264', brand: 'União', price: 4.50, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Óleo de Soja Liza 900ml', barcode: '7896036096079', brand: 'Liza', price: 7.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Azeite Andorinha 500ml', barcode: '5601216120152', brand: 'Andorinha', price: 29.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Macarrão Espaguete Adria 500g', barcode: '7896213006235', brand: 'Adria', price: 4.50, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Molho de Tomate Pomarola 300g', barcode: '7896036096079', brand: 'Pomarola', price: 3.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Extrato de Tomate Elefante 300g', barcode: '7896036000816', brand: 'Elefante', price: 2.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Milho Verde Quero 170g', barcode: '7896102500608', brand: 'Quero', price: 2.50, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Ervilha Quero 170g', barcode: '7896102500448', brand: 'Quero', price: 2.50, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Sardinha Coqueiro 125g', barcode: '7896009301162', brand: 'Coqueiro', price: 4.50, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Atum Gomes da Costa 170g', barcode: '7891167022027', brand: 'Gomes da Costa', price: 6.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Café Pilão 250g', barcode: '7896089011357', brand: 'Pilão', price: 12.90, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Café 3 Corações 500g', barcode: '7896089013399', brand: '3 Corações', price: 22.90, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Leite Condensado Moça 395g', barcode: '7891000100103', brand: 'Moça', price: 7.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Creme de Leite Nestlé 200g', barcode: '7891000100103', brand: 'Nestlé', price: 4.50, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Maionese Hellmann\'s 500g', barcode: '7891150027848', brand: 'Hellmann\'s', price: 14.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Ketchup Heinz 400g', barcode: '7896048200051', brand: 'Heinz', price: 9.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Mostarda Heinz 200ml', barcode: '87157451', brand: 'Heinz', price: 6.90, unit: 'UN', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Biscoito Cream Cracker Vitarella 350g', barcode: '7896213006235', brand: 'Vitarella', price: 5.90, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },
      { name: 'Biscoito Cream Cracker Piraquê 200g', barcode: '7896024721198', brand: 'Piraquê', price: 4.50, unit: 'PACK', categorySlug: 'mercearia', isWeighed: false },

      // HORTIFRÚTI (pesáveis)
      { name: 'Banana Prata', barcode: '5900852054839', brand: '', pricePerKg: 5.99, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },
      { name: 'Maçã Fuji', barcode: '7898902299164', brand: '', pricePerKg: 9.99, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },
      { name: 'Tomate', barcode: '20319281', brand: '', pricePerKg: 6.99, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },
      { name: 'Batata Inglesa', barcode: '7896004006239', brand: '', pricePerKg: 5.49, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },
      { name: 'Cebola', barcode: '7898902299164', brand: '', pricePerKg: 4.99, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },
      { name: 'Alface Crespa', barcode: '7898949599319', brand: '', pricePerKg: 8.99, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },
      { name: 'Cenoura', barcode: '7898902299164', brand: '', pricePerKg: 4.50, unit: 'KG', categorySlug: 'hortifruti', isWeighed: true },

      // CARNES E PROTEÍNAS
      { name: 'Peito de Frango Sadia 1kg', barcode: '7893000482401', brand: 'Sadia', price: 18.90, pricePerKg: 18.90, unit: 'KG', categorySlug: 'carnes-proteinas', isWeighed: true },
      { name: 'Coxa de Frango Sadia 1kg', barcode: '7891515567163', brand: 'Sadia', price: 14.90, pricePerKg: 14.90, unit: 'KG', categorySlug: 'carnes-proteinas', isWeighed: true },
      { name: 'Linguiça Toscana Sadia 950g', barcode: '7893000040144', brand: 'Sadia', price: 22.90, pricePerKg: 24.10, unit: 'KG', categorySlug: 'carnes-proteinas', isWeighed: true },
      { name: 'Linguiça Calabresa Sadia 500g', barcode: '7891515620981', brand: 'Sadia', price: 15.90, pricePerKg: 31.80, unit: 'KG', categorySlug: 'carnes-proteinas', isWeighed: true },
      { name: 'Hambúrguer Seara 672g', barcode: '7894904238620', brand: 'Seara', price: 24.90, pricePerKg: 37.05, unit: 'KG', categorySlug: 'carnes-proteinas', isWeighed: true },
      { name: 'Ovos Brancos 12 unid', barcode: '7896237901967', brand: '', price: 14.90, unit: 'PACK', categorySlug: 'carnes-proteinas', isWeighed: false },
      { name: 'Tilápia em Filé 500g', barcode: '7891515585723', brand: '', price: 29.90, pricePerKg: 59.80, unit: 'KG', categorySlug: 'carnes-proteinas', isWeighed: true },

      // LATICÍNIOS E FRIOS
      { name: 'Leite Integral Piracanjuba 1L', barcode: '7898215151708', brand: 'Piracanjuba', price: 5.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Leite Desnatado Piracanjuba 1L', barcode: '7898215157786', brand: 'Piracanjuba', price: 5.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Leite Sem Lactose Piracanjuba 1L', barcode: '7898215152811', brand: 'Piracanjuba', price: 7.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Iogurte Natural Nestlé 170g', barcode: '7891000244449', brand: 'Nestlé', price: 2.50, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Manteiga Aviação 200g', barcode: '5603722505775', brand: 'Aviação', price: 12.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Requeijão Catupiry 200g', barcode: '7891999970107', brand: 'Catupiry', price: 8.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Muçarela Tirolez 150g', barcode: '7898215151708', brand: 'Tirolez', price: 9.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Queijo Minas Frescal 300g', barcode: '7898215151708', brand: 'Tirolez', price: 14.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Parmesão Ralado Vigor 50g', barcode: '7891999970053', brand: 'Vigor', price: 9.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },
      { name: 'Cream Cheese Philadelphia 150g', barcode: '7622300441937', brand: 'Philadelphia', price: 12.90, unit: 'UN', categorySlug: 'laticinios-frios', isWeighed: false },

      // CONGELADOS
      { name: 'Batata Frita McCain 400g', barcode: '7891515551360', brand: 'McCain', price: 14.90, unit: 'PACK', categorySlug: 'congelados', isWeighed: false },
      { name: 'Nuggets Sadia 300g', barcode: '7891515605704', brand: 'Sadia', price: 12.90, unit: 'PACK', categorySlug: 'congelados', isWeighed: false },
      { name: 'Lasanha Seara 4 Queijos 600g', barcode: '7894904082728', brand: 'Seara', price: 18.90, unit: 'PACK', categorySlug: 'congelados', isWeighed: false },
      { name: 'Pão de Queijo Forno de Minas 820g', barcode: '7896074606735', brand: 'Forno de Minas', price: 24.90, unit: 'PACK', categorySlug: 'congelados', isWeighed: false },
      { name: 'Polpa de Açaí Frooty 400g', barcode: '7896292315174', brand: 'Frooty', price: 12.90, unit: 'PACK', categorySlug: 'congelados', isWeighed: false },

      // SNACKS
      { name: 'Batata Chips Ruffles 45g', barcode: '7896024721198', brand: 'Ruffles', price: 3.50, unit: 'UN', categorySlug: 'snacks-conveniencia', isWeighed: false },
      { name: 'Cheetos 45g', barcode: '7896024721198', brand: 'Cheetos', price: 3.50, unit: 'UN', categorySlug: 'snacks-conveniencia', isWeighed: false },
      { name: 'Doritos Nachos 45g', barcode: '7896024721198', brand: 'Doritos', price: 3.50, unit: 'UN', categorySlug: 'snacks-conveniencia', isWeighed: false },
      { name: 'Chocolate Lacta 90g', barcode: '7894904678280', brand: 'Lacta', price: 5.50, unit: 'UN', categorySlug: 'snacks-conveniencia', isWeighed: false },
      { name: 'Biscoito Recheado Oreo 130g', barcode: '7896213006235', brand: 'Oreo', price: 4.90, unit: 'PACK', categorySlug: 'snacks-conveniencia', isWeighed: false },

      // HIGIENE E LIMPEZA
      { name: 'Detergente Ypê 500ml', barcode: '7896048200051', brand: 'Ypê', price: 2.50, unit: 'UN', categorySlug: 'higiene-limpeza', isWeighed: false },
      { name: 'Sabão em Pó Omo 800g', barcode: '7896048200051', brand: 'Omo', price: 12.90, unit: 'PACK', categorySlug: 'higiene-limpeza', isWeighed: false },
      { name: 'Amaciante Comfort 1L', barcode: '7896048200051', brand: 'Comfort', price: 14.90, unit: 'UN', categorySlug: 'higiene-limpeza', isWeighed: false },
      { name: 'Papel Higiênico Neve 4 rolos', barcode: '7896048200051', brand: 'Neve', price: 8.90, unit: 'PACK', categorySlug: 'higiene-limpeza', isWeighed: false },
      { name: 'Creme Dental Colgate 90g', barcode: '7891024134429', brand: 'Colgate', price: 6.50, unit: 'UN', categorySlug: 'higiene-limpeza', isWeighed: false },
      { name: 'Shampoo Pantene 350ml', barcode: '7896048200051', brand: 'Pantene', price: 18.90, unit: 'UN', categorySlug: 'higiene-limpeza', isWeighed: false },
    ];

    let created = 0;
    for (const p of sampleProducts) {
      const existing = await Product.findOne({ where: { barcode: p.barcode } });
      if (!existing) {
        await Product.create({
          name: p.name,
          barcode: p.barcode,
          brand: p.brand,
          price: p.price || 0,
          pricePerKg: p.pricePerKg || null,
          unit: p.unit,
          isWeighed: p.isWeighed,
          categoryId: catIds[p.categorySlug],
          available: true,
          lastUpdateSource: 'seed',
        });
        created++;
      }
    }

    console.log(`✅ Seed concluído: ${created} produtos criados`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();