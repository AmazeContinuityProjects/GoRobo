"use client"

import { useState } from "react"
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import {
  Badge,
  Button,
  Image,
  Input,
  Label,
  Modal,
  Text,
  View,
} from "@amazecontinuityprojects/amazeui"
import { formatINR } from "@/lib/products"
import { buildCartInquiryUrl } from "@/lib/contact"
import { placeOrder } from "@/lib/gorobo-api"
import { useCart } from "@/components/cart-context"

type CartPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartPanel({ open, onOpenChange }: CartPanelProps) {
  const { lines, count, total, setQty, removeItem, clear } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle")
  const [error, setError] = useState("")

  const enquire = async () => {
    setError("")
    if (!name.trim()) {
      setError("Please enter your name.")
      return
    }
    const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+?91(?=\d{10}$)/, "")
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError("Enter a valid 10-digit mobile number.")
      return
    }

    setStatus("submitting")
    try {
      await placeOrder({
        name: name.trim(),
        phone: digits,
        items: lines.map((l) => ({ itemId: l.product.id, quantity: l.qty })),
      })
      window.open(buildCartInquiryUrl(lines), "_blank", "noopener,noreferrer")
      clear()
      setStatus("done")
    } catch (err) {
      setStatus("idle")
      setError(err instanceof Error ? err.message : "Could not place your inquiry. Try again.")
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={`Your Cart${count > 0 ? ` (${count})` : ""}`}
      maxWidth="max-w-xl"
      noPadding
      className="overflow-hidden"
    >
      <div className="flex max-h-[90vh] flex-col">
        {lines.length === 0 ? (
          status === "done" ? (
            <View className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <View className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="size-7 text-emerald-500" aria-hidden="true" />
              </View>
              <Text className="text-sm font-semibold text-foreground">
                Inquiry placed — sent on WhatsApp
              </Text>
              <Text className="text-xs text-muted-foreground">
                Go RoBo has your details. Expect a reply on WhatsApp shortly.
              </Text>
              <Button size="sm" className="mt-2" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </View>
          ) : (
            <View className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <View className="flex size-14 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag className="size-6 text-muted-foreground" aria-hidden="true" />
              </View>
              <Text className="text-sm font-semibold text-foreground">Your cart is empty</Text>
              <Text className="text-xs text-muted-foreground">
                Add products from the catalog, then enquire in one message.
              </Text>
              <Button size="sm" className="mt-2" onClick={() => onOpenChange(false)}>
                Browse components
              </Button>
            </View>
          )
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col divide-y divide-border">
                {lines.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center gap-3 py-3">
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/40 p-1.5">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="size-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text className="truncate text-sm font-medium text-foreground">
                        {product.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatINR(product.price)} each · {formatINR(product.price * qty)}
                      </Text>
                    </div>
                    <View className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => setQty(product.id, qty - 1)}
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </Button>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums text-foreground">
                        {qty}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Increase quantity of ${product.name}`}
                        onClick={() => setQty(product.id, qty + 1)}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </Button>
                    </View>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${product.name} from cart`}
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <View className="flex flex-col gap-3 border-t border-border px-6 py-4">
              <View className="flex items-center justify-between">
                <Text className="text-sm text-muted-foreground">Subtotal</Text>
                <Text className="font-mono text-base font-semibold text-foreground">
                  {formatINR(total)}
                </Text>
              </View>
              <Badge variant="success" size="sm" className="self-start">
                Flat 2% off applied at checkout
              </Badge>
              <Text className="text-xs text-muted-foreground">
                Prices exclude GST &mdash; the final invoice adds applicable tax.
              </Text>

              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cart-name">Your name</Label>
                  <Input
                    id="cart-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Kumar"
                    autoComplete="name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cart-phone">Phone number</Label>
                  <Input
                    id="cart-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9XXXX XXXXX"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {error && <Text className="text-xs text-red-600">{error}</Text>}

              <Button className="w-full gap-1.5" disabled={status === "submitting"} onClick={enquire}>
                <MessageCircle className="size-4" aria-hidden="true" />
                {status === "submitting" ? "Placing inquiry..." : "Enquire on WhatsApp"}
              </Button>
              <button
                type="button"
                onClick={clear}
                className="cursor-pointer text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Clear cart
              </button>
            </View>
          </>
        )}
      </div>
    </Modal>
  )
}