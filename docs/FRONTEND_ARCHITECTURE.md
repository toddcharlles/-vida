# Arquitetura do Frontend — Mercado Online

Projeto: CEASA Irajá → Copacabana  
Versão-alvo: 0.2.0  
Status: especificação técnica para implementação  
Interface: mobile-first, premium  
Abrangência: supermercado completo, pet shop e utilidades  
Catálogo: escalável e orientado a dados  
Entrega: múltiplas entregas vinculadas a um pedido

## 1. Objetivo
Evoluir o protótipo inicial de hortifrúti para uma experiência de supermercado completo. A interface deve suportar novos departamentos, milhares de produtos, diferentes unidades de venda, ofertas de fornecedores, itens pesáveis e pedidos que possam resultar em mais de uma entrega.

O frontend não decide preço final, disponibilidade, agrupamento logístico definitivo ou regras financeiras. Essas decisões são validadas pelo backend.

## 2. Estado atual
A branch main contém um protótipo React 18 + TypeScript + Vite, com CSS próprio e lucide-react. A home, busca simples, filtro de categoria e carrinho local estão concentrados em src/App.tsx. Os dados demonstrativos estão em src/data/products.ts.

Ainda não estão implementados: API, autenticação, persistência de carrinho, checkout real, seleção de janelas, pagamentos, acompanhamento de entregas e painel operacional. Os dados e preços atuais são ilustrativos.

## 3. Decisões arquiteturais
- Manter React, TypeScript e Vite.
- Preservar a identidade visual premium já iniciada.
- Adotar organização por funcionalidades (feature-oriented).
- Separar componentes, regras de apresentação, serviços HTTP, estado e tipos.
- Carregar catálogo sob demanda, com paginação e filtros remotos.
- Separar produto de catálogo das ofertas e preços de fornecedores.
- Representar um pedido principal com vários agrupamentos de atendimento e entregas.
- Não declarar o pedido concluído antes de todas as entregas.
- Identificar explicitamente dados demonstrativos.

## 4. Stack proposta
| Tecnologia | Uso | Situação |
|---|---|---|
| React 18 | UI | instalada |
| TypeScript | Tipagem | instalada |
| Vite | Build/dev server | instalado |
| lucide-react | Ícones | instalada |
| React Router | Rotas | a adicionar |
| Zustand | Estado compartilhado | a adicionar |
| TanStack Query | Cache e consultas API | a adicionar |
| Zod | Validação | a adicionar |
| Vitest + Testing Library | Testes | a adicionar |
| Playwright | Testes E2E | a adicionar |

Confirmar versões compatíveis antes de alterar dependências.

## 5. Estrutura de diretórios-alvo
- src/app: App, router e providers.
- src/components: layout, navegação, feedback, produto, categoria, carrinho e entrega.
- src/features: home, catálogo, busca, detalhes, carrinho, checkout, entregas múltiplas, endereços, conta, pedidos, favoritos e promoções.
- src/services: cliente HTTP e serviços de catálogo, carrinho, checkout, pedidos, entrega e conta.
- src/store: estado do carrinho, cliente e entrega.
- src/hooks, src/types, src/utils, src/data e src/styles.

Cada feature deve manter componentes, hooks, tipos e testes próximos quando isso melhorar a coesão. Componentes compartilhados não devem conter regras específicas de uma tela.

## 6. Rotas previstas
- / — início
- /departamentos — departamentos
- /departamentos/:slug — departamento
- /categorias/:slug — categoria
- /produto/:slug — detalhes
- /busca?q= — resultados
- /carrinho — carrinho
- /checkout — revisão e confirmação
- /pedidos — histórico
- /pedidos/:orderId — pedido e entregas
- /conta — perfil
- /enderecos — endereços
- /favoritos — favoritos

A navegação inferior mobile prioriza Início, Departamentos, Carrinho e Conta.

## 7. Design system
Criar tokens CSS para cores, tipografia, espaçamento, raios, sombras, largura de conteúdo e camadas. Preservar a paleta verde natural e tons quentes existentes, garantindo contraste adequado.

Componentes-base: Button, IconButton, SearchInput, Badge, Price, QuantityStepper, ProductCard, DepartmentTile, EmptyState, Skeleton, Toast, Modal/Drawer, AddressSummary, DeliveryCard e OrderStatus.

Requisitos: largura mínima 320 px; áreas de toque confortáveis; estados focus-visible, disabled e loading; teclado; textos alternativos; prefers-reduced-motion; safe-area mobile.

## 8. Catálogo e desempenho
Não carregar milhares de produtos de uma vez. A API deve oferecer paginação, ordenação e filtros. A interface deve suportar busca textual, departamento, categoria, marca, faixa de preço, disponibilidade, ofertas e unidade. O estado dos filtros deve ser refletido na URL quando apropriado.

## 9. Carrinho e preço
O carrinho mantém produto, variante, quantidade e referência da oferta selecionada. Para produtos pesáveis, apresenta preço estimado. O servidor revalida preços e disponibilidade antes da confirmação. O frontend nunca é fonte autoritativa de cobrança.

## 10. Segurança, erros e qualidade
Tratar loading, vazio, erro e retry. Não armazenar segredos no bundle. Não confiar no estado do navegador para preço ou pedido. Validar entradas. Usar imagens responsivas e lazy loading. Não expor dados pessoais além do necessário.

## 11. Critérios de aceite da fundação
1. Home apresenta todos os departamentos.
2. Departamentos e categorias são dirigidos por dados.
3. Busca global funciona sobre catálogo demonstrativo tipado.
4. Produto suporta unidade, variante e preço estimado.
5. Carrinho aceita itens de departamentos diferentes.
6. Modelo representa pedido com múltiplas entregas.
7. Navegação mobile e rotas principais estão definidas.
8. Documentação distingue implementado de planejado.
9. Build passa após implementação.
10. Testes cobrem busca, carrinho e entregas múltiplas.

## 12. Fora do escopo
Backend, banco de dados, autenticação real, integração com fornecedores, pagamento online, GPS em tempo real e painel administrativo. O frontend será preparado para integração, sem simular esses recursos como reais.
