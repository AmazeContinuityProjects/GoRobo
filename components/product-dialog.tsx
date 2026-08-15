"use client"

import { useEffect, useState } from "react"
import { Hash, IndianRupee, MessageCircle, PackageCheck, Tag } from "lucide-react"
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Image,
  InfoRow,
  Input,
  Label,
  Modal,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
} from "@amazecontinuityprojects/amazeui"
import { formatINR, type Product } from "@/lib/products"
import { buildInquiryUrl } from "@/lib/contact"

type ProductDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const [name, setName] = useState("")
  const [qty, setQty] = useState("1")
  const [note, setNote] = useState("")
  const [agree, setAgree] = useState(false)

  // Reset the form each time a new product is opened.
  useEffect(() => {
    if (open) {
      setName("")
      setQty("1")
      setNote("")
      setAgree(false)
    }
  }, [open, product?.id])

  if (!open || !product) return null

  const submit = () => {
    const url = buildInquiryUrl(product, {
      name: name.trim() || undefined,
      qty: Number(qty) || 1,
      note: note.trim() || undefined,
    })
    window.open(url, "_blank", "noopener,noreferrer")
    onOpenChange(false)
  }

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      maxWidth="max-w-2xl"
      noPadding
      className="overflow-hidden"
    >
      <div className="max-h-[90vh] overflow-y-auto p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-pretty text-base font-semibold text-foreground">{product.name}</h2>
            <span className="inline-flex">
              <Badge variant="default" size="sm">
                {product.category}
              </Badge>
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary/40 p-4">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="size-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">
                  Details
                </TabsTrigger>
                <TabsTrigger value="inquiry" className="flex-1">
                  Inquiry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 flex flex-col gap-3">
                {product.description && (
                  <Text className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </Text>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold text-card-foreground">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">excl. tax</span>
                </div>
                <span className="inline-flex">
                  <Badge variant={product.inStock ? "success" : "danger"} size="md">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </span>

                <div className="my-1 h-px bg-border" role="separator" />

                <InfoRow icon={<Tag className="size-4" aria-hidden="true" />}>
                  Category: {product.category}
                </InfoRow>
                <InfoRow icon={<IndianRupee className="size-4" aria-hidden="true" />}>
                  {formatINR(product.price)} (tax extra)
                </InfoRow>
                <InfoRow icon={<PackageCheck className="size-4" aria-hidden="true" />}>
                  {product.inStock ? "Ready to ship" : "Currently unavailable"}
                </InfoRow>
                <InfoRow icon={<Hash className="size-4" aria-hidden="true" />}>
                  SKU: GR-{product.id.padStart(4, "0")}
                </InfoRow>

                <Alert variant="info" className="mt-1 text-xs">
                  Final invoice adds applicable GST. Bulk pricing available on request.
                </Alert>
              </TabsContent>

              <TabsContent value="inquiry" className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inq-name">Your name</Label>
                  <Input
                    id="inq-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Kumar"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inq-qty">Quantity</Label>
                  <Input
                    id="inq-qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inq-note">Note (optional)</Label>
                  <Textarea
                    id="inq-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any specific requirement..."
                    rows={3}
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
                  Send this inquiry to Go RoBo via WhatsApp
                </label>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="w-full gap-1.5 sm:w-auto" disabled={!agree} onClick={submit}>
            <MessageCircle className="size-4" aria-hidden="true" />
            Send inquiry on WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  )
}
