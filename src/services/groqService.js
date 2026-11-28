const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Extrai informações da etiqueta de preço via Groq Vision
 * @param {string} base64Image - Imagem em base64
 * @returns {Promise<Object>} Dados extraídos
 */
async function extractPriceTagData(base64Image) {
  const prompt = `
Você é um sistema de leitura de etiquetas de supermercado. Analise a imagem e extraia EXATAMENTE estas informações:

RETORNE APENAS JSON VÁLIDO com estes campos:
{
  "barcode": "código de barras/EAN se visível (string ou null)",
  "name": "nome do produto como aparece na etiqueta (string)",
  "brand": "marca se visível (string ou null)",
  "price": "preço de venda (número, ex: 5.99)",
  "pricePerKg": "preço por kg se for produto pesável (número ou null)",
  "unit": "unidade: KG, G, L, ML, UN, PACK, BOX, BUNCH (string)",
  "isWeighed": "true se tiver 'R$/kg' ou 'preço por kg', false caso contrário (boolean)",
  "promoPrice": "preço promocional se houver etiqueta de promoção (número ou null)",
  "validUntil": "data de validade da promoção se houver (string ISO ou null)",
  "confidence": "nível de confiança 0-100 (número)"
}

REGRAS:
- Se a etiqueta mostra "R$ 12,90 / kg" → pricePerKg: 12.90, isWeighed: true, unit: "KG"
- Se mostra "R$ 5,99 un" ou "R$ 5,99 pacote" → price: 5.99, isWeighed: false, unit: "UN" ou "PACK"
- Ignore textos irrelevantes (código interno, lote, etc.)
- Se não conseguir ler algum campo, use null
- Confiança baixa (< 50) se imagem borrada, corte, reflexo
`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('❌ Erro no Groq Vision:', error.message);
    throw new Error('Falha ao processar imagem com Groq');
  }
}

/**
 * Valida e normaliza dados extraídos
 */
function normalizeProductData(rawData) {
  const normalized = {
    barcode: rawData.barcode ? rawData.barcode.trim() : null,
    name: rawData.name ? rawData.name.trim() : null,
    brand: rawData.brand ? rawData.brand.trim() : null,
    price: rawData.price ? parseFloat(rawData.price) : null,
    pricePerKg: rawData.pricePerKg ? parseFloat(rawData.pricePerKg) : null,
    unit: rawData.unit ? rawData.unit.toUpperCase() : 'UN',
    isWeighed: Boolean(rawData.isWeighed),
    promoPrice: rawData.promoPrice ? parseFloat(rawData.promoPrice) : null,
    validUntil: rawData.validUntil || null,
    confidence: rawData.confidence ? parseInt(rawData.confidence) : 0,
  };

  // Validações básicas
  if (!normalized.name) {
    throw new Error('Nome do produto não identificado');
  }
  if (!normalized.price && !normalized.pricePerKg) {
    throw new Error('Preço não identificado');
  }

  return normalized;
}

module.exports = {
  extractPriceTagData,
  normalizeProductData,
};