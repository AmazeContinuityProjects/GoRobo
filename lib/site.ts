export const GITHUB_REPO_URL = "https://github.com/AmazeContinuityProjects/gorobo"
export const GITHUB_REPO_API = "https://api.github.com/repos/AmazeContinuityProjects/gorobo"

export const SITE_NAME = "Go RoBo"
export const SITE_TAGLINE = "Robotics & DIY Electronics, made easy."
export const SITE_VERSION = "0.2.0"
export const SITE_PLATFORM = "Web App"
export const SITE_LAST_UPDATED = "August 2026"

// Feature Toggles:
// Set to true when you want to show that Buzz (Express) delivery has extra charges on the storefront.
export const SHOW_BUZZ_EXTRA_CHARGES = false

// Amaze Continuity Projects — the organisation behind the amazeui design
// system and the sponsor that keeps Go RoBo open source.
export const AMAZE_CP_NAME = "Amaze Continuity Projects"
export const AMAZE_CP_TAGLINE =
  "We build software to keep good ideas going — supporting student projects, community tools, and open source."

// Local fallback used when the GitHub API is unreachable (or the repo is
// still brand new). Sorted newest first.
export const CHANGELOG_FALLBACK: { date: string; message: string }[] = [
  { date: "2026-08-15", message: "Add About, Hall of Fame and Changelog pages; open source on GitHub." },
  { date: "2026-08-15", message: "Add floating amazeui sidebar with category navigation and collapsed rail." },
  { date: "2026-08-15", message: "Seamless circular theme switch with accent palette picker." },
  { date: "2026-08-15", message: "Dark mode: correct token cascade and color-scheme handling." },
  { date: "2026-08-14", message: "Responsive product catalog: cards, dialog, header and footer polish." },
  { date: "2026-08-14", message: "Static export with Vercel Analytics." },
]

export const HALL_OF_FAME: {
  name: string
  author: string
  description: string
  repo?: string
}[] = [
  {
    name: "amazeui",
    author: "Amaze Continuity Projects",
    description:
      "The design system that powers this entire site — components, tokens, theming and the floating sidebar.",
  },
  {
    name: "AmazeCC",
    author: "Amaze Continuity Projects",
    description:
      "The college companion app whose architecture, serwist/PWA patterns and About experience inspired Go RoBo.",
    repo: "https://github.com/AmazeContinuityProjects/AmazeCC",
  },
  {
    name: "Go RoBo",
    author: "Open source community",
    description:
      "You! Every contributor, tester and customer who helps keep this catalog growing. Thank you.",
    repo: GITHUB_REPO_URL,
  },
]