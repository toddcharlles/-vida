const fs = require('fs');
const path = require('path');
const { Product, Category } = require('../models');
const { extractPriceTagData, normalizeProductData } = require('./groqService');

/**
 * Processa imagem recebida via WhatsApp
 * @param {string} base64Image - Imagem em base64
 * @param {string} fromNumber - Número do remetente
 * @returns {Promise<Object>} Resultado do processamento
 */
async function processWhatsAppImage(base64Image, fromNumber) {
  console.log(`📱 Processando imagem do WhatsApp: ${fromNumber}`);

  try {
    // 1. Extrair dados via Groq Vision
    const rawData = await extractPriceTagData(base64Image);
    console.log('🔍 Dados brutos do Groq:', JSON.stringify(rawData, null, 2));

    // 2. Normalizar e validar
    const productData = normalizeProductData(rawData);
    console.log('✅ Dados normalizados:', JSON.stringify(productData, null, 2));

    // 3. Verificar confiança
    if (productData.confidence < 50) {
      return {
        success: false,
        message: `Baixa confiança na leitura (${productData.confidence}%). Tente foto mais nítida.`,
        data: productData,
      };
    }

    // 4. Buscar ou criar produto
    let product = null;
    let isNew = false;

    if (productData.barcode) {
      product = await Product.findOne({ where: { barcode: productData.barcode } });
    }

    if (!product) {
      // Tentar buscar por nome similar
      product = await Product.findOne({
        where: {
          name: productData.name,
        },
      });
    }

    if (!product) {
      // Criar novo produto
      isNew = true;
      // Tentar encontrar categoria por nome do produto (heurística simples)
      let category = await findCategoryByProductName(productData.name);
      if (!category) {
        category = await Category.findOne({ where: { slug: 'mercearia' } });
      }

      product = await Product.create({
        name: productData.name,
        barcode: productData.barcode,
        brand: productData.brand,
        price: productData.price || 0,
        pricePerKg: productData.pricePerKg,
        unit: productData.unit,
        isWeighed: productData.isWeighed,
        categoryId: category.id,
        image: null, // TODO: salvar imagem
        lastUpdateSource: 'whatsapp',
        lastWhatsAppUpdate: new Date(),
        lastOcrData: productData,
        available: true,
      });
      console.log(`✨ Produto criado: ${product.name} (${product.id})`);
    } else {
      // Atualizar produto existente
      const updateData = {
        price: productData.price ?? product.price,
        pricePerKg: productData.pricePerKg ?? product.pricePerKg,
        unit: productData.unit,
        isWeighed: productData.isWeighed,
        brand: productData.brand || product.brand,
        lastUpdateSource: 'whatsapp',
        lastWhatsAppUpdate: new Date(),
        lastOcrData: productData,
      };

      // Se tinha promoção, atualizar salePrice
      if (productData.promoPrice) {
        updateData.salePrice = productData.promoPrice;
      }

      await product.update(updateData);
      console.log(`🔄 Produto atualizado: ${product.name} (${product.id})`);
    }

    // 5. Retornar resumo
    const category = await Category.findByPk(product.categoryId);
    return {
      success: true,
      message: isNew ? '✅ Novo produto cadastrado!' : '🔄 Produto atualizado com sucesso!',
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        brand: product.brand,
        price: product.price,
        pricePerKg: product.pricePerKg,
        unit: product.unit,
        isWeighed: product.isWeighed,
        salePrice: product.salePrice,
        category: category?.name,
        lastUpdate: product.lastWhatsAppUpdate,
      },
      confidence: productData.confidence,
    };

  } catch (error) {
    console.error('❌ Erro ao processar imagem WhatsApp:', error);
    return {
      success: false,
      message: `Erro: ${error.message}`,
      error: error.message,
    };
  }
}

/**
 * Heurística simples para encontrar categoria baseada no nome
 */
async function findCategoryByProductName(name) {
  const lowerName = name.toLowerCase();
  const categories = await Category.findAll({ where: { active: true } });

  const keywords = {
    'bebidas': ['água', 'refrigerante', 'suco', 'cerveja', 'vinho', 'energético', 'isotônico', 'coca', 'guaraná', 'fanta', 'sprite', 'pepsi'],
    'hortifruti': ['banana', 'maçã', 'laranja', 'limão', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'alface', 'couve', 'brócolis', 'pepino', 'fruta', 'legume', 'verdura'],
    'carnes-proteinas': ['frango', 'carne', 'bife', 'linguiça', 'salsicha', 'hambúrguer', 'ovos', 'peixe', 'camarão', 'tilápia', 'merluza'],
    'laticinios-frios': ['leite', 'queijo', 'iogurte', 'manteiga', 'margarina', 'requeijão', 'presunto', 'mortadela', 'peito de peru', 'cream cheese'],
    'mercearia': ['arroz', 'feijão', 'macarrão', 'farinha', 'fubá', 'açúcar', 'sal', 'óleo', 'azeite', 'vinagre', 'molho', 'extrato', 'milho', 'ervilha', 'sardinha', 'atum', 'café', 'achocolatado', 'biscoito'],
    'congelados': ['batata frita', 'nuggets', 'lasanha', 'pizza', 'pão de queijo', 'polpa', 'hambúrguer congelado', 'empanado'],
    'snacks-conveniencia': ['chips', 'salgadinho', 'nachos', 'amendoim', 'barra', 'chocolate', 'bombom', 'biscoito recheado', 'cookies', 'paçoca', 'proteica'],
    'higiene-limpeza': ['detergente', 'sabão', 'amaciante', 'desinfetante', 'multiuso', 'esponja', 'papel higiênico', 'creme dental', 'sabonete', 'shampoo', 'desodorante'],
  };

  for (const [slug, words] of Object.entries(keywords)) {
    if (words.some(w => lowerName.includes(w))) {
      return categories.find(c => c.slug === slug);
    }
  }

  return null;
}

/**
 * Salva imagem base64 em arquivo
 */
function saveBase64Image(base64, prefix = 'whatsapp') {
  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const filepath = path.join(__dirname, '../../uploads', filename);

  // Garantir pasta uploads
  const uploadsDir = path.dirname(filepath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

module.exports = {
  processWhatsAppImage,
  saveBase64Image,
};