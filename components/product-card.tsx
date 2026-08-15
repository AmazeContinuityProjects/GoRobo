"use client"

import { Eye, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  Image,
} from "@amazecontinuityprojects/amazeui"
import { ResponsiveButton } from "@/components/responsive-button"
import { useCart } from "@/components/cart-context"
import { formatINR, type Product } from "@/lib/products"

type ProductCardProps = {
  product: Product
  view?: "grid" | "list"
  onView?: (product: Product) => void
}

export function ProductCard({ product, view = "grid", onView }: ProductCardProps) {
  const { items, addItem, setQty, removeItem } = useCart()
  const cartItem = items.find((i) => i.productId === product.id)
  const quantity = cartItem?.qty ?? 0

  if (view === "list") {
    return (
      <Card hover className="flex flex-row items-stretch gap-0 overflow-hidden !p-0">
        <div className="aspect-square w-28 shrink-0 border-r border-border bg-secondary/40 p-2 sm:w-36">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className="size-full object-contain"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <div>
            <Badge variant="default" size="sm">
              {product.category}
            </Badge>
          </div>
          <CardTitle className="text-pretty text-sm font-medium leading-relaxed">
            {product.name}
          </CardTitle>
          <div>
            <Badge variant={product.inStock ? "success" : "danger"} size="sm">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <div>
              <p className="font-mono text-lg font-semibold text-card-foreground">
                {formatINR(product.price)}
              </p>
              <p className="text-xs text-muted-foreground">excl. tax</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onView?.(product)}
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="size-4" aria-hidden="true" />
              </Button>
              {quantity === 0 ? (
                <ResponsiveButton
                  icon={<ShoppingCart className="size-4 shrink-0" aria-hidden="true" />}
                  label={product.inStock ? "Add to Cart" : "Out of Stock"}
                  disabled={!product.inStock}
                  onClick={() => addItem(product)}
                  collapseBelow="sm"
                  className="w-full sm:w-auto"
                  variant="primary"
                />
              ) : (
                <div className="flex h-8 min-w-[110px] sm:min-w-[124px] items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-1 py-0.5 text-primary shadow-xs dark:bg-primary/15 dark:border-primary/40">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (quantity === 1) removeItem(product.id)
                      else setQty(product.id, quantity - 1)
                    }}
                    aria-label={`Decrease quantity of ${product.name}`}
                    className="flex size-6 items-center justify-center rounded-lg bg-background text-foreground shadow-xs transition-colors hover:bg-muted active:scale-90 cursor-pointer"
                  >
                    {quantity === 1 ? (
                      <Trash2 className="size-3 text-destructive" aria-hidden="true" />
                    ) : (
                      <Minus className="size-3" aria-hidden="true" />
                    )}
                  </button>

                  <span className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-foreground">
                    <span className="hidden sm:inline text-xs font-normal text-muted-foreground">Qty:</span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      addItem(product, 1)
                    }}
                    aria-label={`Increase quantity of ${product.name}`}
                    className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 active:scale-90 cursor-pointer"
                  >
                    <Plus className="size-3" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card hover className="group flex flex-col overflow-hidden !p-0">
      <button
        type="button"
        onClick={() => onView?.(product)}
        aria-label={`Quick view ${product.name}`}
        className="relative aspect-square overflow-hidden border-b border-border bg-secondary/40 p-3"
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
          <Eye className="size-4" aria-hidden="true" />
        </span>
      </button>

      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <Badge variant="default" size="sm">
            {product.category}
          </Badge>
        </div>

        <CardTitle className="text-pretty text-sm font-medium leading-relaxed text-card-foreground">
          {product.name}
        </CardTitle>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="font-mono text-lg font-semibold text-card-foreground">
              {formatINR(product.price)}
            </p>
            <p className="text-xs text-muted-foreground">excl. tax</p>
            <span className="mt-1 inline-flex">
              <Badge variant={product.inStock ? "success" : "danger"} size="sm">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {quantity === 0 ? (
          <ResponsiveButton
            icon={<ShoppingCart className="size-4 shrink-0" aria-hidden="true" />}
            label={product.inStock ? "Add to Cart" : "Out of Stock"}
            disabled={!product.inStock}
            onClick={() => addItem(product)}
            collapseBelow="sm"
            className="w-full"
            variant="primary"
          />
        ) : (
          <div className="flex h-9 w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-1 py-1 text-primary shadow-xs dark:bg-primary/15 dark:border-primary/40">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (quantity === 1) {
                  removeItem(product.id)
                } else {
                  setQty(product.id, quantity - 1)
                }
              }}
              aria-label={`Decrease quantity of ${product.name}`}
              className="flex size-7 items-center justify-center rounded-lg bg-background text-foreground shadow-xs transition-colors hover:bg-muted active:scale-90 cursor-pointer"
            >
              {quantity === 1 ? (
                <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
              ) : (
                <Minus className="size-3.5" aria-hidden="true" />
              )}
            </button>

            <span className="flex items-center gap-1 font-mono text-sm font-bold text-foreground">
              <span className="text-xs font-normal text-muted-foreground">Qty:</span>
              {quantity}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                addItem(product, 1)
              }}
              aria-label={`Increase quantity of ${product.name}`}
              className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 active:scale-90 cursor-pointer"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
