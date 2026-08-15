"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { products as localProducts, type Product } from "@/lib/products"
import { fetchItems } from "@/lib/gorobo-api"

type CatalogContextValue = {
  activeCategory: string | null
  setActiveCategory: (category: string | null) => void
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  items: Product[]
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [items, setItems] = useState<Product[]>(localProducts)

  // Restore the persisted collapsed state AFTER hydration so the server
  // HTML (expanded) always matches the first client render.
  useEffect(() => {
    try {
      if (localStorage.getItem("gorobo-sidebar") === "collapsed") {
        setIsSidebarOpen(false)
      }
    } catch {
      // ignore
    }
  }, [])

  // Load the live catalog from the AmazeCC API; the bundled catalog is the
  // fallback while loading or when the API is unreachable.
  useEffect(() => {
    let cancelled = false
    fetchItems().then((apiItems) => {
      if (!cancelled && apiItems) setItems(apiItems)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open)
    try {
      localStorage.setItem("gorobo-sidebar", open ? "expanded" : "collapsed")
    } catch {
      // ignore
    }
  }, [])

  return (
    <CatalogContext.Provider value={{ activeCategory, setActiveCategory, isSidebarOpen, setSidebarOpen, items }}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider")
  return ctx
}