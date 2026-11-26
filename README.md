# Frontend — CEASA Irajá → Copacabana

Primeira interface do aplicativo do cliente, com foco mobile e identidade premium sem marca comercial definida.

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

## O que já funciona
- Navegação inferior entre Início, Categorias, Carrinho e Perfil
- Busca por nome de produto
- Filtro por categoria
- Adição e remoção de itens
- Quantidade por produto e subtotal estimado
- Aviso de confirmação ao adicionar ao carrinho
- Layout responsivo com prioridade para celular

## Dados demonstrativos
Produtos, preços, imagens, ofertas e textos são ilustrativos. Não representam cotação confirmada do CEASA nem disponibilidade real. Não há backend, autenticação, checkout ou integração de pagamento nesta etapa.

## Próximas etapas sugeridas
1. Validar identidade visual e catálogo inicial.
2. Definir regras de itens pesáveis, tolerância de peso e substituições.
3. Implementar fluxo de endereço e janela de entrega.
4. Conectar catálogo e carrinho à API quando o contrato estiver definido.
