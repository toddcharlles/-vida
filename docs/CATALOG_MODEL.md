# Modelo de Catálogo Escalável

**Versão:** 0.2.0  
**Escopo:** supermercado completo + pet shop + utilidades.

## 1. Taxonomia inicial

A taxonomia é uma configuração inicial, não uma enumeração fechada no código.

1. Hortifrúti: frutas, legumes, verduras, temperos, raízes e tubérculos.
2. Açougue e proteínas: bovinos, suínos, aves, peixes, ovos e frios.
3. Laticínios e refrigerados: leite, queijos, iogurtes, manteiga e derivados.
4. Mercearia: arroz, feijão, massas, farinhas, café, açúcar, óleos e conservas.
5. Padaria e confeitaria: pães, bolos, biscoitos, doces e confeitaria.
6. Bebidas: água, sucos, refrigerantes e demais bebidas permitidas pela política comercial.
7. Congelados: vegetais, carnes, polpas, pizzas e refeições.
8. Limpeza e casa: detergentes, sabões, desinfetantes, papel e descartáveis.
9. Higiene e cuidados pessoais: higiene bucal, cabelo, pele e cuidados pessoais.
10. Pet shop: rações, petiscos, higiene e acessórios.
11. Utilidades: utensílios, organização e acessórios domésticos.

Departamentos, categorias e subcategorias devem ser administráveis sem publicação de uma nova versão do frontend.

## 2. Entidades

### Department
- id
- name
- slug
- description
- image
- sortOrder
- active

### Category
- id
- departmentId
- parentCategoryId opcional
- name
- slug
- image
- sortOrder
- active

### Product
- id
- slug
- name
- shortDescription
- description
- brandId opcional
- categoryId
- barcode opcional (EAN/GTIN)
- images
- attributes
- storageInstructions
- active

### ProductVariant
- id
- productId
- sku
- label
- unit
- netQuantity
- netUnit
- isWeighed
- minQuantity
- quantityStep
- active

### Brand
- id
- name
- slug
- logo opcional

### Supplier
- id
- name
- active
- operational metadata

### SupplierOffer
- id
- supplierId
- productVariantId
- price
- promotionalPrice opcional
- validFrom
- validUntil
- availability
- minimumOrderQuantity opcional
- source/reference metadata

### ProductImage
- id
- productId
- url
- alt
- sortOrder

### ProductAttribute
Atributos flexíveis por categoria, como corte, origem, teor, sabor, tamanho, material, voltagem ou composição. Não forçar todos os atributos a uma estrutura universal de colunas.

## 3. Unidades

O catálogo deve contemplar, no mínimo:
- KG, G
- L, ML
- UN
- PACK
- BOX
- BUNCH (maço)

A unidade exibida deve ser explícita. Quantidade, unidade de preço e unidade de venda não devem ser confundidas.

## 4. Produtos pesáveis

Para itens vendidos por peso:
- Mostrar preço por kg.
- Permitir quantidade estimada ou faixa, conforme regra operacional.
- Informar que o valor final depende da pesagem.
- Armazenar preferência de substituição e tolerância quando o negócio definir essas regras.
- Não cobrar diferença sem autorização compatível com a política definida.
- Revalidar peso e preço final antes da cobrança.

## 5. Preço e disponibilidade

Preço e disponibilidade não são atributos imutáveis do produto. São dados de oferta, com origem, validade e fornecedor.

O frontend pode exibir preço em cache, mas:
- O servidor é a fonte de verdade.
- O checkout deve revalidar ofertas.
- Ofertas vencidas devem ser substituídas ou submetidas à aprovação do cliente.
- Mudanças devem ser apresentadas antes da confirmação.

## 6. API e paginação esperadas

Exemplos de contratos futuros:
- GET /api/v1/departments
- GET /api/v1/categories?parentId=
- GET /api/v1/products?categoryId=&cursor=&limit=
- GET /api/v1/products/:slug
- GET /api/v1/search?q=&cursor=&limit=
- GET /api/v1/products/:id/offers

Filtros possíveis:
- departmentId
- categoryId
- brandId
- minPrice / maxPrice
- availability
- dietary/technical attributes aplicáveis
- sort

O backend deve impor limites de paginação e validar filtros.

## 7. Dados demonstrativos

Os dados mockados no frontend servem apenas para desenvolvimento visual. Não representam preços confirmados, cotação CEASA, estoque ou disponibilidade comercial.
