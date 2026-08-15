import { products as localProducts, type Product } from "@/lib/products"

export const AMAZE_API_URL =
  process.env.NEXT_PUBLIC_AMAZE_API_URL ?? "https://api.amazecc.com"

export type ApiItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
  image: string
}

export type OrderItemInput = { itemId: string; quantity: number }

export type PlaceOrderInput = {
  name: string
  phone: string
  items: OrderItemInput[]
  deliveryMode?: "normal" | "buzz" | "bolt"
  mapsUrl?: string
}

export type PlacedOrder = {
  id: string
  user_name: string
  phone_number: string
  items: OrderItemInput[]
  total: number
  delivery_mode?: string
  maps_url?: string
  created_at: string
}

/**
 * Fetches the live GoRoBo catalog from the AmazeCC API.
 * Returns null (caller falls back to the bundled catalog) when the API is
 * unreachable or returns an unexpected payload.
 */
export async function fetchItems(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${AMAZE_API_URL}/api/gorobo/items`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data?.success || !Array.isArray(data.items)) throw new Error("unexpected payload")

    const localById = new Map(localProducts.map((p) => [p.id, p]))
    return (data.items as ApiItem[]).map((item) => {
      const local = localById.get(item.id)
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: Number(item.price),
        // Images are bundled with the site — prefer the local file for this id.
        image:
          (local && local.image) ||
          item.image ||
          "/images/products/_placeholder.svg",
        inStock: item.inStock !== false,
      }
    })
  } catch {
    return null
  }
}

/**
 * Places a GoRoBo order (append-only) on the AmazeCC API.
 * Throws an Error with the server's message on failure.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const res = await fetch(`${AMAZE_API_URL}/api/gorobo/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(10000),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `Order could not be placed (HTTP ${res.status})`)
  }
  return data.order as PlacedOrder
}
