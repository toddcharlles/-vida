import type { Department } from '../types/catalog'

// Taxonomia demonstrativa. A versão integrada deverá vir da API.
export const departments: Department[] = [
  { id: 'produce', name: 'Hortifrúti', slug: 'hortifruti', icon: '🥬', description: 'Frutas, legumes, verduras e temperos', active: true, sortOrder: 1 },
  { id: 'meat', name: 'Açougue e proteínas', slug: 'acougue-proteinas', icon: '🥩', description: 'Carnes, aves, peixes, ovos e frios', active: true, sortOrder: 2 },
  { id: 'dairy', name: 'Laticínios e refrigerados', slug: 'laticinios', icon: '🥛', description: 'Leites, queijos, iogurtes e derivados', active: true, sortOrder: 3 },
  { id: 'grocery', name: 'Mercearia', slug: 'mercearia', icon: '🛒', description: 'Alimentos, grãos, massas e conservas', active: true, sortOrder: 4 },
  { id: 'bakery', name: 'Padaria e confeitaria', slug: 'padaria', icon: '🥖', description: 'Pães, bolos e doces', active: true, sortOrder: 5 },
  { id: 'drinks', name: 'Bebidas', slug: 'bebidas', icon: '🧃', description: 'Água, sucos e bebidas', active: true, sortOrder: 6 },
  { id: 'frozen', name: 'Congelados', slug: 'congelados', icon: '🧊', description: 'Congelados e refeições práticas', active: true, sortOrder: 7 },
  { id: 'cleaning', name: 'Limpeza e casa', slug: 'limpeza-casa', icon: '🧼', description: 'Limpeza, papel e descartáveis', active: true, sortOrder: 8 },
  { id: 'personal-care', name: 'Higiene e cuidados', slug: 'higiene-cuidados', icon: '🧴', description: 'Higiene pessoal e beleza', active: true, sortOrder: 9 },
  { id: 'pet', name: 'Pet shop', slug: 'pet-shop', icon: '🐾', description: 'Rações, petiscos e acessórios', active: true, sortOrder: 10 },
  { id: 'utilities', name: 'Utilidades', slug: 'utilidades', icon: '🏠', description: 'Utensílios e organização da casa', active: true, sortOrder: 11 },
]
