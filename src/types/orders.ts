export type FulfillmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'PICKING'
  | 'READY'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'ACTION_REQUIRED'

export interface CartItem {
  productId: string
  variantId: string
  offerId?: string
  quantity: number
  unit: string
  displayedUnitPrice: number
  isWeighed: boolean
  customerNote?: string
}

export interface FulfillmentItem {
  orderItemId: string
  quantity: number
  unit: string
}

export interface Fulfillment {
  id: string
  label: string
  status: FulfillmentStatus
  itemIds: string[]
}

export interface Delivery {
  id: string
  fulfillmentIds: string[]
  status: FulfillmentStatus
  addressId: string
  scheduledWindow?: {
    startsAt: string
    endsAt: string
  }
  deliveryFee?: number
}

export interface Order {
  id: string
  displayCode: string
  status: OrderStatus
  items: CartItem[]
  fulfillments: Fulfillment[]
  deliveries: Delivery[]
  subtotalEstimate: number
  deliveryFeeEstimate: number
  totalEstimate: number
  createdAt: string
}
