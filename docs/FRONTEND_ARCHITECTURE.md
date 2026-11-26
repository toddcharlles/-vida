# Arquitetura do Frontend — Mercado Online CEASA Irajá → Copacabana

**Versão:** 0.2.0  
**Status:** especificação arquitetural  
**Aplicação:** storefront web mobile-first  
**Marca comercial:** ainda não definida

## 1. Decisões de produto

- Abrangência: supermercado completo, incluindo pet shop, utilidades e categorias complementares.
- Catálogo: escalável, com cadastro gradual e suporte a milhares de produtos.
- Entrega: um pedido pode originar múltiplos agrupamentos operacionais e múltiplas entregas.
- Experiência: premium, mobile-first, responsiva.
- Operação inicial: pedidos sob demanda, abastecimento por fornecedores do CEASA de Irajá e entrega em Copacabana.
- Pagamento previsto no MVP: na entrega, com Pix, dinheiro ou cartão em maquininha. O frontend deve representar o método e a conciliação sem presumir gateway online.

## 2. Stack

### Existente no repositório
- React 18
- TypeScript 5
- Vite 6
- CSS próprio
- lucide-react

### Adoção planejada
- React Router: rotas e navegação.
- Zustand: estado compartilhado do carrinho e preferências de entrega.
- TanStack Query: cache, paginação e sincronização com API.
- Zod: validação de payloads e formulários.
- Vitest + Testing Library: testes unitários e de componentes.
- Playwright: testes de jornadas críticas.

A adoção planejada não significa que essas dependências já estejam instaladas.

## 3. Organização de diretórios proposta

```text
src/
  app/
    App.tsx
    routes.tsx
    providers/
  components/
    layout/
    navigation/
    product/
    category/
    cart/
    delivery/
    feedback/
  features/
    home/
    catalog/
    search/
    product-details/
    cart/
    checkout/
    split-delivery/
    addresses/
    account/
    orders/
    favorites/
    promotions/
  services/
    http.ts
    catalog.service.ts
    cart.service.ts
    checkout.service.ts
    orders.service.ts
    delivery.service.ts
  store/
    cart.store.ts
    customer.store.ts
    delivery.store.ts
  hooks/
  types/
  utils/
  data/
  styles/
```

Cada feature deve concentrar componentes, hooks e tipos específicos da funcionalidade. Componentes compartilhados não devem conter regras comerciais de fornecedores ou de pedidos.

## 4. Rotas do cliente

- `/`: início.
- `/departamentos`: departamentos.
- `/departamentos/:slug`: departamento.
- `/categorias/:slug`: categoria.
- `/produto/:slug`: detalhes do produto.
- `/buscar?q=`: busca.
- `/carrinho`: carrinho.
- `/checkout`: endereço, entregas, revisão e confirmação.
- `/pedidos`: histórico.
- `/pedidos/:orderId`: resumo e acompanhamento de entregas.
- `/conta`: perfil.
- `/enderecos`: endereços.
- `/favoritos`: produtos salvos.

Rotas protegidas devem exigir autenticação quando o backend de identidade for implementado.

## 5. Design system

Tokens iniciais devem centralizar:
- Cores de marca provisórias: verdes profundos, fundos claros e acentos quentes.
- Tipografia: sans-serif para interface e serifada apenas em títulos editoriais, se mantida a direção visual atual.
- Espaçamentos, raios, sombras, elevação e breakpoints.
- Estados: padrão, hover, foco visível, pressionado, desabilitado, carregando, vazio e erro.

Acessibilidade:
- Contraste WCAG AA como meta.
- Foco visível e navegação por teclado.
- Botões com nomes acessíveis.
- Imagens com textos alternativos apropriados.
- Não depender apenas de cor para comunicar status.
- Alvos de toque confortáveis em dispositivos móveis.

## 6. Princípios do catálogo

- Não carregar o catálogo inteiro na inicialização.
- Paginação ou carregamento incremental controlado pela API.
- Busca e filtros executados no servidor quando integrados.
- Departamento, categoria e subcategoria configuráveis por dados.
- Produto separado de variante, marca, fornecedor e oferta.
- Preços e disponibilidade sempre revalidados no servidor no checkout.
- Produtos pesáveis devem exibir preço estimado e explicar a apuração do valor final.

## 7. Carrinho e checkout

O carrinho deve manter itens por identificador de produto/variante e referência da oferta escolhida quando aplicável. Não confiar em preços locais para confirmar compra.

O checkout deve:
1. Validar endereço atendido.
2. Revalidar preço e disponibilidade.
3. Identificar produtos pesáveis e suas regras.
4. Apresentar agrupamentos e possíveis entregas.
5. Mostrar frete por entrega e total geral.
6. Apresentar janelas e condições de cada entrega.
7. Registrar a confirmação e retornar um identificador de pedido.

O modelo permite múltiplas entregas, mas não obriga que cada fornecedor gere uma entrega separada. A operação pode consolidar itens de diferentes origens numa mesma rota/entrega.

## 8. Integração com API

- Base URL configurada por ambiente.
- Cliente HTTP centralizado.
- Tipos compartilhados ou gerados a partir de OpenAPI quando o backend existir.
- Tratamento uniforme de erros, autenticação e expiração de sessão.
- Cancelamento de consultas obsoletas e cache por chave.
- Nenhum segredo de servidor no bundle do navegador.

## 9. Performance

- Code splitting por rota/feature.
- Imagens responsivas e lazy loading.
- Paginação de catálogo.
- Evitar estado global para dados que pertencem ao servidor.
- Medir Core Web Vitals antes da publicação.
- PWA pode ser adicionada após validar estratégia de cache e atualização do catálogo.

## 10. Segurança e privacidade

- Validar no backend todos os preços, descontos, disponibilidade, fretes e permissões.
- Não armazenar dados de cartão.
- Não incluir dados pessoais em logs de frontend.
- Proteger rotas e tratar erros de sessão.
- Consentimento e tratamento de dados conforme LGPD.

## 11. Critérios de aceite da fundação

- Home apresenta o mercado completo, não apenas hortifrúti.
- Departamentos são renderizados a partir de dados.
- Busca e filtros suportam catálogo paginado.
- Componentes de produto suportam unidade, variante e preço estimado.
- Carrinho suporta itens de departamentos diferentes.
- Modelo visual suporta mais de um agrupamento/entrega.
- Estados de carregamento, vazio e erro existem.
- Layout funciona a partir de 320 px.
- Build TypeScript e testes passam antes de considerar a entrega validada.

## 12. Limites desta versão

Esta documentação define arquitetura e contratos esperados. Não afirma que backend, autenticação, pagamento, estoque, disponibilidade real, logística ou múltiplas entregas estejam implementados. Os dados atuais do protótipo são demonstrativos.
