# Pedidos com Múltiplas Entregas — UX e Modelo

## 1. Princípio
O cliente realiza uma compra e recebe um único número de pedido. A operação pode dividir o atendimento em vários agrupamentos e entregas por fornecedor, setor, armazenamento, disponibilidade ou janela logística.

O pedido principal reúne itens, totais e entregas. Não criar pedidos independentes para cada grupo sem necessidade.

## 2. Distinções
- Order: compromisso comercial único do cliente.
- Fulfillment: grupo operacional de itens separado/atendido em conjunto.
- Delivery: entrega física de um fulfillment ou conjunto de fulfillments.
- Payment: registro financeiro, que pode ser consolidado ou parcial conforme política definida.

Um fulfillment não é necessariamente uma entrega. Vários fulfillments podem ser consolidados em uma entrega; um pedido pode gerar entregas em momentos diferentes.

## 3. Tela do pedido
Exibir número e data, endereço, total e fretes, status agregado, lista de entregas, itens por entrega, previsão/janela, status individual e comprovantes disponíveis.

Status agregado possíveis: Aguardando confirmação, Em preparação, Parcialmente entregue, Entregue, Cancelado ou Ação necessária.

Estados de entrega: PENDING, SCHEDULED, PICKING, READY, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED e CANCELLED.

O status agregado deve ser derivado dos estados de todas as entregas pelo backend, não inferido livremente pelo frontend.

## 4. Checkout
Apresentar endereço, itens, substituições, entregas previstas, janela/previsão de cada entrega, frete de cada entrega, total consolidado, pagamento e confirmação explícita.

Se o agrupamento logístico ainda não estiver definido, mostrar estimativa e não prometer quantidade, horário ou frete definitivo.

## 5. Pagamento na entrega
O modelo inicial prevê Pix, dinheiro ou cartão em maquininha. A UI deve comportar total do pedido, valor por entrega quando cobrado separadamente, valor recebido, saldo pendente, método e comprovante.

A política final — cobrança por entrega ou consolidada — permanece pendente. O frontend não deve assumir uma opção.

## 6. Pesagem e divergências
Diferenciar valor estimado no carrinho, valor confirmado após pesagem, diferença submetida à aprovação conforme política autorizada e valor efetivamente cobrado.

## 7. Falha e entrega parcial
Falha em uma entrega não marca o pedido inteiro como falho se outras foram concluídas. Mostrar o que foi entregue, pendente, motivo conhecido e ação disponível. Reembolso e nova tentativa dependem do backend.

## 8. Critérios de aceite
- Um pedido contém itens de diferentes departamentos.
- Um pedido apresenta várias entregas.
- Cada entrega exibe itens e estado próprios.
- O status geral representa estados parciais.
- O total inclui fretes conhecidos sem duplicidade.
- A interface não afirma rastreamento em tempo real sem integração real.
