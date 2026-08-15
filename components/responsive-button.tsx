"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Button, cn, type ButtonProps } from "@amazecontinuityprojects/amazeui"

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

type ResponsiveButtonProps = Omit<ButtonProps, "children"> & {
  icon: ReactNode
  label: ReactNode
  /** Always collapse to icon-only below this Tailwind breakpoint. */
  collapseBelow?: Breakpoint
}

const BREAKPOINT_PX: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

/**
 * Button with an icon + label that automatically collapses to icon-only when
 * its label can no longer fit inside the parent container (viewport shrink),
 * or unconditionally below the `collapseBelow` breakpoint.
 */
export function ResponsiveButton({
  icon,
  label,
  className,
  size = "sm",
  collapseBelow,
  ...props
}: ResponsiveButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [fitCollapsed, setFitCollapsed] = useState(false)
  const fitCollapsedRef = useRef(false)
  const fullWidthRef = useRef(0)
  const [below, setBelow] = useState(false)

  useEffect(() => {
    if (!collapseBelow) return
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_PX[collapseBelow] - 0.02}px)`)
    const onChange = (e: MediaQueryListEvent) => setBelow(e.matches)
    setBelow(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [collapseBelow])

  useEffect(() => {
    const el = btnRef.current
    const parent = el?.parentElement
    if (!el || !parent) return

    const update = () => {
      const available = parent.clientWidth
      if (fitCollapsedRef.current) {
        if (fullWidthRef.current > 0 && available >= fullWidthRef.current) {
          fitCollapsedRef.current = false
          setFitCollapsed(false)
        }
      } else {
        fullWidthRef.current = el.scrollWidth
        if (fullWidthRef.current > available + 2) {
          fitCollapsedRef.current = true
          setFitCollapsed(true)
        }
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(parent)
    window.addEventListener("resize", update)
    if (document.fonts?.ready) {
      document.fonts.ready.then(update).catch(() => {})
    }
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  const collapsed = below || fitCollapsed

  return (
    <Button
      ref={btnRef}
      className={cn("flex-row gap-1.5", collapsed && "w-8 px-0", className)}
      size={collapsed ? "icon-sm" : size}
      aria-label={collapsed && typeof label === "string" ? label : props["aria-label"]}
      {...props}
    >
      {icon}
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Button>
  )
}
