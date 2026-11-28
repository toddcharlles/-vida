/**
 * Utilitário para integrar imagens importadas do Open Food Facts
 * com os produtos do catálogo.
 */

// Tipos genéricos para aceitar tanto catalog quanto API products
interface ProductWithImage {
  id: string
  barcode?: string | null
  name: string
  image?: string | null
  [key: string]: any
}

interface ImportedImage {
  barcode: string
  name: string
  brand: string
  category: string
  searchTerm: string
  imageUrl: string
  imageFrontUrl?: string
  packaging?: string
  quantity?: string
  licenses: string[]
  source: string
  fetchedAt: string
}

/**
 * Carrega as imagens importadas do arquivo JSON.
 * Usa import dinâmico para evitar bundle no build se não necessário.
 */
export async function loadImportedImages(): Promise<ImportedImage[]> {
  try {
    const response = await fetch('/product-images.json')
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

/**
 * Cria um mapa de código de barras -> URL da imagem para busca rápida.
 */
export function createImageMap(images: ImportedImage[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const img of images) {
    const url = img.imageFrontUrl || img.imageUrl
    if (url && !map.has(img.barcode)) {
      map.set(img.barcode, url)
    }
  }
  return map
}

/**
 * Retorna a URL da imagem para um produto, buscando no mapa de imagens importadas.
 * Se não encontrar, retorna a imagem original do produto ou placeholder.
 */
export function getProductImageUrl(product: ProductWithImage, imageMap: Map<string, string>): string {
  if (product.barcode && imageMap.has(product.barcode)) {
    return imageMap.get(product.barcode)!
  }
  return product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23edf1e9" width="200" height="200"/%3E%3Ctext x="100" y="110" text-anchor="middle" font-size="14" fill="%238b9b8d"%3ESem imagem%3C/text%3E%3C/svg%3E'
}

/**
 * Match produtos com imagens importadas baseado no nome (fallback quando não tem barcode).
 */
export function matchImagesByName(products: ProductWithImage[], images: ImportedImage[]): Map<string, string> {
  const map = new Map<string, string>()

  const normalize = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

  const imageByName = new Map<string, ImportedImage>()
  for (const img of images) {
    const key = normalize(img.name)
    if (!imageByName.has(key)) {
      imageByName.set(key, img)
    }
  }

  for (const product of products) {
    if (product.barcode && map.has(product.barcode)) continue

    const key = normalize(product.name)
    const match = imageByName.get(key)
    if (match) {
      map.set(product.id, match.imageFrontUrl || match.imageUrl)
    }
  }

  return map
}

/**
 * Combina busca por barcode e por nome para máxima cobertura.
 */
export function createCombinedImageMap(products: ProductWithImage[], images: ImportedImage[]): Map<string, string> {
  const byBarcode = createImageMap(images)
  const byName = matchImagesByName(products, images)

  const combined = new Map<string, string>()

  for (const [barcode, url] of byBarcode) {
    combined.set(barcode, url)
  }

  for (const [productId, url] of byName) {
    if (!combined.has(productId)) {
      combined.set(productId, url)
    }
  }

  return combined
}

/**
 * Hook React para usar imagens importadas no componente.
 * Carrega as imagens uma vez e memoiza o mapa.
 */
import { useEffect, useState } from 'react'

export function useProductImages(products: ProductWithImage[]) {
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadImportedImages().then(images => {
      if (cancelled) return
      const map = createCombinedImageMap(products, images)
      setImageMap(map)
      setLoaded(true)
    })

    return () => { cancelled = true }
  }, [products])

  const getImageUrl = (product: ProductWithImage): string => {
    // Tenta por barcode primeiro
    if (product.barcode && imageMap.has(product.barcode)) {
      return imageMap.get(product.barcode)!
    }
    // Tenta por ID (match por nome)
    if (imageMap.has(product.id)) {
      return imageMap.get(product.id)!
    }
    // Fallback para imagem original ou placeholder
    return product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23edf1e9" width="200" height="200"/%3E%3Ctext x="100" y="110" text-anchor="middle" font-size="14" fill="%238b9b8d"%3ESem imagem%3C/text%3E%3C/svg%3E'
  }

  return { getImageUrl, loaded, imageMap }
}