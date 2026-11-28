import type { Department } from '../types/catalog'

// Taxonomia baseada no plano de 213 SKUs para CEASA Copacabana
export const departments: Department[] = [
  { id: 'drinks', name: 'Bebidas', slug: 'bebidas', icon: '🧃', description: 'Água, refrigerantes, sucos, energéticos, cervejas e vinhos', active: true, sortOrder: 1 },
  { id: 'grocery', name: 'Mercearia', slug: 'mercearia', icon: '🛒', description: 'Arroz, feijão, massas, molhos, conservas, café, condimentos', active: true, sortOrder: 2 },
  { id: 'produce', name: 'Hortifrúti', slug: 'hortifruti', icon: '🥬', description: 'Frutas, legumes, verduras e temperos frescos', active: true, sortOrder: 3 },
  { id: 'meat', name: 'Carnes e proteínas', slug: 'carnes-proteinas', icon: '🥩', description: 'Frango, bovinos, suínos, pescados, ovos e embutidos', active: true, sortOrder: 4 },
  { id: 'dairy', name: 'Laticínios e frios', slug: 'laticinios-frios', icon: '🥛', description: 'Leites, queijos, iogurtes, manteiga, frios e requeijão', active: true, sortOrder: 5 },
  { id: 'frozen', name: 'Congelados', slug: 'congelados', icon: '🧊', description: 'Batata frita, nuggets, lasanhas, pizzas, pão de queijo, polpas', active: true, sortOrder: 6 },
  { id: 'snacks', name: 'Snacks e conveniência', slug: 'snacks-conveniencia', icon: '🍿', description: 'Chips, salgadinhos, chocolates, biscoitos, barras, sanduíches', active: true, sortOrder: 7 },
  { id: 'cleaning', name: 'Higiene e limpeza', slug: 'higiene-limpeza', icon: '🧼', description: 'Detergentes, sabões, amaciantes, papel higiênico, higiene pessoal', active: true, sortOrder: 8 },
]