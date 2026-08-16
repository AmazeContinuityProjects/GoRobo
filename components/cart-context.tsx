"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { products, type Product } from "@/lib/products"

export type CartItem = { productId: string; qty: number }
export type CartLine = { product: Product; qty: number }

const STORAGE_KEY = "gorobo-cart-v2"

type CartContextValue = {
  items: CartItem[]
  lines: CartLine[]
  count: number
  total: number
  addItem: (product: Product, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadStored(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.productId === "string" &&
        typeof entry.qty === "number" &&
        entry.qty > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Restore the persisted cart AFTER hydration so the server HTML always
  // matches the first client render.
  useEffect(() => {
    setItems(loadStored())
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.productId === product.id)
      if (existing) {
        return prev.map((entry) =>
          entry.productId === product.id ? { ...entry, qty: entry.qty + qty } : entry,
        )
      }
      return [...prev, { productId: product.id, qty }]
    })
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((entry) => entry.productId !== productId)
        : prev.map((entry) => (entry.productId === productId ? { ...entry, qty } : entry)),
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((entry) => entry.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const lines = useMemo<CartLine[]>(
    () =>
      items
        .map((entry) => {
          const product = products.find((p) => p.id === entry.productId)
          return product ? { product, qty: entry.qty } : null
        })
        .filter((line): line is CartLine => line !== null),
    [items],
  )

  const count = useMemo(() => items.reduce((sum, entry) => sum + entry.qty, 0), [items])
  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.qty, 0),
    [lines],
  )

  return (
    <CartContext.Provider
      value={{ items, lines, count, total, addItem, setQty, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}