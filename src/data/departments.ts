import type { Department } from '../types/catalog'

/**
 * Seed demonstrativo da navegação.
 * Em produção, departamentos e categorias devem vir da API.
 */
export const departments: Department[] = [
  { id: 'produce', name: 'Hortifrúti', slug: 'hortifruti', description: 'Frutas, legumes, verduras e temperos.', icon: '🥬', sortOrder: 1, active: true },
  { id: 'meat', name: 'Açougue e proteínas', slug: 'acougue-proteinas', description: 'Carnes, aves, peixes, ovos e frios.', icon: '🥩', sortOrder: 2, active: true },
  { id: 'dairy', name: 'Laticínios e refrigerados', slug: 'laticinios', description: 'Leites, queijos, iogurtes e derivados.', icon: '🥛', sortOrder: 3, active: true },
  { id: 'grocery', name: 'Mercearia', slug: 'mercearia', description: 'Alimentos básicos, massas, grãos e conservas.', icon: '🛒', sortOrder: 4, active: true },
  { id: 'bakery', name: 'Padaria e confeitaria', slug: 'padaria-confeitaria', description: 'Pães, bolos, doces e biscoitos.', icon: '🥖', sortOrder: 5, active: true },
  { id: 'beverages', name: 'Bebidas', slug: 'bebidas', description: 'Água, sucos e outras bebidas.', icon: '🧃', sortOrder: 6, active: true },
  { id: 'frozen', name: 'Congelados', slug: 'congelados', description: 'Congelados, polpas e refeições.', icon: '🧊', sortOrder: 7, active: true },
  { id: 'cleaning', name: 'Limpeza e casa', slug: 'limpeza-casa', description: 'Limpeza doméstica e descartáveis.', icon: '🧽', sortOrder: 8, active: true },
  { id: 'personal-care', name: 'Higiene e cuidados pessoais', slug: 'higiene-cuidados', description: 'Higiene pessoal e cuidados diários.', icon: '🧴', sortOrder: 9, active: true },
  { id: 'pet', name: 'Pet shop', slug: 'pet-shop', description: 'Rações, petiscos, higiene e acessórios.', icon: '🐾', sortOrder: 10, active: true },
  { id: 'home', name: 'Utilidades e outros', slug: 'utilidades', description: 'Utensílios e produtos complementares.', icon: '🏠', sortOrder: 11, active: true },
]
