/**
 * API Service - Comunicação com o backend CEASA
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ===== PRODUTOS =====
export const productApi = {
  // Listar com filtros e paginação
  getAll: (params?: {
    categoryId?: string;
    search?: string;
    available?: boolean;
    featured?: boolean;
    isWeighed?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      products: Product[];
    }>(`/products?${searchParams.toString()}`);
  },

  // Buscar por categoria (slug)
  getByCategory: (categorySlug: string) =>
    fetchApi<Product[]>(`/products/category/${categorySlug}`),

  // Buscar por ID
  getById: (id: string) =>
    fetchApi<Product>(`/products/${id}`),

  // Buscar por código de barras
  getByBarcode: (barcode: string) =>
    fetchApi<Product>(`/products/barcode/${barcode}`),

  // Criar (admin)
  create: (data: Partial<Product>, token: string) =>
    fetchApi<Product>('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  // Atualizar (admin)
  update: (id: string, data: Partial<Product>, token: string) =>
    fetchApi<Product>(`/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  // Deletar (admin)
  delete: (id: string, token: string) =>
    fetchApi<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Toggle disponibilidade (admin)
  toggleAvailability: (id: string, token: string) =>
    fetchApi<Product>(`/products/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Atualização em lote (admin)
  bulkUpdate: (products: Array<{ id: string } & Partial<Product>>, token: string) =>
    fetchApi<{ updated: number; results: any[] }>('/products/bulk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ products }),
    }),
};

// ===== CATEGORIAS =====
export const categoryApi = {
  getAll: (activeOnly = true) =>
    fetchApi<Category[]>(`/categories${activeOnly ? '?active=true' : ''}`),

  getById: (id: string) =>
    fetchApi<Category>(`/categories/${id}`),

  create: (data: Partial<Category>, token: string) =>
    fetchApi<Category>('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Category>, token: string) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  delete: (id: string, token: string) =>
    fetchApi<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ===== AUTH =====
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    fetchApi<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    fetchApi<{ user: User }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ===== WHATSAPP OCR =====
export const whatsappApi = {
  // Enviar imagem (base64 ou arquivo)
  processImage: (imageBase64: string, from?: string) =>
    fetchApi<{
      success: boolean;
      message: string;
      product?: Product;
      confidence: number;
      whatsappReply: string;
    }>('/whatsapp/image', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, from }),
    }),

  // Status do serviço
  status: () =>
    fetchApi<{ service: string; status: string; groq: string }>('/whatsapp/status'),
};

// ===== TIPOS =====
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  pricePerKg?: number | null;
  barcode?: string | null;
  unit: 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'PACK' | 'BOX' | 'BUNCH';
  isWeighed: boolean;
  categoryId: string;
  category?: Category;
  brand?: string | null;
  image?: string | null;
  supplierGroup?: string | null;
  available: boolean;
  featured: boolean;
  lastUpdateSource?: string;
  lastWhatsAppUpdate?: string | null;
  lastOcrData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: 'admin' | 'manager' | 'operator';
  whatsappNumber?: string | null;
  active: boolean;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== USER API =====
export const userApi = {
  getProfile: (token: string) =>
    fetchApi<{ user: User }>('/user/profile', { headers: { Authorization: `Bearer ${token}` } }),

  updateProfile: (token: string, data: Partial<User>) =>
    fetchApi<{ user: User }>('/user/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  changePassword: (token: string, data: { currentPassword: string; newPassword: string }) =>
    fetchApi<{ message: string }>('/user/password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  // Addresses
  getAddresses: (token: string) =>
    fetchApi<{ addresses: any[] }>('/user/addresses', { headers: { Authorization: `Bearer ${token}` } }),

  addAddress: (token: string, data: any) =>
    fetchApi<{ address: any }>('/user/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  updateAddress: (token: string, id: string, data: any) =>
    fetchApi<{ address: any }>(`/user/addresses/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  deleteAddress: (token: string, id: string) =>
    fetchApi<{ message: string }>(`/user/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  setDefaultAddress: (token: string, id: string) =>
    fetchApi<{ message: string }>(`/user/addresses/${id}/default`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Orders
  getOrderHistory: (token: string, params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<{ total: number; page: number; limit: number; totalPages: number; orders: any[] }>(
      `/user/orders?${searchParams.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  },

  getOrderDetail: (token: string, id: string) =>
    fetchApi<{ order: any }>(`/user/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  reorder: (token: string, id: string) =>
    fetchApi<{ cartItems: any[]; message: string }>(`/user/orders/${id}/reorder`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Consumption Profile
  getConsumptionProfile: (token: string) =>
    fetchApi<{ profile: any; loyalty: any }>('/user/consumption-profile', { headers: { Authorization: `Bearer ${token}` } }),

  // Promotions
  getPersonalizedPromotions: (token: string) =>
    fetchApi<{ promotions: any[] }>('/user/promotions', { headers: { Authorization: `Bearer ${token}` } }),

  applyPromotion: (token: string, code: string) =>
    fetchApi<{ success: boolean; promotion: any }>('/user/promotions/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    }),
}

// ===== UTILITÁRIOS =====
export const formatPrice = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const getUnitLabel = (unit: Product['unit']): string => {
  const labels: Record<Product['unit'], string> = {
    KG: 'kg', G: 'g', L: 'litro', ML: 'ml',
    UN: 'unidade', PACK: 'pacote', BOX: 'caixa', BUNCH: 'maço',
  };
  return labels[unit] || unit;
};

export const getDisplayPrice = (product: Product): { price: string; unit: string } => {
  if (product.isWeighed && product.pricePerKg) {
    return { price: formatPrice(product.pricePerKg), unit: '/kg' };
  }
  const salePrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  return { price: formatPrice(salePrice), unit: `/${getUnitLabel(product.unit)}` };
};