"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  GitFork,
  Heart,
  History,
  Info,
  LayoutGrid,
  List,
  ListFilter,
  Mail,
  MessageCircle,
  Radio,
  SearchX,
} from "lucide-react"
import {
  Badge,
  Button,
  EmptyState,
  FabSpeedDial,
  IconBadge,
  Label,
  PageHeader,
  ProgressBar,
  SearchInput,
  SectionHeader,
  Skeleton,
  Switch,
  Text,
  View,
  ViewModeToggle,
} from "@amazecontinuityprojects/amazeui"
import { ProductCard } from "@/components/product-card"
import { ProductDialog } from "@/components/product-dialog"
import { ResponsiveButton } from "@/components/responsive-button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { CartButton } from "@/components/cart-button"
import { PromoStrip } from "@/components/promo-strip"
import { useCatalog } from "@/components/catalog-context"
import { type Product } from "@/lib/products"
import { CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_CHANNEL_URL, buildGeneralInquiryUrl } from "@/lib/contact"
import { GITHUB_REPO_URL } from "@/lib/site"

const PAGE_SIZE = 12

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
]

export function Catalog() {
  const router = useRouter()
  const { activeCategory, setActiveCategory, items } = useCatalog()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("featured")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const itemCategories = useMemo(
    () => Array.from(new Set(items.map((p) => p.category))).sort(),
    [items]
  )

  // Brief skeleton on first mount to showcase loading state.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = items.filter((p) => {
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
  }, [query, activeCategory, inStockOnly, sort, items])

  useEffect(() => {
    setPage(1)
  }, [query, activeCategory, inStockOnly, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const paged = filtered.slice(start, start + PAGE_SIZE)
  const shownCount = Math.min(start + PAGE_SIZE, filtered.length)

  const countFor = (category: string) => items.filter((p) => p.category === category).length

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
    <div>
      <header className="bg-background">
        <div className="flex flex-col gap-4 px-4 pt-2 pb-4 sm:px-6 sm:mr-8">
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
                  {items.length} components
                </Badge>
                <Badge variant="purple" size="sm">
                  {itemCategories.length} categories
                </Badge>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Robotics &amp; DIY Electronics
                </span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <CartButton />
                <ResponsiveButton
                  icon={<Radio className="size-4 shrink-0" aria-hidden="true" />}
                  label="Channel"
                  aria-label="Join the Go RoBo channel for updates and offers"
                  onClick={() => window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer")}
                />
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Open Source on GitFork"
                  title="Open Source on GitFork"
                  onClick={() => window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer")}
                >
                  <GitFork className="size-4" aria-hidden="true" />
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

        </div>
      </header>

      <main className="px-4 pt-0 pb-6 sm:px-6 sm:mr-8">
        <PromoStrip />

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

        <div className="mt-4 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by title..."
              aria-label="Search products by title"
            />
          </div>
          <FilterMenu
            open={sortOpen}
            onOpenChange={setSortOpen}
            icon={<ArrowUpDown className="size-4" aria-hidden="true" />}
            label="Sort products"
            active={sort !== "featured"}
          >
            <div className="flex flex-col gap-1.5">
              <Label>Sort by</Label>
              <div className="-mx-1 flex flex-col gap-1 px-1">
                {SORT_OPTIONS.map((option) => (
                  <MenuOption
                    key={option.value}
                    active={sort === option.value}
                    label={option.label}
                    onClick={() => {
                      setSort(option.value)
                      setSortOpen(false)
                    }}
                  />
                ))}
              </div>
            </div>
          </FilterMenu>
          <FilterMenu
            open={filterOpen}
            onOpenChange={setFilterOpen}
            icon={<ListFilter className="size-4" aria-hidden="true" />}
            label="Filter by category"
            active={activeCategory !== null || inStockOnly}
            className="w-80"
          >
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <div className="-mx-1 flex max-h-64 flex-col gap-1 overflow-y-auto px-1">
                <MenuOption
                  active={activeCategory === null}
                  label="All Categories"
                  count={items.length}
                  onClick={() => {
                    setActiveCategory(null)
                    setFilterOpen(false)
                  }}
                />
                {itemCategories.map((category) => (
                  <MenuOption
                    key={category}
                    active={activeCategory === category}
                    label={category}
                    count={countFor(category)}
                    onClick={() => {
                      setActiveCategory(category)
                      setFilterOpen(false)
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
                <Label className="cursor-pointer" onClick={() => setInStockOnly((v) => !v)}>
                  In stock only
                </Label>
              </div>
            </div>
          </FilterMenu>
        </div>

        {/*
          Mobile-only category chips (disabled: the category filter icon in the
          search row covers filtering on every platform).
        <nav aria-label="Filter by category" className="mt-5 flex flex-wrap gap-2 md:hidden">
          <CategoryChip
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            label="All"
            count={items.length}
          />
          {itemCategories.map((category) => (
            <CategoryChip
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              label={category}
              count={countFor(category)}
            />
          ))}
        </nav>
        */}

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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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

        <nav aria-label="Site pages" className="mb-8 flex flex-wrap items-center justify-start gap-3 md:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-label="About"
            title="About"
            onClick={() => router.push("/about")}
          >
            <Info className="size-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Hall of Fame"
            title="Hall of Fame"
            onClick={() => router.push("/hall-of-fame")}
          >
            <Heart className="size-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Changelog"
            title="Changelog"
            onClick={() => router.push("/changelog")}
          >
            <History className="size-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open Source on GitHub"
            title="Open Source on GitHub"
            onClick={() => window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer")}
          >
            <GitFork className="size-5" aria-hidden="true" />
          </Button>
        </nav>

        <View className="flex flex-col items-center gap-2 py-4 pb-24 text-center sm:pb-4">
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

function FilterMenu({
  open,
  onOpenChange,
  icon,
  label,
  active,
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: React.ReactNode
  label: string
  active: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Button
        variant={active ? "primary" : "outline"}
        size="icon-sm"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {icon}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => onOpenChange(false)} />
          <View
            className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md ${className ?? ""}`}
          >
            {children}
          </View>
        </>
      )}
    </div>
  )
}

function MenuOption({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
      }`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <Badge variant={active ? "success" : "default"} size="sm">
          {count}
        </Badge>
      )}
    </button>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
