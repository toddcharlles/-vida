# Catálogo e Carrinho — Especificação do Frontend

## 1. Departamentos iniciais
1. Hortifrúti
2. Açougue e proteínas
3. Laticínios e refrigerados
4. Mercearia
5. Padaria e confeitaria
6. Bebidas
7. Congelados
8. Limpeza e casa
9. Higiene e cuidados pessoais
10. Pet shop
11. Utilidades e outros

A lista é uma configuração inicial, não uma enumeração fechada. O backend deverá permitir criar, renomear, ordenar, ativar e desativar departamentos e categorias.

## 2. Modelo conceitual
- Department: agrupamento comercial de primeiro nível.
- Category: categoria dentro de departamento.
- Subcategory: classificação adicional opcional.
- Product: identidade do produto.
- ProductVariant: tamanho, embalagem, sabor ou apresentação.
- Brand: marca.
- ProductImage: imagem e texto alternativo.
- ProductAttribute: características tipadas.
- Supplier: fornecedor.
- SupplierOffer: oferta de fornecedor.
- Price: preço, vigência, unidade e condições.
- Availability: disponibilidade por região, canal e período.

Um produto pode ter várias variantes e ofertas. Não duplicar a identidade do produto apenas porque existem fornecedores diferentes.

## 3. Tipos TypeScript conceituais
- Unit: KG, G, UNIT, PACKAGE, LITER, ML, DOZEN ou BUNDLE.
- Department: id, name, slug, description, imageUrl, sortOrder, active.
- Category: id, departmentId, parentId opcional, name, slug, sortOrder, active.
- ProductVariant: id, productId, label, barcode opcional, unit, netQuantity e netUnit opcionais.
- Product: id, slug, name, description, categoryId, brandId opcional, variantIds, imageUrls, attributes, isWeighed, storageType e active.
- SupplierOffer: id, productVariantId, supplierId, price, currency BRL, unit, validFrom, validUntil e available.

Esses tipos são contrato conceitual para o frontend. IDs, preços, estoque e vigência devem ser confirmados pelo backend.

## 4. Exibição de preço
- Exibir unidade explicitamente: R$/kg, R$/unidade, R$/pacote etc.
- Produtos pesáveis devem ser marcados como preço estimado quando a pesagem final não ocorreu.
- Preço anterior e promoção só aparecem quando fornecidos e validados pela API.
- Não usar preço fictício como preço comercial.
- Formatar moeda com Intl.NumberFormat pt-BR e BRL.

## 5. Busca e filtros
A busca deve consultar nome, marca, descrição, código de barras quando disponível e sinônimos definidos no backend. Filtros combináveis: departamento, categoria, marca, preço, disponibilidade, promoção e unidade.

Usar paginação por cursor ou página conforme contrato da API. Não baixar o catálogo completo no carregamento inicial.

## 6. Carrinho
Cada CartItem mantém productId, variantId, offerId quando aplicável, quantity, unidade, preço exibido como snapshot informativo, observações e indicação de pesável.

O snapshot não é autoridade de cobrança. Na confirmação, o servidor recalcula valores e devolve divergências para o cliente aceitar ou corrigir.

## 7. Produtos pesáveis e substituições
Permitir preferência: não substituir; sugerir substituto e pedir aprovação; aceitar substituto equivalente dentro de regras explícitas.

Para itens pesáveis, permitir quantidade estimada e apresentar tolerância somente quando a política comercial estiver definida. Não cobrar variação não autorizada.

## 8. Dados demonstrativos
Seeds locais devem ser identificados como mock/demo. Nunca misturar preço fictício com preço real sem identificação. Produtos sem oferta válida devem aparecer indisponíveis ou ocultos conforme regra de negócio.
