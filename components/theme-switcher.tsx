"use client"

import { useEffect, useState } from "react"
import { Check, Moon, Sun } from "lucide-react"
import {
  Button,
  PALETTE_OPTIONS,
  Text,
  useColorPalette,
  useTheme,
  View,
} from "@amazecontinuityprojects/amazeui"

export function animateThemeCircularExpansion(
  event: React.MouseEvent<HTMLElement> | null,
  newTheme: string,
  setTheme: (val: string) => void
) {
  if (
    typeof document === "undefined" ||
    typeof document.documentElement.animate !== "function" ||
    !("startViewTransition" in document)
  ) {
    setTheme(newTheme)
    return
  }

  const x = event && event.clientX > 0 ? event.clientX : window.innerWidth / 2
  const y = event && event.clientY > 0 ? event.clientY : window.innerHeight / 2

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const doc = document as Document & {
    startViewTransition: (cb: () => void) => { ready: Promise<void> }
  }

  const transition = doc.startViewTransition(() => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    setTheme(newTheme)
  })

  transition.ready.then(() => {
    document.documentElement.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  })
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { paletteId, setPaletteId } = useColorPalette()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = theme === "dark"

  const selectTheme = (e: React.MouseEvent<HTMLElement>, next: string) => {
    setOpen(false)
    animateThemeCircularExpansion(e, next, setTheme)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Theme and accent settings"
        aria-expanded={open}
        title="Theme & accent"
        onClick={() => setOpen((v) => !v)}
      >
        {mounted &&
          (isDark ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          ))}
      </Button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <View className="absolute left-1/2 top-full z-50 mt-1 w-52 -translate-x-1/2 rounded-2xl border border-border bg-popover shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <View className="flex flex-col gap-1 p-2">
              <Text className="px-2 pt-1 text-xs font-semibold text-muted-foreground/70">Mode</Text>
              <View className="flex flex-row gap-1">
                <button
                  type="button"
                  onClick={(e) => selectTheme(e, "light")}
                  className={`flex flex-1 flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    !isDark
                      ? "bg-info/10 text-info"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Sun className="size-4" aria-hidden="true" />
                  <Text className="text-sm">Light</Text>
                </button>
                <button
                  type="button"
                  onClick={(e) => selectTheme(e, "dark")}
                  className={`flex flex-1 flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isDark
                      ? "bg-info/10 text-info"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Moon className="size-4" aria-hidden="true" />
                  <Text className="text-sm">Dark</Text>
                </button>
              </View>

              <View className="my-1 h-px bg-border" />

              <Text className="px-2 pt-1 text-xs font-semibold text-muted-foreground/70">Accent</Text>
              <View className="grid grid-cols-2 gap-1">
                {PALETTE_OPTIONS.map((p) => {
                  const active = p.id === paletteId
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPaletteId(p.id)
                        setOpen(false)
                      }}
                      className={`flex flex-row items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-info/10 text-info"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span
                        className="size-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: p.swatches[0] }}
                        aria-hidden="true"
                      />
                      <Text className="text-xs">{p.label}</Text>
                      {active && <Check className="ml-auto size-3 shrink-0 text-info" aria-hidden="true" />}
                    </button>
                  )
                })}
              </View>
            </View>
          </View>
        </>
      )}
    </div>
  )
}