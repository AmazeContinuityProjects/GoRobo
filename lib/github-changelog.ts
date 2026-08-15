import { GITHUB_REPO_API } from "@/lib/site"

export interface GitHubCommit {
  sha: string
  shortSha: string
  message: string
  cleanMessage: string
  type: "feat" | "fix" | "refactor" | "docs" | "style" | "perf" | "chore" | "other"
  authorName: string
  date: string
  formattedDate: string
  url: string
}

export interface CommitGroup {
  date: string
  commits: GitHubCommit[]
}

let memoryCache: { data: GitHubCommit[]; timestamp: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

export function parseCommitType(message: string): GitHubCommit["type"] {
  const lower = message.toLowerCase()
  if (lower.startsWith("feat")) return "feat"
  if (lower.startsWith("fix")) return "fix"
  if (lower.startsWith("refactor")) return "refactor"
  if (lower.startsWith("perf")) return "perf"
  if (lower.startsWith("docs")) return "docs"
  if (lower.startsWith("style")) return "style"
  if (lower.startsWith("chore")) return "chore"
  return "other"
}

export function cleanCommitMessage(message: string): string {
  const firstLine = message.split("\n")[0].trim()
  return firstLine.replace(/^(feat|fix|refactor|docs|style|perf|chore)(\([^)]+\))?:\s*/i, "")
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export async function fetchGitHubCommits(perPage = 30): Promise<GitHubCommit[] | null> {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data
  }

  try {
    const res = await fetch(`${GITHUB_REPO_API}/commits?per_page=${perPage}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null

    const raw = (await res.json()) as {
      sha: string
      commit: {
        message: string
        author: { name: string; date: string }
      }
      html_url: string
    }[]

    const commits = raw.map((c) => {
      const message = c.commit.message
      return {
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message,
        cleanMessage: cleanCommitMessage(message),
        type: parseCommitType(message),
        authorName: c.commit.author.name,
        date: c.commit.author.date,
        formattedDate: formatDate(c.commit.author.date),
        url: c.html_url,
      }
    })

    memoryCache = { data: commits, timestamp: Date.now() }
    return commits
  } catch {
    return null
  }
}

export function groupCommitsByDate(commits: GitHubCommit[]): CommitGroup[] {
  const groups = new Map<string, GitHubCommit[]>()
  for (const commit of commits) {
    const date = commit.date.slice(0, 10)
    const list = groups.get(date) ?? []
    list.push(commit)
    groups.set(date, list)
  }
  return [...groups.entries()].map(([date, list]) => ({ date, commits: list }))
}