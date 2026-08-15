"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  Percent,
  Radio,
  SearchX,
  Truck,
  Zap,
} from "lucide-react"
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  EmptyState,
  FabSpeedDial,
  IconBadge,
  Label,
  OptionPicker,
  PageHeader,
  ProgressBar,
  SearchInput,
  SectionHeader,
  Select,
  Skeleton,
  Switch,
  Text,
  ThemeSwitcher,
  View,
  ViewModeToggle,
} from "@amazecontinuityprojects/amazeui"
import { ProductCard } from "@/components/product-card"
import { ProductDialog } from "@/components/product-dialog"
import { categories, products, type Product } from "@/lib/products"
import { CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_CHANNEL_URL, buildGeneralInquiryUrl } from "@/lib/contact"

const PAGE_SIZE = 12

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
]

export function Catalog() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("featured")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Brief skeleton on first mount to showcase loading state.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => {
      const matchesQuery = q === "" || p.name.toLowerCase().includes(q)
      const matchesCategory = activeCategory === null || p.category === activeCategory
      const matchesStock = !inStockOnly || p.inStock
      return matchesQuery && matchesCategory && matchesStock
    })

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price)
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price)
      case "name-asc":
        return [...list].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return list
    }
  }, [query, activeCategory, inStockOnly, sort])

  useEffect(() => {
    setPage(1)
  }, [query, activeCategory, inStockOnly, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const paged = filtered.slice(start, start + PAGE_SIZE)
  const shownCount = Math.min(start + PAGE_SIZE, filtered.length)

  const countFor = (category: string) => products.filter((p) => p.category === category).length

  const categoryOptions = useMemo(
    () => [
      { value: "__all__", label: `All Categories (${products.length})` },
      ...categories.map((c) => ({ value: c, label: `${c} (${countFor(c)})` })),
    ],
    [],
  )

  const openProduct = (p: Product) => {
    setSelected(p)
    setDialogOpen(true)
  }

  const resetFilters = () => {
    setQuery("")
    setActiveCategory(null)
    setInStockOnly(false)
    setSort("featured")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "#" },
              { label: "Shop", href: "#" },
              { label: activeCategory ?? "All Components", active: true },
            ]}
          />

          <PageHeader
            icon={
              <IconBadge color="emerald" size="md">
                <Cpu className="size-5" aria-hidden="true" />
              </IconBadge>
            }
            title="Go RoBo"
            meta={
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {products.length} components
                </Badge>
                <Badge variant="purple" size="sm">
                  {categories.length} categories
                </Badge>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Robotics &amp; DIY Electronics
                </span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Button
                  size="sm"
                  className="gap-1.5 whitespace-nowrap"
                  aria-label={`Chat with Go RoBo on WhatsApp at ${CONTACT_PHONE}`}
                  title={CONTACT_PHONE}
                  onClick={() => window.open(buildGeneralInquiryUrl(), "_blank", "noopener,noreferrer")}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 whitespace-nowrap"
                  aria-label="Join the Go RoBo WhatsApp channel"
                  onClick={() => window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer")}
                >
                  <Radio className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Join Channel</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Email Go RoBo at ${CONTACT_EMAIL}`}
                  onClick={() => window.open(`mailto:${CONTACT_EMAIL}`)}
                >
                  <Mail className="size-4" aria-hidden="true" />
                </Button>
              </div>
            }
          />

          <SearchInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by title..."
            aria-label="Search products by title"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Alert variant="success" className="mb-4 text-xs">
          <span className="font-semibold">Limited-time offer:</span> Get a flat 2% off on every order &mdash; discount
          applied automatically at checkout.
        </Alert>

        <View className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IconBadge color="emerald" size="md">
              <Radio className="size-5" aria-hidden="true" />
            </IconBadge>
            <div>
              <Text className="text-sm font-semibold text-foreground">Join our WhatsApp Channel</Text>
              <Text className="text-xs text-muted-foreground">
                Follow Go RoBo for new arrivals, offers &amp; restock alerts.
              </Text>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={() => window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer")}
          >
            <Radio className="size-4" aria-hidden="true" />
            Join Channel
          </Button>
        </View>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <DeliveryCard
            icon={<Zap className="size-5" aria-hidden="true" />}
            color="amber"
            title="Buzz"
            detail="Instant delivery within 1 hour in Chennai"
            badge="1 hr · Chennai"
            badgeVariant="warning"
          />
          <DeliveryCard
            icon={<Truck className="size-5" aria-hidden="true" />}
            color="blue"
            title="Standard Delivery"
            detail="Delivered within 1 day"
            badge="1 day"
            badgeVariant="info"
          />
          <DeliveryCard
            icon={<Percent className="size-5" aria-hidden="true" />}
            color="emerald"
            title="2% Off"
            detail="Flat discount on all orders"
            badge="Save 2%"
            badgeVariant="success"
          />
        </div>

        <Alert variant="warning" className="mb-5 text-xs">
          All prices shown are excluding tax. Final invoice adds applicable GST.
        </Alert>

        <SectionHeader
          title="Browse Components"
          subtitle="Filter, sort and inquire about any part"
          action={
            <ViewModeToggle
              value={view}
              onChange={(k) => setView(k as "grid" | "list")}
              options={[
                { key: "grid", icon: <LayoutGrid className="size-4" />, label: "Grid" },
                { key: "list", icon: <List className="size-4" />, label: "List" },
              ]}
            />
          }
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5 sm:w-64">
            <Label>Category</Label>
            <OptionPicker
              value={activeCategory ?? "__all__"}
              onChange={(v) => setActiveCategory(v === "__all__" ? null : v)}
              options={categoryOptions}
              placeholder="All Categories"
              searchable
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:w-56">
            <Select
              label="Sort by"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              options={SORT_OPTIONS}
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto sm:pb-2">
            <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
            <Label className="cursor-pointer" onClick={() => setInStockOnly((v) => !v)}>
              In stock only
            </Label>
          </div>
        </div>

        <nav aria-label="Filter by category" className="mt-5 flex flex-wrap gap-2">
          <CategoryChip
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            label="All"
            count={products.length}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              label={category}
              count={countFor(category)}
            />
          ))}
        </nav>

        <div className="my-5 h-px bg-border" role="separator" />

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length > 0 ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge variant="default" size="md">
                Showing {start + 1}&ndash;{shownCount} of {filtered.length}
              </Badge>
              {activeCategory && (
                <Badge variant="info" size="sm">
                  {activeCategory}
                </Badge>
              )}
              <div className="ml-auto w-full max-w-[180px]">
                <ProgressBar
                  value={shownCount}
                  max={filtered.length}
                  color="emerald"
                  size="sm"
                />
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {paged.map((product) => (
                  <ProductCard key={product.id} product={product} view="grid" onView={openProduct} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paged.map((product) => (
                  <ProductCard key={product.id} product={product} view="list" onView={openProduct} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={(p) => {
                  setPage(p)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              />
            )}
          </>
        ) : (
          <View className="rounded-lg border border-dashed border-border py-6">
            <EmptyStateBlock onReset={resetFilters} />
          </View>
        )}

        <div className="my-8 h-px bg-border" role="separator" />

        <View className="flex flex-col items-center gap-2 py-4 text-center">
          <Text className="text-sm font-medium text-foreground">Go RoBo &mdash; Robotics &amp; DIY Electronics</Text>
          <Text className="text-xs text-muted-foreground">
            {CONTACT_PHONE} &middot; {CONTACT_EMAIL}
          </Text>
        </View>
      </main>

      <FabSpeedDial
        position="bottom-right"
        actions={[
          {
            icon: <MessageCircle className="size-5" />,
            label: "WhatsApp",
            onPress: () => window.open(buildGeneralInquiryUrl(), "_blank", "noopener,noreferrer"),
            variant: "primary",
          },
          {
            icon: <Radio className="size-5" />,
            label: "Join Channel",
            onPress: () => window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer"),
            variant: "success",
          },
          {
            icon: <Mail className="size-5" />,
            label: "Email",
            onPress: () => window.open(`mailto:${CONTACT_EMAIL}`),
            variant: "info",
          },
          {
            icon: <ArrowUp className="size-5" />,
            label: "Back to top",
            onPress: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            variant: "secondary",
          },
        ]}
      />

      <ProductDialog product={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function DeliveryCard({
  icon,
  color,
  title,
  detail,
  badge,
  badgeVariant,
}: {
  icon: React.ReactNode
  color: React.ComponentProps<typeof IconBadge>["color"]
  title: string
  detail: string
  badge: string
  badgeVariant: React.ComponentProps<typeof Badge>["variant"]
}) {
  return (
    <View className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <IconBadge color={color} size="md">
        {icon}
      </IconBadge>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Text className="truncate text-sm font-semibold text-foreground">{title}</Text>
          <Badge variant={badgeVariant} size="sm">
            {badge}
          </Badge>
        </div>
        <Text className="text-xs text-muted-foreground">{detail}</Text>
      </div>
    </View>
  )
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {label}
      <Badge variant={active ? "success" : "default"} size="sm">
        {count}
      </Badge>
    </button>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

function EmptyStateBlock({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState
      icon={
        <IconBadge color="pink" size="lg">
          <SearchX className="size-6" aria-hidden="true" />
        </IconBadge>
      }
      title="No products found"
      description="Try a different search term or category."
      action={
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset filters
        </Button>
      }
    />
  )
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}) {
  const pages = getPageList(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            &hellip;
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "primary" : "outline"}
            size="icon-sm"
            onClick={() => onChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className="tabular-nums"
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}

function getPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  if (left > 2) pages.push("...")
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push("...")
  pages.push(total)

  return pages
}
