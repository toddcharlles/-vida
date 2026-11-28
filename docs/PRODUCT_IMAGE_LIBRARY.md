# Biblioteca de Imagens de Produtos

**Versão:** 0.2.0  
**Última atualização:** 2025-01-15

## Visão Geral

Este documento descreve a organização, licenciamento e processo de validação das imagens de produtos importadas do **Open Food Facts** para o catálogo do CEASA Copacabana.

---

## 1. Fonte de Dados

### Open Food Facts
- **Base URL:** `https://world.openfoodfacts.org`
- **Licença:** Open Database License (ODbL) v1.0 + Creative Commons Attribution-ShareAlike 4.0 (CC-BY-SA 4.0)
- **API:** Endpoint de busca pública `/cgi/search.pl` (sem necessidade de chave)
- **Rate Limit:** Não oficial, recomenda-se ~2 req/s

### Termos de Pesquisa
O importador utiliza **355 termos** organizados por 10 departamentos:

| Departamento | Termos | Exemplos |
|--------------|--------|----------|
| Hortifrúti | 40 | banana, maçã, tomate, alface |
| Mercearia - Grãos | 25 | arroz, feijão, macarrão, farinha |
| Mercearia - Molhos | 20 | molho tomate, catchup, azeite |
| Mercearia - Enlatados | 20 | sardinha, atum, milho, ervilha |
| Açougue e Proteínas | 25 | picanha, frango, bacon, linguiça |
| Laticínios | 20 | leite, queijo, iogurte, manteiga |
| Padaria | 20 | pão francês, biscoito, bolo |
| Bebidas | 20 | água, suco, refrigerante, cerveja |
| Congelados | 20 | batata frita, pizza, sorvete |
| Limpeza | 20 | detergente, sabão, desinfetante |
| Higiene | 25 | shampoo, sabonete, creme dental |
| Pet Shop | 15 | ração cão, ração gato, areia |
| Utilidades | 15 | panela, frigideira, talheres |

**Total:** 355 termos

---

## 2. Estrutura do Arquivo de Saída

**Arquivo:** `src/data/product-images.json`

