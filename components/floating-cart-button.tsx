"use client"

import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-context"

export function FloatingCartButton() {
  const router = useRouter()
  const { count } = useCart()

  return (
    <button
      type="button"
      onClick={() => router.push("/cart")}
      aria-label={count > 0 ? `View Cart, ${count} items` : "View Cart"}
      title="View Cart"
      className="fixed bottom-6 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-xl transition-all duration-200 hover:bg-muted/80 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <ShoppingCart className="size-6 text-foreground" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-primary-foreground shadow-md ring-2 ring-background animate-in zoom-in duration-200">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  )
}
