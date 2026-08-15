import * as React from "react"

export type GoRoboLogoProps = {
  className?: string
  alt?: string
}

export function GoRoboLogo({ className = "h-7 w-auto", alt = "Go RoBo" }: GoRoboLogoProps) {
  return (
    <span className="inline-flex items-center">
      {/* Light theme: gorobodark.svg (dark wordmark on light background) */}
      <img
        src="/gorobodark.svg"
        alt={alt}
        className={`dark:hidden ${className}`}
      />
      {/* Dark theme: gorobolight.svg (light wordmark on dark background) */}
      <img
        src="/gorobolight.svg"
        alt={alt}
        className={`hidden dark:block ${className}`}
      />
    </span>
  )
}
