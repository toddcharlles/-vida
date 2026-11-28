export type ProductUnit = 'KG' | 'G' | 'L' | 'ML' | 'UNIT' | 'PACKAGE' | 'BOX' | 'BUNCH'

export type Department = {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  active: boolean
  sortOrder: number
}

export type Category = {
  id: string
  departmentId: string
  name: string
  slug: string
  active: boolean
}

export type Product = {
  id: string
  slug: string
  name: string
  departmentId: string
  category: string
  description: string
  unit: ProductUnit
  price: number
  previousPrice?: number
  image: string
  badge?: string
  isWeighed: boolean
  active: boolean
  supplierGroup: string
  requiresRefrigeration?: boolean
  barcode?: string
}

export type CartLine = {
  productId: string
  quantity: number
  estimatedUnitPrice: number
  departmentId: string
  supplierGroup: string
}

export type DeliveryGroup = {
  id: string
  title: string
  description: string
  productIds: string[]
  status: 'preview' | 'pending' | 'scheduled'
}
