# Frontend — Mercado Online CEASA Irajá → Copacabana

Frontend mobile-first para um supermercado online completo, com abastecimento inicial planejado a partir de fornecedores do CEASA de Irajá e atendimento inicial em Copacabana, Rio de Janeiro.

**Versão de trabalho:** 0.2.0  
**Branch de evolução:** `feat/market-foundation-v0.2.0`

## Requisitos
- Node.js 20 ou superior
- npm

## Executar
```bash
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite (normalmente http://localhost:5173).

## Validar build
```bash
npm run build
```

## Escopo de produto definido
- Supermercado completo: hortifrúti, açougue/proteínas, laticínios, mercearia, padaria, bebidas, congelados, limpeza, higiene, pet shop e utilidades.
- Catálogo escalável, com departamentos e categorias dirigidos por dados.
- Um carrinho e pedido principal com suporte conceitual a múltiplos agrupamentos e entregas.
- Interface premium e mobile-first.
- Marca comercial ainda não definida.

## O que existe nesta branch
- Home ampliada para mercado multidepartamental.
- Navegação por departamentos.
- Busca local por nome e categoria.
- Produtos demonstrativos de diferentes departamentos.
- Carrinho local com quantidades e subtotal estimado.
- Prévia demonstrativa de agrupamentos operacionais no carrinho.
- Documentação de arquitetura, catálogo e múltiplas entregas em `docs/`.

## Dados demonstrativos e limites
Produtos, preços, imagens, ofertas e textos são ilustrativos. Não representam cotação confirmada do CEASA, disponibilidade real ou estoque. O carrinho e os agrupamentos ainda são locais e demonstrativos. Não há backend, autenticação, checkout real, cálculo de frete, confirmação de entregas, pagamento ou integração com fornecedores nesta etapa.

A divisão apresentada no carrinho é uma prévia por grupo operacional de origem, não uma promessa de que cada grupo será uma entrega separada. A operação poderá consolidar grupos em uma mesma entrega.

## Documentação
- [Arquitetura do frontend](docs/FRONTEND_ARCHITECTURE.md)
- [Modelo de catálogo escalável](docs/CATALOG_MODEL.md)
- [Carrinho e múltiplas entregas](docs/MULTI_DELIVERY.md)

## Próximas etapas
1. Validar visualmente a home e os departamentos em celular.
2. Corrigir/validar as imagens demonstrativas e definir política de assets.
3. Formalizar as regras de peso, substituição, disponibilidade e preço.
4. Implementar checkout e contratos da API.
5. Integrar pedidos, fulfillments, entregas e pagamentos com backend.
6. Adicionar testes automatizados e pipeline CI.

## Build
Execute `npm run build` antes de publicar. A alteração nesta branch ainda precisa ser instalada e validada localmente; não declare o build aprovado até executar o comando.
