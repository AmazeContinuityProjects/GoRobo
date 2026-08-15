"use client"

import { Eye, ShoppingCart } from "lucide-react"
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
  const { addItem } = useCart()

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
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" size="sm">
              {product.category}
            </Badge>
            <Badge variant={product.inStock ? "success" : "danger"} size="sm">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
          <CardTitle className="text-pretty text-sm font-medium leading-relaxed">
            {product.name}
          </CardTitle>
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <div>
              <p className="font-mono text-lg font-semibold text-card-foreground">
                {formatINR(product.price)}
              </p>
              <p className="text-xs text-muted-foreground">excl. tax</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => onView?.(product)} aria-label={`Quick view ${product.name}`}>
                <Eye className="size-4" aria-hidden="true" />
              </Button>
<ResponsiveButton
                icon={<ShoppingCart className="size-4 shrink-0" aria-hidden="true" />}
                label="Add to Cart"
                disabled={!product.inStock}
                onClick={() => addItem(product)}
                collapseBelow="sm"
                className="w-full"
                variant="primary"
              />
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
<ResponsiveButton
                icon={<ShoppingCart className="size-4 shrink-0" aria-hidden="true" />}
                label={product.inStock ? "Add to Cart" : "Out of Stock"}
                disabled={!product.inStock}
                onClick={() => addItem(product)}
                collapseBelow="sm"
                className="w-full"
                variant="primary"
              />
      </CardFooter>
    </Card>
  )
}
