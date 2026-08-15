import { formatINR, type Product } from "@/lib/products"

// Go RoBo contact details
// WhatsApp number in international format (91 = India), digits only, no "+"
export const WHATSAPP_NUMBER = "919150474495"
export const CONTACT_PHONE = "+91 91504 74495"
export const CONTACT_EMAIL = "gorobo@amazecc.com"
// WhatsApp channel to follow for updates & offers
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbDkpaL1Hsq6J5aeQf2t"

// Build a pre-filled WhatsApp inquiry link for a single product.
export function buildInquiryUrl(product: Product, extra?: { name?: string; qty?: number; note?: string }): string {
  const lines = [
    "Hi Go RoBo, I'm interested in this product:",
    "",
    `• ${product.name}`,
    `• Category: ${product.category}`,
    `• Price: ${formatINR(product.price)} (excl. tax)`,
  ]
  if (extra?.qty) lines.push(`• Quantity: ${extra.qty}`)
  if (extra?.name) lines.push(`• From: ${extra.name}`)
  if (extra?.note) lines.push(`• Note: ${extra.note}`)
  lines.push(
    "",
    "Delivery: ⚡ Buzz Delivery (Express — Chennai Only) or Normal Delivery (Standard).",
    "Please apply the flat 2% promo discount when generating the final official quote.",
    `Please share availability and details. (Ref email: ${CONTACT_EMAIL})`,
  )
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`
}

// General inquiry (no specific product).
export function buildGeneralInquiryUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Go RoBo, I'd like to inquire about your products.",
  )}`
}

export type CartLine = { product: Product; qty: number }

export type CartInquiryOptions = {
  deliveryMode?: "normal" | "buzz" | "bolt"
  name?: string
  phone?: string
  mapsUrl?: string
}

// Pre-filled WhatsApp message for a whole cart order.
export function buildCartInquiryUrl(
  lines: CartLine[],
  options?: "normal" | "buzz" | "bolt" | CartInquiryOptions,
): string {
  const opts: CartInquiryOptions =
    typeof options === "string" ? { deliveryMode: options } : options || {}
  const deliveryMode = opts.deliveryMode ?? "normal"

  const itemLines = lines.map(
    ({ product, qty }) =>
      `• ${product.name} × ${qty} — ${formatINR(product.price)} each (${formatINR(product.price * qty)})`,
  )
  const total = lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0)
  const deliveryText =
    deliveryMode === "buzz" || deliveryMode === "bolt"
      ? "• Delivery: ⚡ Buzz Delivery (Express — Chennai Only, extra delivery charges apply)"
      : "• Delivery: Normal Delivery (Standard 1-2 days)"

  const textLines = [
    "Hi Go RoBo, I'd like to place an order:",
    "",
    ...itemLines,
    "",
    `Total: ${formatINR(total)} (excl. tax)`,
    deliveryText,
  ]

  if (opts.name) textLines.push(`• Customer: ${opts.name}`)
  if (opts.phone) textLines.push(`• Phone: ${opts.phone}`)
  if (opts.mapsUrl) textLines.push(`• Location Link: ${opts.mapsUrl}`)

  textLines.push(
    "",
    "Please apply the flat 2% promo discount when generating the final official quote.",
    `Please share availability and details. (Ref email: ${CONTACT_EMAIL})`,
  )

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textLines.join("\n"))}`
}
