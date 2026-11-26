# Roadmap do Frontend — Versão 0.2.0

## Objetivo
Construir a fundação de um supermercado completo preservando a identidade visual do protótipo. A versão 0.2.0 não representa operação comercial pronta: os dados continuam demonstrativos até integração com API e validação operacional.

## Etapas

### 1. Fundação
- Reorganizar diretórios por funcionalidade.
- Definir rotas.
- Criar tokens e componentes-base.
- Padronizar loading, vazio e erro.
- Corrigir dados e imagens demonstrativas inválidas.

### 2. Home e departamentos
- Apresentar os 11 departamentos iniciais.
- Criar áreas de promoção e categorias dinâmicas.
- Permitir navegação por departamento/categoria.
- Manter a home utilizável em telas pequenas.

### 3. Catálogo
- Modelos tipados de produto, variante, unidade e oferta.
- Busca global, filtros e ordenação.
- Paginação preparada para API.
- Detalhes de produto e disponibilidade.

### 4. Carrinho
- Itens de vários departamentos.
- Variantes e quantidades.
- Produtos pesáveis.
- Subtotal estimado, edição e remoção.
- Revalidação por API planejada.

### 5. Múltiplas entregas
- Representação de fulfillments.
- Agrupamento visual de itens.
- Frete e janela por entrega.
- Pedido principal com várias entregas.
- Status agregado e individual.

### 6. Conta e pedidos
- Conta e endereços.
- Histórico e detalhes do pedido.
- Acompanhamento individual das entregas.

### 7. Qualidade
- Testes de componentes e regras.
- Acessibilidade e responsividade.
- Build de produção.
- Revisão de conteúdo e imagens.

## Critérios de aceite
- [ ] Home com supermercado completo, não apenas hortifrúti.
- [ ] Departamentos renderizados por dados.
- [ ] Busca por nome e filtro por departamento/categoria.
- [ ] Produto suporta variantes, marca e unidade.
- [ ] Carrinho aceita produtos de diferentes departamentos.
- [ ] Pedido pode ser representado com várias entregas.
- [ ] Estados individuais e estado agregado corretos.
- [ ] Preços de pesáveis identificados como estimados.
- [ ] Nenhuma integração fictícia apresentada como real.
- [ ] Build e testes executados e resultados documentados.

## Limites
Backend, banco, autenticação real, fornecedores, pagamentos, logística e rastreamento ficam fora desta fundação. Contratos de API devem ser alinhados antes de conectar dados reais.
