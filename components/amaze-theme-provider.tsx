"use client"

import { useEffect, useRef } from "react"
import { ThemeProvider, useColorPalette, useTheme } from "@amazecontinuityprojects/amazeui"

function PaletteInitializer() {
  const { setPaletteId } = useColorPalette()

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem("club_hub_settings")
      const saved = raw ? JSON.parse(raw) : null
      const hasPalette = Boolean(saved?.colorPalette) || Boolean(localStorage.getItem("accent"))
      if (!hasPalette) setPaletteId("forest")
    } catch {
      setPaletteId("forest")
    }
  }, [setPaletteId])

  return null
}

function PaletteSyncer() {
  const { theme } = useTheme()
  const { paletteId, setPaletteId } = useColorPalette()
  const paletteRef = useRef(paletteId)
  paletteRef.current = paletteId

  useEffect(() => {
    const id = paletteRef.current
    if (id === "default") return
    setPaletteId("default")
    const raf = requestAnimationFrame(() => setPaletteId(id))
    return () => cancelAnimationFrame(raf)
  }, [theme, setPaletteId])

  return null
}

export function AmazeThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      value={{ light: "light", dark: "dark" }}
    >
      <PaletteInitializer />
      <PaletteSyncer />
      {children}
    </ThemeProvider>
  )
}