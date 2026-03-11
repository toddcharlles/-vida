# Fábrica de Picolé - Sistema de Gestão

Sistema completo para gerenciamento de fábrica de picolés, incluindo controle de estoque, produtos, insumos, vendedores e pedidos.

## Funcionalidades

- **Autenticação** - Login com perfis de admin e vendedor
- **Dashboard** - Visão geral com indicadores e alertas de estoque baixo
- **Produtos** - CRUD de picolés com categorias (Normal, Proteico, Energético, Isotônico)
- **Estoque de Produtos** - Controle de entrada/saída de produtos fabricados
- **Insumos** - Gestão de matérias-primas com movimentações
- **Vendedores** - Cadastro e gestão de vendedores
- **Pedidos** - Vendedores fazem pedidos pelo sistema, admin aprova/gerencia

## Tecnologias

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM + SQLite
- Tailwind CSS

## Como executar

```bash
npm install
npx prisma migrate dev
npm run dev
```

Acesse http://localhost:3000

### Credenciais padrão

- **Admin:** admin@picole.com / admin123
