#!/usr/bin/env node
/**
 * Importador de imagens do Open Food Facts
 *
 * Uso:
 *   node scripts/import-open-food-facts.mjs           # Importa todos os 355 termos
 *   node scripts/import-open-food-facts.mjs --limit=20 # Testa com 20 termos
 *   node scripts/import-open-food-facts.mjs --dry-run  # Simula sem salvar
 *
 * Saída: src/data/product-images.json
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(PROJECT_ROOT, 'src/data/product-images.json');

const OPENFOODFACTS_BASE = 'https://world.openfoodfacts.org';

// 355 termos de pesquisa organizados por departamento
const SEARCH_TERMS = [
  // HORTIFRÚTI (40)
  'banana', 'maçã', 'laranja', 'limão', 'uva', 'manga', 'abacaxi', 'melancia', 'melão', 'morango',
  'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'alface', 'couve', 'brócolis', 'pimentão', 'pepino',
  'abobrinha', 'berinjela', 'chuchu', 'mandioca', 'batata-doce', 'inhame', 'abóbora', 'beterraba', 'espinafre', 'rúcula',
  'coentro', 'salsa', 'cebolinha', 'hortelã', 'manjericão', 'tomilho', 'alecrim', 'orégano', 'louro', 'gengibre',

  // MERCEARIA - GRÃOS E CEREAIS (25)
  'arroz branco', 'arroz integral', 'arroz parboilizado', 'feijão preto', 'feijão carioca', 'feijão branco', 'feijão vermelho',
  'lentilha', 'grão-de-bico', 'ervilha seca', 'milho pipoca', 'milho verde', 'quinoa', 'aveia em flocos', 'farelo de aveia',
  'farinha de trigo', 'farinha de mandioca', 'farinha de milho', 'fubá', 'polvilho doce', 'polvilho azedo', 'tapioca',
  'macarrão espaguete', 'macarrão penne', 'macarrão parafuso', 'macarrão lasanha', 'macarrão cabelo de anjo',

  // MERCEARIA - MOLHOS E CONSERVAS (20)
  'molho de tomate', 'extrato de tomate', 'catchup', 'mostarda', 'maionese', 'molho shoyu', 'molho inglês',
  'vinagre de álcool', 'vinagre de maçã', 'vinagre balsâmico', 'azeite de oliva', 'óleo de soja', 'óleo de milho', 'óleo de girassol',
  'azeitona verde', 'azeitona preta', 'palmito', 'cogumelo em conserva', 'picles', 'pepino em conserva', 'tomate seco',

  // MERCEARIA - ENLATADOS (20)
  'sardinha em lata', 'atum em lata', 'milho em lata', 'ervilha em lata', 'seleção de legumes', 'cogumelo em lata',
  'pêssego em calda', 'abacaxi em calda', 'goiabada', 'doce de leite', 'leite condensado', 'creme de leite',
  'achocolatado em pó', 'café em pó', 'café solúvel', 'açúcar cristal', 'açúcar refinado', 'adoçante', 'sal refinado', 'sal grosso',

  // AÇOUGUE E PROTEÍNAS (25)
  'carne bovina', 'picanha', 'alcatra', 'contrafilé', 'fraldinha', 'maminha', 'costela', 'acém', 'patinho', 'lagarto',
  'carne suína', 'lombo suíno', 'costelinha suína', 'pernil', 'bacon', 'linguiça calabresa', 'linguiça toscana',
  'frango inteiro', 'peito de frango', 'coxa de frango', 'asa de frango', 'ovos', 'peixe fresco', 'camarão',

  // LATICÍNIOS E REFRIGERADOS (20)
  'leite integral', 'leite desnatado', 'leite semidesnatado', 'leite UHT', 'leite pasteurizado',
  'queijo mussarela', 'queijo prato', 'queijo minas', 'queijo coalho', 'queijo parmesão', 'queijo gorgonzola', 'queijo brie',
  'iogurte natural', 'iogurte de frutas', 'iogurte grego', 'manteiga', 'margarina', 'requeijão', 'cream cheese', 'leite fermentado',

  // PADARIA E CONFEITARIA (20)
  'pão francês', 'pão de forma', 'pão integral', 'pão de queijo', 'pão de batata', 'pão australiano', 'baguete',
  'biscoito cream cracker', 'biscoito maizena', 'biscoito água e sal', 'biscoito recheado', 'biscoito integral',
  'bolo pronto', 'bolacha', 'torrada', 'croissant', 'sonho', 'rosca', 'pão de mel', 'panetone',

  // BEBIDAS (20)
  'água mineral', 'água com gás', 'água de coco', 'suco de laranja', 'suco de uva', 'suco de maçã', 'suco de maracujá',
  'suco de manga', 'néctar de pêssego', 'refrigerante cola', 'refrigerante guaraná', 'refrigerante laranja', 'refrigerante limão',
  'cerveja', 'vinho tinto', 'vinho branco', 'espumante', 'cachaça', 'vodka', 'whisky',

  // CONGELADOS (20)
  'batata frita congelada', 'polpa de açaí', 'polpa de frutas', 'hambúrguer congelado', 'nuggets de frango',
  'pizza congelada', 'lasanha congelada', 'vegetais congelados', 'brócolis congelado', 'milho congelado',
  'ervilha congelada', 'frango empanado congelado', 'peixe empanado congelado', 'camarão congelado', 'sorvete de creme',
  'sorvete de chocolate', 'sorvete de morango', 'picolé', 'açai pronto', 'doce de leite congelado',

  // LIMPEZA E CASA (20)
  'detergente líquido', 'detergente em pó', 'sabão em pó', 'sabão líquido', 'amaciante', 'alvejante', 'desinfetante',
  'limpa vidros', 'limpa pisos', 'desengordurante', 'esponja de aço', 'esponja macia', 'pano de chão', 'balde',
  'vassoura', 'rodo', 'papel toalha', 'papel higiênico', 'guardanapo', 'saco de lixo',

  // HIGIENE E CUIDADOS PESSOAIS (25)
  'shampoo', 'condicionador', 'sabonete líquido', 'sabonete em barra', 'creme dental', 'escova de dentes', 'fio dental',
  'enxaguante bucal', 'desodorante roll-on', 'desodorante aerosol', 'creme hidratante corporal', 'creme hidratante facial',
  'protetor solar', 'loção pós-sol', 'gel de cabelo', 'spray fixador', 'cera de cabelo', 'pomada de cabelo',
  'barbeador', 'lâmina de barbear', 'espuma de barbear', 'cotonete', 'algodão', 'absorvente', 'fralda descartável',

  // PET SHOP (15)
  'ração cão adulto', 'ração cão filhote', 'ração gato adulto', 'ração gato filhote', 'petisco cão', 'petisco gato',
  'areia para gato', 'tapete higiênico', 'shampoo pet', 'coleira', 'guia', 'brinquedo cão', 'brinquedo gato',
  'cama pet', 'comedouro',

  // UTILIDADES (15)
  'panela de pressão', 'frigideira', 'forma de bolo', 'assadeira', 'tigela de vidro', 'pote plástico', 'garrafa térmica',
  'xícara', 'prato', 'talheres', 'faca de cozinha', 'tábua de corte', 'escumadeira', 'concha', 'abridor de lata'
];

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'CEASA-Copacabana-Frontend/0.2.0 (import-script)' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

function extractLicenses(product) {
  const licenses = [];
  if (product.labels_tags) {
    for (const tag of product.labels_tags) {
      if (tag.includes('cc-by') || tag.includes('creative-commons') || tag.includes('public-domain') || tag.includes('open-data')) {
        licenses.push(tag.replace('en:', ''));
      }
    }
  }
  if (licenses.length === 0) {
    licenses.push('verificar-manualmente');
  }
  return licenses;
}

function getBestImage(product) {
  return product.image_front_url || product.image_url || product.image_front_small_url || product.image_ingredients_url || product.image_nutrition_url || product.image_packaging_url;
}

async function searchProducts(query, page = 1, pageSize = 20) {
  const url = `${OPENFOODFACTS_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`;
  return fetchWithRetry(url);
}

async function importImages(limitTerms = null, dryRun = false) {
  const termsToSearch = limitTerms ? SEARCH_TERMS.slice(0, limitTerms) : SEARCH_TERMS;
  const allImages = [];
  let totalProductsFound = 0;
  let totalImagesSaved = 0;

  console.log(`🔍 Iniciando importação de ${termsToSearch.length} termos de pesquisa...`);
  console.log(`📊 Modo: ${dryRun ? 'DRY-RUN (simulação)' : 'REAL'}`);
  console.log('');

  for (let i = 0; i < termsToSearch.length; i++) {
    const term = termsToSearch[i];
    console.log(`[${i + 1}/${termsToSearch.length}] Buscando: "${term}"`);

    try {
      const result = await searchProducts(term, 1, 20);
      const products = result.products || [];
      totalProductsFound += products.length;

      let termImagesSaved = 0;
      for (const product of products) {
        const imageUrl = getBestImage(product);
        if (!imageUrl) continue;

        const savedImage = {
          barcode: product.code,
          name: product.product_name_pt || product.product_name || 'Sem nome',
          brand: product.brands || 'Desconhecida',
          category: product.categories_tags?.[0]?.replace('en:', '') || 'sem-categoria',
          searchTerm: term,
          imageUrl,
          imageFrontUrl: product.image_front_url,
          packaging: product.packaging,
          quantity: product.quantity,
          licenses: extractLicenses(product),
          source: 'openfoodfacts',
          fetchedAt: new Date().toISOString()
        };

        allImages.push(savedImage);
        termImagesSaved++;
        totalImagesSaved++;
      }

      console.log(`   ✓ ${products.length} produtos encontrados, ${termImagesSaved} com imagem`);
    } catch (error) {
      console.error(`   ✗ Erro ao buscar "${term}":`, error.message);
    }

    // Rate limiting - ser gentil com a API
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('');
  console.log('📈 Resumo:');
  console.log(`   Termos pesquisados: ${termsToSearch.length}`);
  console.log(`   Produtos encontrados: ${totalProductsFound}`);
  console.log(`   Imagens salvas: ${totalImagesSaved}`);

  if (!dryRun && allImages.length > 0) {
    // Agrupar por código de barras para remover duplicatas
    const uniqueImages = Object.values(allImages.reduce((acc, img) => {
      if (!acc[img.barcode] || img.imageFrontUrl) {
        acc[img.barcode] = img;
      }
      return acc;
    }, {}));

    console.log(`   Imagens únicas (após dedup): ${uniqueImages.length}`);

    // Garantir diretório de saída
    const outputDir = dirname(OUTPUT_PATH);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueImages, null, 2), 'utf-8');
    console.log(`\n✅ Arquivo salvo em: ${OUTPUT_PATH}`);
  } else if (dryRun) {
    console.log('\n🔍 DRY-RUN: Nenhum arquivo foi salvo.');
  }

  return allImages;
}

// Parse args
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
const dryRun = args.includes('--dry-run');

importImages(limit, dryRun).catch(console.error);