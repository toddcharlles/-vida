# Frontend — Mercado Online CEASA Irajá → Copacabana

Protótipo mobile-first em React, TypeScript e Vite. A identidade visual premium iniciada na versão 0.1.0 será preservada e evoluída para um supermercado completo.

## Escopo definido
- Supermercado completo, incluindo hortifrúti, açougue e proteínas, laticínios, mercearia, padaria, bebidas, congelados, limpeza, higiene, pet shop e utilidades.
- Catálogo escalável, preparado para milhares de produtos e carregamento paginado.
- Um pedido principal pode conter várias entregas independentes.
- Interface mobile-first e marca comercial ainda em definição.

## Estado atual do código
A branch main contém o protótipo inicial: home de hortifrúti, busca local, filtro simples, carrinho local e perfil demonstrativo. Ainda não há backend, autenticação real, checkout, pagamento, integração com fornecedores ou acompanhamento de entregas.

A branch de trabalho feat/mercado-completo-foundation contém a documentação arquitetural revisada. A documentação descreve o estado atual e o que ainda precisa ser implementado; não significa que as funcionalidades futuras já estejam codificadas.

## Documentação
- [Arquitetura do frontend](docs/FRONTEND_ARCHITECTURE.md)
- [Catálogo e carrinho](docs/CATALOG_AND_CART.md)
- [Pedidos com múltiplas entregas](docs/MULTIPLE_DELIVERIES.md)
- [Roadmap e critérios de aceite](docs/FRONTEND_ROADMAP.md)

## Requisitos
- Node.js 20 ou superior
- npm

## Executar localmente
```bash
npm install
npm run dev
```

## Validar build
```bash
npm run build
```

## Dados demonstrativos
Produtos, preços, imagens e ofertas locais são exemplos para desenvolvimento. Não representam cotação confirmada do CEASA, estoque ou disponibilidade real. Não utilizar para venda sem integração e validação operacional.

## Próxima etapa
Implementar a fundação 0.2.0: estrutura por funcionalidades, home multidepartamental, catálogo tipado, busca global e carrinho preparado para múltiplas entregas.
