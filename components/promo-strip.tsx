"use client"

import { Info, Percent, Timer, Truck } from "lucide-react"
import { IconBadge, Text, View } from "@amazecontinuityprojects/amazeui"

function MiniCard({
  icon,
  color,
  title,
  value,
}: {
  icon: React.ReactNode
  color: React.ComponentProps<typeof IconBadge>["color"]
  title: string
  value: string
}) {
  return (
    <View className="flex min-w-0 flex-col items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 text-center sm:flex-row sm:items-center sm:text-left">
      <IconBadge color={color} size="sm">
        {icon}
      </IconBadge>
      <div className="flex min-w-0 flex-1 flex-col">
        <Text className="truncate text-sm font-semibold text-foreground">{title}</Text>
        <Text className="truncate text-xs text-muted-foreground">{value}</Text>
      </div>
    </View>
  )
}

export function PromoStrip() {
  return (
    <View className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MiniCard
        icon={<Timer className="size-4" aria-hidden="true" />}
        color="amber"
        title="Buzz"
        value="1 hr &middot; Chennai"
      />
      <MiniCard
        icon={<Truck className="size-4" aria-hidden="true" />}
        color="blue"
        title="Standard"
        value="1 day"
      />
      <MiniCard
        icon={<Percent className="size-4" aria-hidden="true" />}
        color="emerald"
        title="2% off"
        value="Every order"
      />
      <MiniCard
        icon={<Info className="size-4" aria-hidden="true" />}
        color="purple"
        title="GST"
        value="Added on invoice"
      />
    </View>
  )
}