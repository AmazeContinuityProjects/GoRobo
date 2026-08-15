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
    "Delivery: Buzz (instant, within 1 hr in Chennai) or Standard (1 day).",
    "Please apply the flat 2% off offer.",
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

// Pre-filled WhatsApp message for a whole cart order.
export function buildCartInquiryUrl(lines: CartLine[]): string {
  const itemLines = lines.map(
    ({ product, qty }) =>
      `• ${product.name} × ${qty} — ${formatINR(product.price)} each (${formatINR(product.price * qty)})`,
  )
  const total = lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0)
  const text = [
    "Hi Go RoBo, I'd like to order:",
    "",
    ...itemLines,
    "",
    `Total: ${formatINR(total)} (excl. tax)`,
    "",
    "Delivery: Buzz (instant, within 1 hr in Chennai) or Standard (1 day).",
    "Please apply the flat 2% off offer.",
    `Please share availability and details. (Ref email: ${CONTACT_EMAIL})`,
  ].join("\n")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
