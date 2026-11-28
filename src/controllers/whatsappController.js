const { processWhatsAppImage } = require('../services/whatsappService');

/**
 * Webhook para receber imagens do WhatsApp
 * Espera: multipart/form-data com 'image' (arquivo) ou JSON com 'image' (base64) e 'from'
 */
exports.receiveImage = async (req, res) => {
  try {
    let base64Image = null;
    let fromNumber = req.body.from || 'unknown';

    // Se veio arquivo via multer
    if (req.file) {
      const buffer = req.file.buffer;
      base64Image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
    }
    // Se veio base64 no body
    else if (req.body.image) {
      base64Image = req.body.image;
    }
    // Se veio URL (para testes)
    else if (req.body.imageUrl) {
      // TODO: baixar imagem da URL
      return res.status(400).json({ error: 'URL de imagem não suportada ainda. Envie base64 ou arquivo.' });
    }
    else {
      return res.status(400).json({ error: 'Imagem não enviada. Use campo "image" (base64 ou arquivo) ou "imageUrl".' });
    }

    console.log(`📥 Recebido imagem WhatsApp de ${fromNumber}`);

    // Processar imagem
    const result = await processWhatsAppImage(base64Image, fromNumber);

    // Resposta formatada para WhatsApp (texto simples)
    let replyText = '';
    if (result.success) {
      const p = result.product;
      replyText = `${result.message}\n\n` +
        `📦 ${p.name}\n` +
        (p.brand ? `🏷 Marca: ${p.brand}\n` : '') +
        (p.barcode ? `📋 Código: ${p.barcode}\n` : '') +
        (p.isWeighed
          ? `⚖️ R$ ${Number(p.pricePerKg).toFixed(2)}/kg (pesável)\n`
          : `💰 R$ ${Number(p.price).toFixed(2)} ${p.unit}\n`) +
        (p.salePrice ? `🔥 Promo: R$ ${Number(p.salePrice).toFixed(2)}\n` : '') +
        `📂 Categoria: ${p.category}\n` +
        `🎯 Confiança: ${result.confidence}%`;
    } else {
      replyText = `❌ ${result.message}\n\nTente enviar uma foto mais nítida da etiqueta de preço.`;
    }

    res.json({
      success: result.success,
      message: result.message,
      product: result.product,
      confidence: result.confidence,
      whatsappReply: replyText, // Texto pronto para responder no WhatsApp
    });

  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao processar imagem',
      error: error.message,
    });
  }
};

/**
 * Endpoint simples para testar via POST JSON
 */
exports.testImage = async (req, res) => {
  return exports.receiveImage(req, res);
};

/**
 * Status do serviço
 */
exports.status = (req, res) => {
  res.json({
    service: 'CEASA WhatsApp OCR',
    status: 'online',
    groq: process.env.GROQ_API_KEY ? 'configured' : 'missing_key',
    endpoints: {
      receive: 'POST /api/whatsapp/image (multipart ou JSON {image, from})',
      test: 'POST /api/whatsapp/test',
    },
  });
};