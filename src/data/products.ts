export type Product = {
  id: number
  name: string
  category: string
  unit: string
  price: number
  oldPrice?: number
  tag?: string
  image: string
  description: string
}

export const categories = [
  { name: 'Todos', icon: '✳' },
  { name: 'Frutas', icon: '🍊' },
  { name: 'Legumes', icon: '🥕' },
  { name: 'Verduras', icon: '🥬' },
  { name: 'Temperos', icon: '🌿' },
]

export const products: Product[] = [
  { id: 1, name: 'Banana prata', category: 'Frutas', unit: 'kg', price: 5.99, oldPrice: 7.49, tag: 'Oferta do dia', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=700&auto=format&fit=crop&q=85', description: 'Selecionada, no ponto ideal para consumir.' },
  { id: 2, name: 'Tomate italiano', category: 'Legumes', unit: 'kg', price: 6.49, oldPrice: 8.99, tag: 'Mais pedido', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=700&auto=format&fit=crop&q=85', description: 'Firme, suculento e ótimo para saladas e molhos.' },
  { id: 3, name: 'Abacate', category: 'Frutas', unit: 'unidade', price: 4.5, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=700&auto=format&fit=crop&q=85', description: 'Fruta fresca, selecionada uma a uma.' },
  { id: 4, name: 'Alface crespa', category: 'Verduras', unit: 'unidade', price: 3.99, image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=700&auto=format&fit=crop&q=85', description: 'Folhas frescas e crocantes.' },
  { id: 5, name: 'Cenoura', category: 'Legumes', unit: 'kg', price: 4.99, image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=700&auto=format&fit=crop&q=85', description: 'Boa textura e cor intensa.' },
  { id: 6, name: 'Limão tahiti', category: 'Frutas', unit: 'kg', price: 3.79, image: 'https://images.unsplash.com/photo-1513558161293-c daf?auto=format&fit=crop&q=85', description: 'Fresquinho para sucos e receitas.' },
  { id: 7, name: 'Cebolinha', category: 'Temperos', unit: 'maço', price: 2.99, image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=700&auto=format&fit=crop&q=85', description: 'Aroma fresco para finalizar seus pratos.' },
  { id: 8, name: 'Batata inglesa', category: 'Legumes', unit: 'kg', price: 5.49, image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber?auto=format&fit=crop&q=85', description: 'Versátil para o dia a dia.' },
]