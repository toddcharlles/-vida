export type ProductUnit =
  | 'KG'
  | 'G'
  | 'UNIT'
  | 'PACKAGE'
  | 'LITER'
  | 'ML'
  | 'DOZEN'
  | 'BUNDLE'

export type StorageType = 'AMBIENT' | 'CHILLED' | 'FROZEN'

export interface Department {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  sortOrder: number
  active: boolean
}

export interface Category {
  id: string
  departmentId: string
  parentId?: string
  name: string
  slug: string
  sortOrder: number
  active: boolean
}

export interface ProductVariant {
  id: string
  productId: string
  label: string
  barcode?: string
  unit: ProductUnit
  netQuantity?: number
  netUnit?: ProductUnit
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  categoryId: string
  brandId?: string
  variantIds: string[]
  imageUrls: string[]
  attributes: Record<string, string | number | boolean>
  isWeighed: boolean
  storageType?: StorageType
  active: boolean
}

export interface SupplierOffer {
  id: string
  productVariantId: string
  supplierId: string
  price: number
  currency: 'BRL'
  unit: ProductUnit
  validFrom: string
  validUntil?: string
  available: boolean
}

export interface CatalogPage<T> {
  items: T[]
  nextCursor?: string
  total?: number
}