```json
[
  {
    "barcode": "3017620422003",
    "name": "Nutella",
    "brand": "Ferrero",
    "category": "spreads",
    "searchTerm": "creme de avelã",
    "imageUrl": "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_pt.4.full.jpg",
    "imageFrontUrl": "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_pt.4.full.jpg",
    "packaging": "Pot de 350g",
    "quantity": "350 g",
    "licenses": ["cc-by-sa-4.0"],
    "source": "openfoodfacts",
    "fetchedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `barcode` | string | Código EAN/GTIN do produto (chave única) |
| `name` | string | Nome do produto (preferência: pt-BR) |
| `brand` | string | Marca fabricante |
| `category` | string | Categoria Open Food Facts (tag principal) |
| `searchTerm` | string | Termo que encontrou este produto |
| `imageUrl` | string | URL da melhor imagem disponível |
| `imageFrontUrl` | string | URL da imagem frontal (se diferente) |
| `packaging` | string | Descrição da embalagem |
| `quantity` | string | Quantidade/peso líquido |
| `licenses` | string[] | Licenças detectadas (ex: `cc-by-sa-4.0`) |
| `source` | string | Sempre `openfoodfacts` |
| `fetchedAt` | string | ISO 8601 da importação |

---

## 3. Licenciamento e Uso Comercial

### Licenças Comuns no Open Food Facts

| Licença | Código | Uso Comercial | Atribuição | Compartilha Igual |
|---------|--------|---------------|------------|-------------------|
| CC0 / Domínio Público | `public-domain` | ✅ | Não obrigatória | Não |
| CC-BY 4.0 | `cc-by-4.0` | ✅ | **Obrigatória** | Não |
| CC-BY-SA 4.0 | `cc-by-sa-4.0` | ✅ | **Obrigatória** | **Sim** |
| CC-BY-NC 4.0 | `cc-by-nc-4.0` | ❌ Não comercial | Obrigatória | Sim |
| ODbL | `odbl-1.0` | ✅ | Obrigatória | Sim (share-alike) |

### Regras para o CEASA Copacabana

1. **✅ Permitido:** Imagens com `cc-by`, `cc-by-sa`, `public-domain`, `odbl`
2. **⚠️ Atenção:** `cc-by-sa` e `odbl` exigem compartilhar derivações sob mesma licença
3. **❌ Proibido:** `cc-by-nc` (não comercial), `cc-by-nd` (sem derivações)
4. **❓ Verificar manualmente:** Produtos marcados como `verificar-manualmente`

### Atribuição Obrigatória (quando aplicável)

Para imagens CC-BY/CC-BY-SA/ODbL, incluir no rodapé do app ou tela de créditos:

> "Imagens de produtos fornecidas por contribuidores do [Open Food Facts](https://world.openfoodfacts.org) sob licença CC-BY-SA 4.0 / ODbL 1.0."

---

## 4. Processo de Validação

### Antes de Publicar em Produção

Para **cada imagem** a ser usada no catálogo oficial:

1. **Verificar licença** no campo `licenses` do JSON
2. **Confirmar embalagem atual** - comparar foto com produto real no mercado
3. **Validar marca e variante** - ex: "Coca-Cola 350ml" ≠ "Coca-Cola Zero 350ml"
4. **Qualidade visual** - resolução mínima 400px, boa iluminação, fundo limpo
5. **Aprovação manual** - checklist assinado por responsável de catálogo

### Checklist de Validação

```
[ ] Licença permite uso comercial (CC-BY, CC-BY-SA, CC0, ODbL)
[ ] Imagem corresponde ao produto (marca, variante, embalagem)
[ ] Qualidade aceitável (≥400px, nítida, bem enquadrada)
[ ] Código de barras (EAN) confere com cadastro interno
[ ] Atribuição documentada para créditos do app
[ ] Aprovado por: _______________ Data: _______________
```

---

## 5. Como Executar

### Importação Completa (355 termos)
```powershell
npm run catalog:images
# ou
node scripts/import-open-food-facts.mjs
```

### Teste Rápido (20 termos)
```powershell
node scripts/import-open-food-facts.mjs --limit=20
```

### Simulação (Dry Run)
```powershell
node scripts/import-open-food-facts.mjs --dry-run
node scripts/import-open-food-facts.mjs --limit=20 --dry-run
```

---

## 6. Integração no Frontend

### Uso no Catálogo

```typescript
// src/data/product-images.json
import productImages from '../data/product-images.json';

function getProductImage(barcode: string) {
  const match = productImages.find(img => img.barcode === barcode);
  return match?.imageUrl || match?.imageFrontUrl;
}
```

### Fallback para Produtos Sem Imagem

```tsx
function ProductImage({ barcode, fallback }) {
  const src = getProductImage(barcode);
  return (
    <img
      src={src || fallback}
      alt={src ? "Produto" : "Imagem não disponível"}
      onError={e => e.currentTarget.src = fallback}
    />
  );
}
```

---

## 7. Atualizações Futuras

| Ação | Frequência | Responsável |
|------|------------|-------------|
| Re-importar termos | Mensal | Dev Frontend |
| Validar novas imagens | Por demanda | Catálogo/Marketing |
| Remover imagens NC | Imediato | Dev Frontend |
| Atribuir créditos | A cada release | Dev Frontend |

---

## 8. Troubleshooting

| Problema | Solução |
|----------|---------|
| `ECONNRESET` / timeout | Aumentar delay entre requests (editar script) |
| Muitas imagens `verificar-manualmente` | Revisar filtros de licença no script |
| Produtos duplicados | Script já deduplica por `barcode` (mantém `imageFrontUrl`) |
| API bloqueia IP | Usar proxy ou reduzir frequência |

---

## 9. Referências

- [Open Food Facts - API](https://world.openfoodfacts.org/data)
- [Open Food Facts - Licenses](https://world.openfoodfacts.org/licenses)
- [Creative Commons - Choose a License](https://creativecommons.org/choose/)
- [ODbL Summary](https://opendatacommons.org/licenses/odbl/summary/)

---

**Responsável técnico:** Equipe Frontend CEASA Copacabana  
**Contato:** dev@ceasa-copacabana.com