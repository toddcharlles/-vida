# Carrinho, Pedido e Múltiplas Entregas

**Versão:** 0.2.0

## 1. Conceito

O cliente faz uma compra em um único carrinho e recebe um pedido principal. A operação pode dividir esse pedido em vários agrupamentos de separação e em uma ou mais entregas.

Não confundir:
- Pedido: compromisso comercial único com o cliente.
- Item do pedido: produto, variante, quantidade, preço acordado e ajustes.
- Fulfillment: agrupamento operacional para compra, conferência ou separação.
- Delivery: transporte físico até um endereço/janela.
- Payment: registro financeiro de recebimentos e conciliação.

Um fulfillment pode originar uma entrega, vários fulfillments podem ser consolidados em uma entrega e um pedido pode ter várias entregas.

## 2. Modelo conceitual

```text
Order
 ├── OrderItem[]
 ├── Fulfillment[]
 │    └── FulfillmentItem[]
 ├── Delivery[]
 └── Payment[]
```

Relacionamentos devem ser explícitos. Cada FulfillmentItem referencia o OrderItem e a quantidade atribuída. Cada Delivery referencia os fulfillments/itens efetivamente transportados, permitindo entrega parcial.

## 3. Exemplo

Pedido #1001:
- Hortifrúti
- Laticínios
- Limpeza

A operação pode:
- Separar os três grupos em locais/horários distintos.
- Entregar em três viagens separadas; ou
- Consolidar dois grupos e realizar duas entregas.

A divisão não deve ser deduzida exclusivamente pelo departamento. Deve respeitar fornecedor, disponibilidade, temperatura, janela, capacidade e decisão operacional.

## 4. Estados

### Pedido
- RECEIVED
- CONFIRMED
- PROCESSING
- PARTIALLY_DELIVERED
- DELIVERED
- COMPLETED
- CANCELLED

### Fulfillment
- PENDING
- SOURCING
- PURCHASED
- RECEIVED
- PICKING
- READY
- CANCELLED

### Delivery
- SCHEDULED
- READY_FOR_DISPATCH
- IN_TRANSIT
- OUT_FOR_DELIVERY
- DELIVERED
- DELIVERY_FAILED
- CANCELLED

### Pagamento
- PENDING
- PARTIALLY_PAID
- PAID
- RECONCILIATION_REQUIRED
- REFUND_PENDING
- REFUNDED

Os estados de pedido, fulfillment, entrega e pagamento são independentes. O status agregado do pedido é calculado no backend a partir dos registros filhos e das regras de negócio.

## 5. Checkout

O checkout deve:
1. Validar endereço e área atendida.
2. Revalidar ofertas, preços e disponibilidade.
3. Calcular peso/valor estimado dos itens pesáveis.
4. Criar agrupamentos operacionais sugeridos.
5. Definir quais entregas podem ser consolidadas.
6. Apresentar quantidade de entregas, janelas e frete por entrega.
7. Exibir subtotal, fretes, descontos autorizados e total.
8. Obter consentimento para substituições e variações aplicáveis.
9. Confirmar um pedido principal.

Não apresentar uma estimativa como preço final confirmado.

## 6. Interface de acompanhamento

A tela do pedido apresenta:
- Número e resumo do pedido principal.
- Total de produtos, fretes e valor pendente.
- Um cartão por entrega.
- Itens de cada entrega.
- Janela prevista.
- Status e histórico.
- Método/estado de pagamento.

Exemplo de estado parcial:
- Pedido: PARTIALLY_DELIVERED.
- Entrega 1: DELIVERED.
- Entrega 2: IN_TRANSIT.
- Entrega 3: SCHEDULED.

## 7. Pagamento na entrega

O MVP prevê pagamento na entrega por Pix, dinheiro ou cartão em maquininha. A arquitetura deve suportar:
- Recebimento consolidado ou por entrega, conforme política operacional.
- Pagamento parcial e saldo pendente.
- Registro de método, valor, data, responsável e comprovante.
- Conciliação do total do pedido.

O frontend não deve afirmar que houve pagamento até receber confirmação registrada pelo backend/operador. Não armazenar dados de cartão.

## 8. Regras críticas

- Não duplicar cobrança por item quando ele for repartido entre entregas.
- A soma das quantidades entregues não pode exceder a quantidade confirmada.
- Uma entrega pode ser concluída enquanto outras permanecem pendentes.
- O pedido só pode ser concluído financeiramente conforme as regras de pagamento.
- Mudanças de preço, peso, substituição, frete e janela precisam de trilha e comunicação ao cliente.
- Cancelamentos e reembolsos devem preservar histórico; não apagar transações.

## 9. Limite de implementação

Este documento define o comportamento esperado. Não significa que checkout, fulfillment, roteirização, pagamentos ou acompanhamento estejam conectados a um backend nesta versão.
