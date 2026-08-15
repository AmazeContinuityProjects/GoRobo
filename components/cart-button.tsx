"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@amazecontinuityprojects/amazeui"
import { useCart } from "@/components/cart-context"
import { CartPanel } from "@/components/cart-panel"

export function CartButton() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        className="relative"
        aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"}
        title="Cart"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="size-4" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
      <CartPanel open={open} onOpenChange={setOpen} />
    </>
  )
}