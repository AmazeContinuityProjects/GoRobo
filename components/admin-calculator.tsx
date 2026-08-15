"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  IconBadge,
  Input,
  Label,
  PageHeader,
  SearchInput,
  Select,
  Switch,
  Text,
  View,
} from "@amazecontinuityprojects/amazeui"
import {
  Cpu,
  LogOut,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react"
import { type Product, formatINR } from "@/lib/products"
import { signOutAction } from "@/app/admin/actions"

type CartLine = { product: Product; qty: number }

const DISCOUNT_RATE = 0.02 // flat 2% off

export function AdminCalculator({
  userName,
  products,
}: {
  userName: string
  products: Product[]
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [applyDiscount, setApplyDiscount] = useState(true)
  const [gstPercent, setGstPercent] = useState("18")
  const [isSigningOut, startSignOut] = useTransition()

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q)
      const matchesCategory = category === "all" || p.category === category
      return matchesQuery && matchesCategory
    })
  }, [products, query, category])

  const lines = useMemo(() => Object.values(cart), [cart])

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.product.baseCost * l.qty, 0)
    const itemCount = lines.reduce((sum, l) => sum + l.qty, 0)
    const discount = applyDiscount ? subtotal * DISCOUNT_RATE : 0
    const taxable = subtotal - discount
    const gstRate = Math.max(0, Number(gstPercent) || 0) / 100
    const gst = taxable * gstRate
    const grandTotal = taxable + gst
    return { subtotal, itemCount, discount, taxable, gst, grandTotal }
  }, [lines, applyDiscount, gstPercent])

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev[product.id]
      return {
        ...prev,
        [product.id]: { product, qty: existing ? existing.qty + 1 : 1 },
      }
    })
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { ...prev[id], qty } }
    })
  }

  function removeLine(id: string) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Cpu className="size-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <Text className="text-sm font-semibold text-foreground">Go RoBo Admin</Text>
              <Text className="text-xs text-muted-foreground">Cost Calculator</Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">
              {userName}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isSigningOut}
              onClick={() => startSignOut(() => signOutAction())}
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <PageHeader
          title="Cost Calculator"
          meta={<Text className="text-sm text-muted-foreground">Add products to the cart to calculate base-cost totals.</Text>}
        />

        <Alert variant="info" className="mb-5 mt-4 text-xs">
          All amounts use the <span className="font-semibold">base supplier cost</span> (excluding margin). Internal use
          only.
        </Alert>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Product picker */}
          <section aria-label="Products">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search 317 products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="sm:w-52">
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { label: "All categories", value: "all" },
                    ...categories.map((c) => ({ label: c, value: c })),
                  ]}
                />
              </div>
            </div>

            <Text className="mb-2 text-xs text-muted-foreground">
              Showing {filtered.length} of {products.length} products
            </Text>

            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={
                    <IconBadge color="pink" size="lg">
                      <X className="size-6" aria-hidden="true" />
                    </IconBadge>
                  }
                  title="No products found"
                  description="Try a different search term or category."
                />
              ) : (
                filtered.map((p) => {
                  const inCart = cart[p.id]?.qty ?? 0
                  return (
                    <Card key={p.id} className="border-border">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <Text className="truncate text-sm font-medium text-foreground">{p.name}</Text>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Text className="text-xs text-muted-foreground">{p.category}</Text>
                            <Text className="text-xs font-semibold text-foreground">{formatINR(p.baseCost)}</Text>
                          </div>
                        </div>
                        <Button size="sm" className="gap-1.5 whitespace-nowrap" onClick={() => addToCart(p)}>
                          <Plus className="size-4" aria-hidden="true" />
                          Add
                          {inCart > 0 ? <span className="ml-0.5">({inCart})</span> : null}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </section>

          {/* Cart + totals */}
          <aside aria-label="Cart" className="lg:sticky lg:top-20 lg:self-start">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="size-4 text-foreground" aria-hidden="true" />
                    <Text className="text-sm font-semibold text-foreground">Cart</Text>
                    <Badge variant="default" size="sm">
                      {totals.itemCount}
                    </Badge>
                  </div>
                  {lines.length > 0 ? (
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={() => setCart({})}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      Clear
                    </Button>
                  ) : null}
                </div>

                {lines.length === 0 ? (
                  <Text className="py-8 text-center text-sm text-muted-foreground">
                    No items yet. Add products from the list.
                  </Text>
                ) : (
                  <div className="flex max-h-[38vh] flex-col gap-2 overflow-y-auto pr-1">
                    {lines.map(({ product, qty }) => (
                      <View key={product.id} className="rounded-lg border border-border p-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <Text className="flex-1 text-xs font-medium text-foreground">{product.name}</Text>
                          <button
                            type="button"
                            aria-label={`Remove ${product.name}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeLine(product.id)}
                          >
                            <X className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Decrease quantity"
                              onClick={() => setQty(product.id, qty - 1)}
                            >
                              <Minus className="size-3.5" aria-hidden="true" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium text-foreground">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Increase quantity"
                              onClick={() => setQty(product.id, qty + 1)}
                            >
                              <Plus className="size-3.5" aria-hidden="true" />
                            </Button>
                          </div>
                          <Text className="text-sm font-semibold text-foreground">
                            {formatINR(product.baseCost * qty)}
                          </Text>
                        </div>
                      </View>
                    ))}
                  </div>
                )}

                {/* Options */}
                <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Apply 2% off</span>
                    <Switch checked={applyDiscount} onCheckedChange={setApplyDiscount} />
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="gst" className="text-sm text-foreground">
                      GST %
                    </Label>
                    <Input
                      id="gst"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={gstPercent}
                      onChange={(e) => setGstPercent(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
                  <Row label="Subtotal" value={formatINR(totals.subtotal)} />
                  {applyDiscount ? (
                    <Row label="Discount (2%)" value={`- ${formatINR(totals.discount)}`} accent="success" />
                  ) : null}
                  <Row label={`GST (${Number(gstPercent) || 0}%)`} value={`+ ${formatINR(totals.gst)}`} />
                  <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                    <Text className="text-sm font-semibold text-foreground">Grand total</Text>
                    <Text className="text-base font-bold text-primary">{formatINR(totals.grandTotal)}</Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "success"
}) {
  return (
    <div className="flex items-center justify-between">
      <Text className="text-muted-foreground">{label}</Text>
      <Text className={accent === "success" ? "font-medium text-primary" : "font-medium text-foreground"}>{value}</Text>
    </div>
  )
}
