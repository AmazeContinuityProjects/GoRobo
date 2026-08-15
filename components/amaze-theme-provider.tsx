"use client"

import { ThemeProvider } from "@amazecontinuityprojects/amazeui"

export function AmazeThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  )
}
